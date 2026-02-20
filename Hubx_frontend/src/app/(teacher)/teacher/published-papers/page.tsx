"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "@/components/teacher/papers/FilterSidebar";
import { MobileFilterSidebar } from "@/components/teacher/papers/MobileFilterSidebar";
import { TeacherPaperCard } from "@/components/teacher/papers/TeacherPaperCard";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

interface Paper {
    id: string;
    title: string;
    description: string | null;
    standard: number;
    difficulty: string;
    type: string;
    duration: number | null;
    isPublic: boolean;
    price: number | null;
    status: string;
    totalAttempts: number;
    averageScore: number;
    subject: { id: string; name: string } | null;
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    questionCount: number;
    createdAt: string;
}

interface BackendResponse {
    success: boolean;
    message: string;
    data: {
        ownPapers: Paper[];
        otherPapers: Paper[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        filters?: {
            subjects: string[];
            standards: string[];
        };
    };
}

// Transform backend paper to TeacherPaperCard format
function transformPaperForCard(paper: Paper): any {
    return {
        id: paper.id,
        title: paper.title,
        description: paper.description || '',
        subject: paper.subject?.name || 'General',
        standard: `${paper.standard}th`,
        questions: paper.questionCount,
        duration: `${paper.duration || 0} min`,
        price: paper.price || 0,
        rating: paper.averageScore / 20, // Convert 0-100 to 0-5 scale
        badges: [
            paper.difficulty.charAt(0) + paper.difficulty.slice(1).toLowerCase(),
            paper.subject?.name || 'General'
        ],
        attempts: paper.totalAttempts || 0,
        date: new Date(paper.createdAt).toLocaleDateString('en-IN'),
        idTag: paper.id.slice(-4).toUpperCase(),
        teacher: {
            name: `${paper.teacher.firstName} ${paper.teacher.lastName}`,
            email: paper.teacher.email,
            avatar: '' // Teachers don't have avatars in response - will use default icon
        }
    };
}

export default function PublicPapersPage() {
    // State
    const [filters, setFilters] = useState({
        subject: "All",
        standard: "All",
        difficulty: "All",
        search: ""
    });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [ownPapers, setOwnPapers] = useState<Paper[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableStandards, setAvailableStandards] = useState<string[]>([]);

    const ITEMS_PER_PAGE = 10;

    const fetchPapers = async (page: number, activeFilters: typeof filters) => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('limit', String(ITEMS_PER_PAGE));

            if (activeFilters.subject && activeFilters.subject !== "All") {
                params.append('subject', activeFilters.subject);
            }
            if (activeFilters.standard && activeFilters.standard !== "All") {
                const stdNum = activeFilters.standard.replace(/\D/g, '');
                if (stdNum) params.append('std', stdNum);
            }
            if (activeFilters.difficulty && activeFilters.difficulty !== "All") {
                params.append('difficulty', activeFilters.difficulty.toUpperCase());
            }
            if (activeFilters.search) {
                params.append('search', activeFilters.search);
            }

            const response = await http.get<BackendResponse>(
                TEACHER_ENDPOINTS.getPublicPapers(params.toString())
            );

            setOwnPapers(response.data.ownPapers);
            setPapers(response.data.otherPapers);
            setTotalItems(response.data.pagination.total);
            setTotalPages(response.data.pagination.pages);

            if (response.data.filters) {
                setAvailableSubjects(response.data.filters.subjects);
                setAvailableStandards(response.data.filters.standards);
            }

            setIsLoading(false);
        } catch (err: any) {
            console.error('[PublicPapersPage] Failed to fetch papers:', err);
            setError(err.message || 'Failed to load papers');
            setIsLoading(false);
        }
    };

    // Fetch papers from backend whenever page or filters change
    useEffect(() => {
        fetchPapers(currentPage, filters);
    }, [currentPage, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    // Backend already slices correctly: ownPapers first, then otherPapers, exactly 10 total per page
    const displayedOwnPapers = ownPapers;
    const displayedOtherPapers = papers;
    const allPapers = [...ownPapers, ...papers];

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= (totalPages || 1)) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Smart Pagination Generator — never shows more pages than actually exist
    const getPageNumbers = () => {
        if (totalPages <= 1) return [];

        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is within maxVisible
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            // Adjust window so we always show exactly maxVisible pages
            if (end - start < maxVisible - 1) {
                if (start === 1) {
                    end = Math.min(totalPages, start + maxVisible - 1);
                } else {
                    start = Math.max(1, end - maxVisible + 1);
                }
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            <MobileFilterSidebar
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                availableSubjects={availableSubjects}
                availableStandards={availableStandards}
            />

            {/* Page Header */}
            <div className="mb-6 mt-4">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">
                        Published Papers {!isLoading && `(${totalItems})`}
                    </h1>
                </div>
                <p className="text-gray-500 text-sm ml-8">Discover and access quality papers created by expert teachers</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Sidebar (Desktop) */}
                <div className="hidden lg:block sticky top-6">
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        availableSubjects={availableSubjects}
                        availableStandards={availableStandards}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full">

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
                        {/* Search */}
                        <div className="relative w-full sm:w-[350px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Paper by Subject or Teacher Name"
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Actions Row (Filter Trigger & Sort) */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">

                            {/* Mobile Filter Trigger */}
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none justify-center"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters ({Object.values(filters).filter(v => v !== "All").length})
                            </button>

                            {/* Sort */}
                            <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
                                <span className="text-sm font-semibold text-gray-500 hidden sm:inline">Sort By</span>
                                <div className="relative w-full sm:w-auto">
                                    <select
                                        value="Most Recent"
                                        onChange={(e) => {
                                            // Sort options for future enhancement
                                            console.log("Sort by:", e.target.value);
                                        }}
                                        className="flex items-center justify-between w-full sm:w-auto gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-md text-sm font-bold text-indigo-700 whitespace-nowrap cursor-pointer appearance-none"
                                    >
                                        <option>Most Recent</option>
                                        <option>Most Popular</option>
                                        <option>Highest Rated</option>
                                        <option>Lowest Price</option>
                                        <option>Highest Price</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Papers List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-red-100 shadow-sm">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <h3 className="text-lg font-bold text-gray-900">Failed to Load Papers</h3>
                            <p className="text-gray-500 text-sm mt-1">{error}</p>
                            <button
                                onClick={() => fetchPapers(currentPage, filters)}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : allPapers.length > 0 ? (
                        <div className="space-y-4">
                            {/* Page 1: Show own papers */}
                            {displayedOwnPapers.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Your Published Papers</h2>
                                    {displayedOwnPapers.map((paper) => (
                                        <div key={paper.id} className="mb-4">
                                            <TeacherPaperCard
                                                paper={{ ...transformPaperForCard(paper), isOwnPaper: true }}
                                                onUpdate={() => fetchPapers(currentPage, filters)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Page 2+: Show other teachers' papers */}
                            {displayedOtherPapers.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Other Teachers' Papers</h2>
                                    {displayedOtherPapers.map((paper) => (
                                        <div key={paper.id} className="mb-4">
                                            <TeacherPaperCard paper={transformPaperForCard(paper)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No papers found</h3>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                            <button
                                onClick={() => setFilters({ subject: "All", standard: "All", difficulty: "All", search: "" })}
                                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && (
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Prev
                                </button>

                                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[280px] sm:max-w-none px-2 no-scrollbar">
                                    {getPageNumbers().map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handlePageChange(num)}
                                            disabled={isLoading}
                                            className={`min-w-[32px] h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all shrink-0
                                            ${num === currentPage
                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="px-3 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>

                            <p className="text-sm text-gray-400 font-medium">
                                Page <span className="text-gray-900 font-bold">{currentPage}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
                                {totalItems > 0 && <span> • {totalItems} total papers</span>}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
