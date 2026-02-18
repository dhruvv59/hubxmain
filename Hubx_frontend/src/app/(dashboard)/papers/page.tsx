"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    Star,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PublicPaper, PaperFilters } from "@/types/assessment";
import { getPublicPapers } from "@/services/paper";
import { PaperCard } from "@/components/assessment/PaperCard";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { TestSettingsModal } from "@/components/assessment/TestSettingsModal";

// --- Filters Component (kept local as it's specific to this page layout) ---
interface FilterSidebarProps {
    filters: PaperFilters;
    onFilterChange: (newFilters: Partial<PaperFilters>) => void;
    allPapers: PublicPaper[]; // ALL papers - for extracting available filters
    isMobileDrawerOpen?: boolean;
    onCloseMobileDrawer?: () => void;
}

function FilterSidebar({ filters, onFilterChange, allPapers, isMobileDrawerOpen, onCloseMobileDrawer }: FilterSidebarProps) {
    const router = useRouter();

    // Extract unique subjects from ALL papers (before filtering)
    // This ensures filters don't disappear when other filters are applied
    const getAvailableSubjects = (): string[] => {
        const subjects = new Set<string>(["All"]);
        allPapers.forEach(p => {
            if (p.subject && p.subject.trim()) {
                subjects.add(p.subject);
            }
        });
        return Array.from(subjects).sort();
    };

    // Extract unique difficulty levels from ALL papers (before filtering)
    // This ensures filters don't disappear when other filters are applied
    const getAvailableDifficulties = (): string[] => {
        const difficultyMap: Record<string, string> = {
            "Advanced": "Advanced",
            "Beginner": "Beginner",
            "Intermediate": "Intermediate"
        };
        const difficulties = new Set<string>(["All"]);
        allPapers.forEach(p => {
            if (p.level && difficultyMap[p.level]) {
                difficulties.add(p.level);
            }
        });
        return Array.from(difficulties).sort();
    };

    const subjects = getAvailableSubjects();
    const difficulties = getAvailableDifficulties();
    const ratings = ["4 ★ & above", "Most Popular"];

    const filterContent = (
        <>
            {/* Main Filter Card */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-fit">
                {/* Subjects */}
                <div className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Subjects</h3>
                    <div className="space-y-3">
                        {subjects.map((subject) => (
                            <label key={subject} className="flex items-center space-x-3 cursor-pointer group min-h-[44px]">
                                <div className="relative flex items-center justify-center shrink-0">
                                    <input
                                        type="radio"
                                        name="subject_filter"
                                        checked={(filters.subject || "All") === subject}
                                        onChange={() => {
                                            onFilterChange({ subject });
                                            if (onCloseMobileDrawer) onCloseMobileDrawer();
                                        }}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors focus:ring-0 focus:ring-offset-0"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 transition-transform duration-200 ease-in-out peer-checked:opacity-100 peer-checked:scale-100 input:checked~&" />
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn("text-[14px] sm:text-base", (filters.subject || "All") === subject ? "text-[#6366f1] font-bold" : "text-gray-500 font-medium")}>{subject}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="border-t border-gray-100 pt-6 mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Difficulty Level</h3>
                    <div className="space-y-3">
                        {difficulties.map((level) => (
                            <label key={level} className="flex items-center space-x-3 cursor-pointer group min-h-[44px]">
                                <div className="relative flex items-center justify-center shrink-0">
                                    <input
                                        type="radio"
                                        name="difficulty_filter"
                                        checked={(filters.level || "All") === level}
                                        onChange={() => {
                                            onFilterChange({ level });
                                            if (onCloseMobileDrawer) onCloseMobileDrawer();
                                        }}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors focus:ring-0 focus:ring-offset-0"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 transition-transform duration-200 ease-in-out" />
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn("text-[14px] sm:text-base", (filters.level || "All") === level ? "text-[#6366f1] font-bold" : "text-gray-500 font-medium")}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Rating</h3>
                    <div className="space-y-3">
                        {ratings.map((rating) => (
                            <label key={rating} className="flex items-center space-x-3 cursor-pointer group min-h-[44px]">
                                <div className="relative flex items-center justify-center shrink-0">
                                    <input
                                        type="radio"
                                        name="rating_filter"
                                        checked={(filters.rating) === rating}
                                        onChange={() => {
                                            onFilterChange({ rating });
                                            if (onCloseMobileDrawer) onCloseMobileDrawer();
                                        }}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors focus:ring-0 focus:ring-offset-0"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 transition-transform duration-200 ease-in-out" />
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn("text-[14px] sm:text-base flex items-center gap-1", (filters.rating) === rating ? "text-[#6366f1] font-bold" : "text-gray-500 font-medium")}>
                                    {rating === "4 ★ & above" ? (
                                        <>4 <Star className="h-3 w-3 fill-current text-orange-400" /> & above</>
                                    ) : (
                                        rating
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Cards */}
            <div className="space-y-4">
                <button
                    onClick={() => router.push("/papers/purchased")}
                    className="w-full bg-white rounded-[20px] p-5 shadow-sm border border-[#e0e7ff] flex items-center justify-between group hover:border-[#6366f1] transition-all min-h-[56px]"
                >
                    <span className="text-[13px] font-black italic text-gray-900 uppercase">View Purchased Papers</span>
                    <div className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:bg-[#f5f6ff] transition-colors">
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#6366f1]" />
                    </div>
                </button>
            </div>
        </>
    );

    // Desktop version
    const desktopFilter = (
        <div className="hidden lg:block w-full lg:w-[280px] shrink-0 space-y-6">
            {filterContent}
        </div>
    );

    // Mobile drawer version
    const mobileDrawer = (
        <>
            {/* Backdrop */}
            {isMobileDrawerOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onCloseMobileDrawer}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
                isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Drawer Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                        <button
                            onClick={onCloseMobileDrawer}
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Drawer Content */}
                <div className="p-4 space-y-6">
                    {filterContent}
                </div>
            </div>
        </>
    );

    return (
        <>
            {desktopFilter}
            {mobileDrawer}
        </>
    );
}

export default function PublicPapersPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [allPapers, setAllPapers] = useState<PublicPaper[]>([]); // Store ALL papers for filter extraction
    const [filters, setFilters] = useState<PaperFilters>({
        subject: "All",
        level: "All",
        search: "",
        sortBy: "Most Recent"
    });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10; // Production: this should come from backend or user preference

    // Apply filters to papers
    const filteredPapers = allPapers.filter(p => {
        // Filter by subject
        if (filters.subject && filters.subject !== "All") {
            if (p.subject !== filters.subject) return false;
        }

        // Filter by difficulty level
        if (filters.level && filters.level !== "All") {
            if (p.level !== filters.level) return false;
        }

        // Filter by search term
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const matchesSearch =
                p.title.toLowerCase().includes(q) ||
                p.teacher.name.toLowerCase().includes(q) ||
                p.subject.toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }

        return true;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPapers = filteredPapers.slice(startIndex, endIndex);

    // Modal Interaction
    const [selectedPaper, setSelectedPaper] = useState<PublicPaper | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const fetchPapers = useCallback(async () => {
        setIsLoading(true);
        try {
            // In production, API would handle pagination server-side
            // Example: GET /api/papers?page=1&limit=10&subject=Math&level=Advanced
            const data = await getPublicPapers(filters);
            setAllPapers(data); // Store ALL papers for filter extraction

            // Reset to page 1 when filters change
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to fetch papers:", error);
            setAllPapers([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPapers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPapers]);

    const handleFilterChange = (newFilters: Partial<PaperFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleTeacherClick = (teacherId: string) => {
        const targetId = teacherId || 't1';
        router.push(`/teachers/${targetId}`);
    };

    const handlePurchase = (paper: PublicPaper) => {
        setSelectedPaper(paper);
        setIsPaymentOpen(true);
    };

    const handlePreview = (paper: PublicPaper) => {
        setSelectedPaper(paper);
        setIsSettingsOpen(true);
    };

    const handlePaymentSuccess = () => {
        // Refresh the papers list to remove the purchased paper from public list
        // and show updated pricing/purchase status
        setIsPaymentOpen(false);
        fetchPapers(); // Re-fetch to get updated purchase status from backend
    };

    // Pagination Handlers
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top on page change for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Generate page numbers to display (smart pagination)
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7; // Maximum number of page buttons to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination with ellipsis
            if (currentPage <= 3) {
                // Near start
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] p-3 sm:p-6 font-sans">
            {/* Header */}
            <div className="mb-6 sm:mb-8 max-w-[1600px] mx-auto">
                <div className="flex items-center space-x-2 sm:space-x-4 mb-2">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Public Papers <span className="hidden sm:inline">({99})</span>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium ml-10 sm:ml-11">
                    Discover and access quality papers created by expert teachers
                </p>
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Sidebar Filter */}
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    allPapers={allPapers}
                    isMobileDrawerOpen={isMobileFilterOpen}
                    onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1 space-y-4 sm:space-y-6">
                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
                        <div className="relative w-full sm:w-[500px]">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Subject or Teacher"
                                value={filters.search}
                                onChange={(e) => handleFilterChange({ search: e.target.value })}
                                className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] shadow-sm"
                            />
                        </div>

                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium min-h-[44px] hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                            </button>

                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <span className="text-xs sm:text-sm font-medium text-gray-600 hidden sm:inline">Sort By</span>
                                <div className="relative">
                                    <button
                                        onClick={() => handleFilterChange({
                                            sortBy: filters.sortBy === "Most Recent" ? "Price: Low to High" : "Most Recent"
                                        })}
                                        className="flex items-center space-x-2 px-3 sm:px-4 py-3 bg-[#eaeaff] rounded-lg text-[#5b5bd6] text-xs sm:text-sm font-bold min-w-[120px] sm:min-w-[150px] justify-between cursor-pointer hover:bg-[#e0e0ff] transition-colors min-h-[44px]"
                                    >
                                        <span className="truncate">{filters.sortBy}</span>
                                        <ChevronDown className="h-3 w-3 shrink-0" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Papers List */}
                    <div className="space-y-3 sm:space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 h-[200px] sm:h-[220px] animate-pulse border border-gray-100 flex flex-col gap-4">
                                    {/* Skeleton UI */}
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-gray-100 rounded w-1/3" />
                                        <div className="h-6 bg-gray-100 rounded w-20" />
                                    </div>
                                    <div className="h-4 bg-gray-50 rounded w-1/2" />
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full" />
                                        <div className="h-10 w-24 bg-gray-100 rounded-lg" />
                                    </div>
                                </div>
                            ))
                        ) : paginatedPapers.length > 0 ? (
                            paginatedPapers.map(paper => (
                                <PaperCard
                                    key={paper.id}
                                    data={paper}
                                    onTeacherClick={() => handleTeacherClick(paper.teacher.id)}
                                    onPurchase={() => handlePurchase(paper)}
                                    onPreview={() => handlePreview(paper)}
                                    onStartTest={() => handlePreview(paper)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 sm:py-20 text-gray-500 flex flex-col items-center px-4">
                                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                </div>
                                <p className="text-base sm:text-lg font-bold text-gray-900">No papers found</p>
                                <p className="text-xs sm:text-sm mt-1">Try adjusting your filters or search query</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalPages > 0 && (
                        <div className="flex items-center justify-center gap-1 sm:gap-2 pt-6 sm:pt-8 pb-6 sm:pb-10 flex-wrap">
                            {/* Previous Button */}
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={cn(
                                    "text-xs sm:text-sm font-medium mr-1 sm:mr-2 min-h-[44px] flex items-center px-2 sm:px-3 rounded-lg transition-colors",
                                    currentPage === 1
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                                )}
                            >
                                Prev
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-gray-400 select-none"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page as number)}
                                        className={cn(
                                            "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all",
                                            currentPage === page
                                                ? "bg-[#eaeaff] text-[#5b5bd6] font-bold shadow-sm"
                                                : "text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "text-xs sm:text-sm font-medium ml-1 sm:ml-2 min-h-[44px] flex items-center px-2 sm:px-3 rounded-lg transition-colors",
                                    currentPage === totalPages
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-[#5b5bd6] font-bold hover:bg-[#f5f6ff] cursor-pointer"
                                )}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Pagination Info (Optional - shows current range) */}
                    {!isLoading && totalPages > 0 && (
                        <div className="text-center text-xs sm:text-sm text-gray-500 pb-4">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredPapers.length)} of {filteredPapers.length} papers
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                paperTitle={selectedPaper?.title || ""}
                paperId={selectedPaper?.id || ""}
                amount={selectedPaper?.price || 0}
                onSuccess={handlePaymentSuccess}
            />

            <TestSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onStart={(settings) => {
                    setIsSettingsOpen(false);
                    if (selectedPaper) {
                        router.push(`/papers/${selectedPaper.id}/take`);
                    }
                }}
            />
        </div>
    );
}
