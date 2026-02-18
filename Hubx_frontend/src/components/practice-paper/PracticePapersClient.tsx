"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Clock,
    Trophy,
    Search,
    ChevronRight,
    ChevronLeft,
    FileText,
    Calendar,
    Target,
    CheckCircle,
    AlertCircle,
    Play,
    Eye,
    Loader2,
    Bookmark,
    RotateCcw,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { practicePaperService } from "@/services/practice-paper";
import type {
    Paper,
    PaperStats,
    PaginationMeta,
    PaperFilters,
    GetPapersParams,
    PaperType
} from "@/types/practice-paper";

const ITEMS_PER_PAGE = 9;

interface PracticePapersClientProps {
    initialData?: {
        papers: Paper[];
        subjects: { id: string; name: string }[];
        stats: PaperStats;
        pagination: PaginationMeta;
    };
}

const DEFAULT_STATS: PaperStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    assigned: 0,
    notStarted: 0
};

const DEFAULT_PAGINATION: PaginationMeta = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
};

export function PracticePapersClient({ initialData }: PracticePapersClientProps) {
    const router = useRouter();

    // State Management initialized with server data or defaults
    const [papers, setPapers] = useState<Paper[]>(initialData?.papers || []);
    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>(initialData?.subjects || []);
    const [stats, setStats] = useState<PaperStats>(initialData?.stats || DEFAULT_STATS);
    const [pagination, setPagination] = useState<PaginationMeta>(initialData?.pagination || DEFAULT_PAGINATION);

    // Start loading if no initial data
    const [isLoading, setIsLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);
    const [startingExamId, setStartingExamId] = useState<string | null>(null);

    // Filter State
    const [filters, setFilters] = useState<PaperFilters>({
        subject: 'All',
        type: 'all',
        search: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [subjectSearch, setSubjectSearch] = useState('');

    // Fetch Papers (Client-side)
    const fetchPapers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetPapersParams = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                subject: filters.subject !== 'All' ? filters.subject : undefined,
                type: filters.type !== 'all' ? filters.type : undefined,
                search: filters.search || undefined,
                difficulty: filters.difficulty || undefined,
                status: filters.status && filters.status !== 'all' ? filters.status : undefined,
            };

            const response = await practicePaperService.getPapers(params);

            if (response.success) {
                setPapers(response.data.papers);
                setSubjects(response.data.subjects || []);
                setStats(response.data.stats);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching papers:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filters]);

    // Fetch on mount if no initial data, otherwise only on filter/page change
    const [isFirstMount, setIsFirstMount] = useState(true);
    useEffect(() => {
        if (isFirstMount) {
            setIsFirstMount(false);
            if (!initialData) {
                fetchPapers();
            }
            return;
        }
        fetchPapers();
    }, [fetchPapers, isFirstMount, initialData]);

    // Filter Handlers
    const handleSubjectChange = (subject: string) => {
        setFilters(prev => ({ ...prev, subject }));
        setCurrentPage(1); // Reset to page 1 when filtering
    };

    const handleTypeChange = (type: PaperType | 'all') => {
        setFilters(prev => ({ ...prev, type }));
        setCurrentPage(1);
    };

    const handleSearchChange = (search: string) => {
        setFilters(prev => ({ ...prev, search }));
        setCurrentPage(1);
    };

    const handleDifficultyChange = (difficulty: string) => {
        setFilters(prev => ({ ...prev, difficulty: difficulty || undefined }));
        setCurrentPage(1);
    };

    const handleBookmarkToggle = async (paperId: string) => {
        try {
            const result = await practicePaperService.toggleBookmark(paperId);
            // Update paper in local state
            setPapers(prev => prev.map(p =>
                p.id === paperId ? { ...p, isBookmarked: result.bookmarked } : p
            ));
        } catch (err) {
            console.error('Error toggling bookmark:', err);
        }
    };

    // Pagination Handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Action Handlers
    const handleStartTest = async (paperId: string) => {
        setStartingExamId(paperId);
        try {
            const response = await practicePaperService.startTest(paperId);
            if (response.success && response.data.attemptId) {
                router.push(`/exam/${response.data.attemptId}`);
            }
        } catch (err: any) {
            console.error('Error starting test:', err);
            // If exam already started (attempt exists), try to navigate directly
            const errorMsg = err?.response?.data?.message || err?.message || '';
            alert(`Could not start test: ${errorMsg || 'Please try again.'}`);
            setStartingExamId(null);
        }
    };

    const handleContinueTest = (attemptId: string) => {
        router.push(`/exam/${attemptId}`);
    };

    const handleReviewTest = (attemptId: string) => {
        router.push(`/exam/${attemptId}/result`);
    };

    // Build dynamic subject list: "All" + subjects from API
    const subjectList = ['All', ...subjects.map(s => s.name)];

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">

            {/* Header - Mobile Optimized */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5 sm:gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        Practice Papers
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium leading-relaxed">
                        Master your subjects with practice tests and previous year papers
                    </p>
                </div>

                {/* Stats - Fully Mobile Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 font-medium mb-1">Completed</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 font-medium mb-1">In Progress</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 font-medium mb-1">Not Started</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.notStarted}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 font-medium mb-1">Assigned</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.assigned}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar - Mobile-First Design */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-4">
                    {/* Search - Touch Optimized */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search papers..."
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] sm:min-h-0"
                        />
                    </div>

                    {/* Type Filter Tabs - Responsive Grid */}
                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 bg-gray-100 p-1.5 rounded-xl">
                        {(['all', 'assigned', 'bookmarked', 'previous', 'practice'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTypeChange(tab)}
                                disabled={isLoading}
                                className={cn(
                                    "px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] sm:min-h-0 touch-manipulation flex items-center justify-center gap-1.5",
                                    filters.type === tab
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 active:bg-gray-200",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {tab === 'bookmarked' && <Bookmark className="h-3.5 w-3.5" />}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Difficulty Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filters.difficulty || ''}
                            onChange={(e) => handleDifficultyChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(
                                "w-full sm:w-auto pl-10 pr-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-h-[44px] sm:min-h-0",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <option value="">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Subject Search - New */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] sm:min-h-0"
                    />
                </div>

                {/* Subject Pills - Dynamic from API with Search Filter */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                    {subjectList
                        .filter((subject) =>
                            subject.toLowerCase().includes(subjectSearch.toLowerCase())
                        )
                        .map((subject) => (
                            <button
                                key={subject}
                                onClick={() => handleSubjectChange(subject)}
                                disabled={isLoading}
                                className={cn(
                                    "px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap min-h-[44px] flex items-center touch-manipulation snap-start",
                                    filters.subject === subject
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {subject}
                            </button>
                        ))}
                </div>
            </div>

            {/* Loading State - Enhanced */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium text-sm sm:text-base">Loading papers...</p>
                    </div>
                </div>
            )}

            {/* Error State - Mobile Optimized */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load papers</h3>
                    <p className="text-red-700 mb-4 text-sm sm:text-base px-4">{error.message}</p>
                    <button
                        onClick={fetchPapers}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 active:bg-red-800 transition-colors min-h-[44px] touch-manipulation"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Papers Grid - Fully Responsive */}
            {!isLoading && !error && (
                <>
                    {papers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {papers.map((paper) => (
                                <PaperCard
                                    key={paper.id}
                                    paper={paper}
                                    startingExamId={startingExamId}
                                    onStartTest={handleStartTest}
                                    onContinueTest={handleContinueTest}
                                    onReviewTest={handleReviewTest}
                                    onBookmarkToggle={handleBookmarkToggle}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No papers found</h3>
                            <p className="text-gray-500 text-sm sm:text-base">Try adjusting your filters or search query</p>
                        </div>
                    )}

                    {/* Pagination - Touch Optimized */}
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ============================================
// PAPER CARD COMPONENT - MOBILE OPTIMIZED
// ============================================

interface PaperCardProps {
    paper: Paper;
    startingExamId: string | null;
    onStartTest: (paperId: string) => void;
    onContinueTest: (attemptId: string) => void;
    onReviewTest: (attemptId: string) => void;
    onBookmarkToggle: (paperId: string) => void;
}

function PaperCard({ paper, startingExamId, onStartTest, onContinueTest, onReviewTest, onBookmarkToggle }: PaperCardProps) {
    const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
        practice: {
            label: 'Practice',
            color: 'bg-blue-50 text-blue-600 border-blue-200',
            icon: BookOpen
        },
        previous: {
            label: `Previous ${paper.year || ''}`,
            color: 'bg-purple-50 text-purple-600 border-purple-200',
            icon: Calendar
        },
        assigned: {
            label: 'Assigned',
            color: 'bg-orange-50 text-orange-600 border-orange-200',
            icon: Target
        },
        bookmarked: {
            label: 'Bookmarked',
            color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            icon: Bookmark
        },
        all: {
            label: 'Practice',
            color: 'bg-blue-50 text-blue-600 border-blue-200',
            icon: BookOpen
        }
    };

    const difficultyConfig = {
        easy: 'bg-green-50 text-green-700',
        medium: 'bg-yellow-50 text-yellow-700',
        hard: 'bg-red-50 text-red-700'
    };

    const statusConfig = {
        'not-started': {
            label: 'Start Test',
            icon: Play,
            color: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
        },
        'in-progress': {
            label: 'Continue',
            icon: ChevronRight,
            color: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white'
        },
        'completed': {
            label: 'Review',
            icon: Eye,
            color: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
        }
    };

    const config = typeConfig[paper.type] || typeConfig.practice;
    const StatusIcon = statusConfig[paper.status].icon;
    const TypeIcon = config.icon;

    const isStarting = startingExamId === paper.id;

    // Format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return formatDate(dateString);
    };

    // Action button click handler
    const handleAction = () => {
        if (isStarting) return;

        if (paper.status === 'not-started') {
            onStartTest(paper.id);
        } else if (paper.status === 'in-progress' && paper.attemptId) {
            onContinueTest(paper.attemptId);
        } else if (paper.status === 'completed' && paper.attemptId) {
            onReviewTest(paper.attemptId);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
            {/* Bookmark Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onBookmarkToggle(paper.id); }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
                title={paper.isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            >
                <Bookmark className={cn(
                    "h-4 w-4 transition-colors",
                    paper.isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
                )} />
            </button>

            {/* Header - Responsive */}
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2 pr-8">
                <div className={cn(
                    "px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold border flex items-center gap-1.5",
                    config.color
                )}>
                    <TypeIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{config.label}</span>
                </div>
                <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-bold uppercase flex-shrink-0",
                    difficultyConfig[paper.difficulty]
                )}>
                    {paper.difficulty}
                </span>
            </div>

            {/* Title - Mobile Optimized */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem] sm:min-h-[3.5rem] leading-tight">
                {paper.title}
            </h3>

            {/* Subject */}
            <p className="text-sm font-medium text-gray-500 mb-3 sm:mb-4">{paper.subject}</p>

            {/* Stats - Compact Mobile Layout */}
            <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                <div className="text-center py-2.5 sm:py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-gray-900">{paper.questions}</p>
                    <p className="text-[10px] text-gray-500 hidden sm:block">Questions</p>
                    <p className="text-[10px] text-gray-500 sm:hidden">Ques.</p>
                </div>
                <div className="text-center py-2.5 sm:py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-gray-900">{paper.duration ? `${paper.duration}m` : '∞'}</p>
                    <p className="text-[10px] text-gray-500 hidden sm:block">Duration</p>
                    <p className="text-[10px] text-gray-500 sm:hidden">Time</p>
                </div>
                <div className="text-center py-2.5 sm:py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Trophy className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-gray-900">{paper.marks}</p>
                    <p className="text-[10px] text-gray-500">Marks</p>
                </div>
            </div>

            {/* Score/Status */}
            {paper.status === 'completed' && paper.percentage !== undefined && (
                <div className="mb-3 sm:mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-green-900">Completed</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                            {paper.percentage?.toFixed(0)}%
                        </span>
                    </div>
                    {paper.attempts > 1 && paper.bestPercentage !== undefined && (
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-green-200">
                            <span className="text-xs text-green-700">Best Score ({paper.attempts} attempts)</span>
                            <span className="text-sm font-bold text-green-700">{paper.bestPercentage?.toFixed(0)}%</span>
                        </div>
                    )}
                </div>
            )}

            {/* Assigned Test Info - Mobile Friendly */}
            {paper.type === 'assigned' && paper.dueDate && paper.status !== 'completed' && (
                <div className="mb-3 sm:mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-start gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-orange-900 block">
                                Due: {formatDate(paper.dueDate)}
                            </span>
                            <p className="text-xs text-orange-700 truncate mt-0.5">
                                Assigned by: {paper.assignedBy}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attempts - Compact */}
            {paper.attempts > 0 && (
                <p className="text-xs text-gray-500 mb-3 sm:mb-4 truncate">
                    {paper.attempts} attempt{paper.attempts > 1 ? 's' : ''}
                    {paper.lastAttemptedAt && ` • ${formatRelativeTime(paper.lastAttemptedAt)}`}
                </p>
            )}

            {/* Action Buttons - Touch Optimized with REAL NAVIGATION */}
            <div className="flex gap-2">
                <button
                    onClick={handleAction}
                    disabled={isStarting}
                    className={cn(
                        "flex-1 py-3.5 sm:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-98 min-h-[44px] touch-manipulation",
                        isStarting ? "bg-gray-400 text-white cursor-wait" : statusConfig[paper.status].color
                    )}
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : (
                        <>
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig[paper.status].label}
                        </>
                    )}
                </button>

                {/* Re-attempt button for completed papers */}
                {paper.status === 'completed' && (
                    <button
                        onClick={() => onStartTest(paper.id)}
                        disabled={isStarting}
                        className="px-3 py-3.5 sm:py-3 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all border border-blue-200 text-blue-600 hover:bg-blue-50 active:scale-95 min-h-[44px] touch-manipulation"
                        title="Re-attempt this paper"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, hasNextPage, hasPrevPage, onPageChange }: PaginationProps) {
    // Detect if mobile for dynamic page number display
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = isMobile ? 3 : 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                for (let i = 1; i <= Math.min(3, totalPages); i++) pages.push(i);
                if (totalPages > 3) {
                    pages.push('...');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 1) {
                pages.push(1);
                pages.push('...');
                for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                if (currentPage > 2) pages.push('...');
                pages.push(currentPage);
                if (currentPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 flex-wrap px-2">
            {/* Previous Button - Mobile Optimized */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={cn(
                    "px-3 sm:px-4 py-3 sm:py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5 sm:gap-2 transition-all min-h-[44px] sm:min-h-0 touch-manipulation",
                    hasPrevPage
                        ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Previous</span>
                <span className="xs:hidden sm:hidden">Prev</span>
            </button>

            {/* Page Numbers - Touch Friendly */}
            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-2 text-gray-400 flex items-center justify-center min-w-[36px]">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                "px-3 sm:px-4 py-3 sm:py-2 rounded-xl font-semibold text-sm transition-all min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-0 flex items-center justify-center touch-manipulation",
                                currentPage === page
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm"
                            )}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            {/* Next Button - Mobile Optimized */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={cn(
                    "px-3 sm:px-4 py-3 sm:py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5 sm:gap-2 transition-all min-h-[44px] sm:min-h-0 touch-manipulation",
                    hasNextPage
                        ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
            >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
