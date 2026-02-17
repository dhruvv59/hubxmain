"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, Filter } from "lucide-react";
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
        duration: paper.duration || 0,
        price: paper.price || 0,
        rating: paper.averageScore / 20, // Convert 0-100 to 0-5 scale
        badges: [
            paper.difficulty.charAt(0) + paper.difficulty.slice(1).toLowerCase(),
            paper.subject?.name || 'General'
        ],
        teacher: {
            name: `${paper.teacher.firstName} ${paper.teacher.lastName}`,
            email: paper.teacher.email
        }
    };
}

export default function PublicPapersPage() {
    // State
    const [filters, setFilters] = useState({
        subject: "All",
        standard: "All",
        difficulty: "All",
        rating: "All",
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

    const ITEMS_PER_PAGE = 9;

    // Fetch papers from backend
    useEffect(() => {
        fetchPapers();
    }, [currentPage, filters]);

    const fetchPapers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', String(currentPage));
            params.append('limit', String(ITEMS_PER_PAGE));

            if (filters.subject && filters.subject !== "All") {
                params.append('subject', filters.subject);
            }
            if (filters.standard && filters.standard !== "All") {
                // Extract number from "9th", "10th" etc and send as query param
                const stdNum = filters.standard.replace(/\D/g, '');
                if (stdNum) {
                    params.append('std', stdNum);
                }
            }
            if (filters.difficulty && filters.difficulty !== "All") {
                params.append('difficulty', filters.difficulty.toUpperCase());
            }
            if (filters.rating && filters.rating !== "All") {
                // Handle rating filter - convert to backend format
                params.append('rating', filters.rating);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }

            const response = await http.get<BackendResponse>(
                TEACHER_ENDPOINTS.getPublicPapers(params.toString())
            );

            setOwnPapers(response.data.ownPapers);
            setPapers(response.data.otherPapers);
            setTotalItems(response.data.pagination.total);
            setTotalPages(response.data.pagination.pages);
            setIsLoading(false);
        } catch (err: any) {
            console.error('[PublicPapersPage] Failed to fetch papers:', err);
            setError(err.message || 'Failed to load papers');
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    // Combine own papers (always shown first) with other papers
    const allPapers = [...ownPapers, ...papers];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Smart Pagination Generator
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
            }
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
            />

            {/* Page Header */}
            <div className="mb-6 mt-4">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">
                        Public Papers {!isLoading && `(${ownPapers.length + totalItems})`}
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
                                onClick={() => fetchPapers()}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : allPapers.length > 0 ? (
                        <div className="space-y-4">
                            {ownPapers.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Your Public Papers</h2>
                                    {ownPapers.map((paper) => (
                                        <div key={paper.id} className="mb-4">
                                            <TeacherPaperCard paper={transformPaperForCard(paper)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {papers.length > 0 && (
                                <div>
                                    {ownPapers.length > 0 && (
                                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Other Teachers' Papers</h2>
                                    )}
                                    {papers.map((paper) => (
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
                                onClick={() => setFilters({ subject: "All", standard: "All", difficulty: "All", rating: "All", search: "" })}
                                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {(totalItems > 0 || ownPapers.length > 0) && !isLoading && (
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
                                Showing <span className="text-gray-900 font-bold">{papers.length}</span> of <span className="text-gray-900 font-bold">{totalItems}</span> other papers
                                {ownPapers.length > 0 && <span> (+ {ownPapers.length} your own)</span>}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
