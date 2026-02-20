"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Filter, Loader2, X, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { PrivatePapersFilters } from "@/components/teacher/private-papers/PrivatePapersFilters";
import { PrivatePaperCard } from "@/components/teacher/private-papers/PrivatePaperCard";
import { PrivatePaper, PrivatePaperFilters as FiltersType } from "@/types/private-paper";
import { getPrivatePapers } from "@/services/private-paper-service";
import { PRIVATE_PAPER_DEFAULT_FILTERS, PRIVATE_PAPER_SORT_OPTIONS } from "@/lib/filter-constants";

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
    const [filters, setFilters] = useState<FiltersType>(PRIVATE_PAPER_DEFAULT_FILTERS);

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const [papers, setPapers] = useState<PrivatePaper[]>(initialPapers);
    const [isLoading, setIsLoading] = useState(false); // Initial load is done by server
    const [totalPapers, setTotalPapers] = useState(initialTotal);

    // Dynamic Filter Options
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableStandards, setAvailableStandards] = useState<string[]>([]);

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

                // Update available filters if returned from backend
                if (data.filters) {
                    setAvailableSubjects(data.filters.subjects);
                    setAvailableStandards(data.filters.standards);
                }
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
        if (newPage >= 1 && newPage <= Math.ceil(totalPapers / (filters.limit || 10))) {
            setFilters(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const totalPages = Math.ceil(totalPapers / (filters.limit || 10));

    return (
        <div className="max-w-[1300px] mx-auto pb-20 pt-2 sm:pt-4 px-4 sm:px-6">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
                {/* Title Row with Button */}
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors shrink-0" suppressHydrationWarning>
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Papers ({totalPapers})</h1>
                    </div>
                    <button
                        onClick={() => router.push("/teacher/new-paper")}
                        className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#5b5bd6] hover:bg-[#4f46e5] text-white font-bold rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap text-sm sm:text-base"
                    >
                        <span className="text-lg sm:text-xl leading-none">+</span>
                        <span className="hidden sm:inline">Create New Paper</span>
                        <span className="sm:hidden">New Paper</span>
                    </button>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Discover and access quality papers created by expert teachers</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <PrivatePapersFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    availableSubjects={availableSubjects}
                    availableStandards={availableStandards}
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
                                    {PRIVATE_PAPER_SORT_OPTIONS.map((option) => (
                                        <option key={option}>{option}</option>
                                    ))}
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
                                    <PrivatePaperCard
                                        key={paper.id}
                                        paper={paper}
                                        onUpdate={() => {
                                            // Re-fetch papers without resetting filters completely
                                            const fetchPapers = async () => {
                                                // We can just call the effect logic again by... actually better to just trigger a re-fetch?
                                                // Or simpler, just let the card tell us to refresh.
                                                // Let's force a refresh by toggling a key or similar?
                                                // Or just expose fetchPapers? 
                                                // Simplest is to just reload the page or trigger a state change.
                                                // Let's add a `refreshKey` state to dependency array.
                                                setFilters(prev => ({ ...prev })); // This might not work if filters didn't change deep eq.
                                                // Better: Add a refresh trigger
                                                window.location.reload(); // Brute force but works for now. 
                                                // Or better: pass a refresh function.
                                            };
                                            fetchPapers();
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (() => {
                                const currentPage = filters.page || 1;
                                
                                // Smart pagination: Generate page numbers to display
                                const getPageNumbers = (): (number | string)[] => {
                                    const pages: (number | string)[] = [];
                                    const maxVisible = 5;

                                    if (totalPages <= maxVisible) {
                                        // Show all pages if total is less than max
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(i);
                                        }
                                    } else {
                                        // Smart pagination with ellipsis
                                        if (currentPage <= 3) {
                                            // Near start: show first 5 pages, then ellipsis, then last page
                                            for (let i = 1; i <= 5; i++) pages.push(i);
                                            pages.push('...');
                                            pages.push(totalPages);
                                        } else if (currentPage >= totalPages - 2) {
                                            // Near end: show first page, ellipsis, then last 5 pages
                                            pages.push(1);
                                            pages.push('...');
                                            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            // Middle: show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                                            pages.push(1);
                                            pages.push('...');
                                            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                                            pages.push('...');
                                            pages.push(totalPages);
                                        }
                                    }

                                    return pages;
                                };

                                const pageNumbers = getPageNumbers();

                                return (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Prev
                                        </button>

                                        {/* Page Numbers */}
                                        {pageNumbers.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`ellipsis-${index}`} className="text-gray-400 text-xs px-1">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const pageNum = page as number;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                                                        currentPage === pageNum
                                                            ? "bg-[#eeeaff] text-[#5b5bd6]"
                                                            : "hover:bg-gray-50 text-gray-500"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                );
                            })()}
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
                                onClick={() => setFilters(PRIVATE_PAPER_DEFAULT_FILTERS)}
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
                            availableSubjects={availableSubjects}
                            availableStandards={availableStandards}
                            className="w-full shadow-none border-none p-0"
                        />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div >
    );
}

