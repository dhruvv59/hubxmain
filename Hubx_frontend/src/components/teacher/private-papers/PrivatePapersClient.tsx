"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, ArrowLeft, Filter, Loader2, X, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { PrivatePapersFilters } from "@/components/teacher/private-papers/PrivatePapersFilters";
import { PrivatePaperCard } from "@/components/teacher/private-papers/PrivatePaperCard";
import { PrivatePaper, PrivatePaperFilters as FiltersType } from "@/types/private-paper";
import { getPrivatePapers } from "@/services/private-paper-service";

// Simple debounce hook implementation if not present
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface PrivatePapersClientProps {
    initialPapers: PrivatePaper[];
    initialTotal: number;
}

export function PrivatePapersClient({ initialPapers, initialTotal }: PrivatePapersClientProps) {
    const router = useRouter();

    // Filter State
    const [filters, setFilters] = useState<FiltersType>({
        subject: "All",
        std: "All",
        difficulty: "All",
        search: "",
        sortBy: "Most Recent",
        page: 1,
        limit: 9
    });

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const [papers, setPapers] = useState<PrivatePaper[]>(initialPapers);
    const [isLoading, setIsLoading] = useState(false); // Initial load is done by server
    const [totalPapers, setTotalPapers] = useState(initialTotal);

    const debouncedSearch = useDebounceValue(filters.search, 500);

    // Fetch on mount and when filters change
    useEffect(() => {
        const fetchPapers = async () => {
            setIsLoading(true);
            try {
                const data = await getPrivatePapers({
                    ...filters,
                    search: debouncedSearch
                });
                setPapers(data.papers);
                setTotalPapers(data.total);
            } catch (error) {
                console.error("Failed to fetch papers", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPapers();
    }, [filters.subject, filters.std, filters.difficulty, filters.sortBy, filters.page, debouncedSearch]);

    const handleFilterChange = (key: keyof Omit<FiltersType, "page" | "limit">, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= Math.ceil(totalPapers / (filters.limit || 9))) {
            setFilters(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const totalPages = Math.ceil(totalPapers / (filters.limit || 9));

    return (
        <div className="max-w-[1300px] mx-auto pb-20 pt-10 px-6">
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors" suppressHydrationWarning>
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Private Papers ({totalPapers})</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9 font-medium">Discover and access quality papers created by expert teachers</p>
                </div>

                <button
                    onClick={() => router.push("/teacher/ai-assessments")}
                    className="px-6 py-2.5 bg-[#5b5bd6] hover:bg-[#4f46e5] text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 ml-9 md:ml-0"
                >
                    <span className="text-xl leading-none">+</span>
                    Create New Paper
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <PrivatePapersFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    className="hidden lg:flex"
                />

                <div className="flex-1 w-full">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-[400px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Paper by Subject or Teacher Name"
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#5b5bd6] placeholder:text-gray-400"
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                suppressHydrationWarning
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-500 flex items-center gap-2 hidden sm:flex">
                                    <Filter className="w-4 h-4" />
                                    Sort By
                                </span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                                    className="h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold text-[#5b5bd6] focus:outline-none bg-white cursor-pointer"
                                    suppressHydrationWarning
                                >
                                    <option>Most Recent</option>
                                    <option>Most Popular</option>
                                    <option>Highest Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Papers List */}
                    {isLoading ? (
                        <div className="min-h-[400px] flex items-center justify-center flex-col gap-2">
                            <Loader2 className="w-8 h-8 text-[#5b5bd6] animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading papers...</p>
                        </div>
                    ) : papers.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {papers.map(paper => (
                                    <PrivatePaperCard key={paper.id} paper={paper} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                                        disabled={(filters.page || 1) === 1}
                                        className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Prev
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Complex logic to show window of pages could go here, 
                                        // keeping it simple for < 5 pages or showing first 5 for now 
                                        // to match the "pixel perfect" aesthetic without over-engineering logic blindly.
                                        // A Sliding Window is better:
                                        let pageNum = i + 1;
                                        const currentPage = filters.page || 1;

                                        if (totalPages > 5) {
                                            // Center around current page
                                            if (currentPage > 3) {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            // Cap at totalPages
                                            if (pageNum > totalPages) return null;
                                        }

                                        if (!pageNum) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${currentPage === pageNum
                                                    ? "bg-[#eeeaff] text-[#5b5bd6]"
                                                    : "hover:bg-gray-50 text-gray-500"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && (filters.page || 1) < totalPages - 2 && (
                                        <span className="text-gray-400 text-xs">...</span>
                                    )}

                                    <button
                                        onClick={() => handlePageChange((filters.page || 1) + 1)}
                                        disabled={(filters.page || 1) === totalPages}
                                        className="px-3 py-1 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Search className="w-6 h-6 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No papers found</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Try adjusting your filters or search query to find what youre looking for.
                            </p>
                            <button
                                onClick={() => setFilters({
                                    subject: "All",
                                    std: "All",
                                    difficulty: "All",
                                    search: "",
                                    sortBy: "Most Recent",
                                    page: 1,
                                    limit: 9
                                })}
                                className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* Mobile Filters Dialog */}
            <Dialog.Root open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 lg:hidden" />
                    <Dialog.Content className="fixed inset-y-0 right-0 w-[300px] bg-white p-6 z-50 shadow-xl overflow-y-auto lg:hidden animate-slide-in-right focus:outline-none">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-gray-900">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <PrivatePapersFilters
                            filters={filters}
                            onFilterChange={(key, value) => {
                                handleFilterChange(key, value);
                                // setIsMobileFiltersOpen(false); // Optional: close on selection
                            }}
                            className="w-full shadow-none border-none p-0"
                        />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div >
    );
}

