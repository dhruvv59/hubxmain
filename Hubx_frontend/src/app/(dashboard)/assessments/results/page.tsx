"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    ChevronLeft,
    Search,
    Calendar,
    BarChart2,
    Clock,
    CheckCircle2,
    XCircle,
    Flag,
    HelpCircle,
    ChevronRight,
    Sparkles,
    ChevronDown,
    Loader2,
    Filter,
    X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AssessmentResult, AssessmentFilters } from "@/types/assessment";
import { getPastAssessments } from "@/services/assessment";

// --- Components ---

interface FilterSidebarProps {
    filters: AssessmentFilters;
    onFilterChange: (newFilters: Partial<AssessmentFilters>) => void;
}

function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
    const subjects = ["All", "Science", "Mathematics", "Geography", "English", "Hindi", "Social Science", "Information Technology", "Economics"];
    const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

    return (
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            {/* Main Filter Card */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-purple-100 h-fit">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Subjects</h3>
                    <div className="space-y-3">
                        {subjects.map((subject) => (
                            <label key={subject} className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="subject_filter"
                                        checked={(filters.subject || "All") === subject}
                                        onChange={() => onFilterChange({ subject })}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 transition-transform duration-200 ease-in-out peer-checked:opacity-100 peer-checked:scale-100 input:checked~&" />
                                    {/* Additional CSS needed for simple peer-checked if tailwind config allows, manual style below ensures it works */}
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn("text-[13px]", (filters.subject || "All") === subject ? "text-[#6366f1] font-bold" : "text-gray-500 font-medium")}>{subject}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Difficulty Level</h3>
                    <div className="space-y-3">
                        {difficulties.map((level) => (
                            <label key={level} className="flex items-center space-x-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="difficulty_filter"
                                        checked={(filters.level || "All") === level}
                                        onChange={() => onFilterChange({ level })}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 transition-transform duration-200 ease-in-out" />
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn("text-[13px]", (filters.level || "All") === level ? "text-[#6366f1] font-bold" : "text-gray-500 font-medium")}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssessmentCard({ data }: { data: AssessmentResult }) {
    const levelColors = {
        Advanced: "bg-red-50 text-red-600 border-red-100",
        Intermediate: "bg-orange-50 text-orange-600 border-orange-100",
        Beginner: "bg-green-50 text-green-600 border-green-100"
    };

    const scoreColor = data.percentage >= 80 ? "text-green-500" : data.percentage >= 50 ? "text-orange-500" : "text-red-500";

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <h3 className="text-lg font-bold text-gray-900">{data.title}</h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Flag className="h-4 w-4 text-[#6366f1]" />
                                <span className="font-medium">{data.flags}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <HelpCircle className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">{data.doubts}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <ChevronRight className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{data.marked}</span>
                            </div>
                        </div>
                        {/* Mobile Percentage View */}
                        <div className={`md:hidden text-lg font-black italic ${scoreColor}`}>{data.percentage}%</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", levelColors[data.level || "Beginner"])}>
                            {data.level}
                        </span>
                        {data.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-6 text-sm text-gray-500 pt-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{data.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BarChart2 className="h-4 w-4" />
                            <span>{data.scoreObtained}/{data.totalScore}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{data.durationTakenString}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{data.correctCount}/{data.totalQuestions}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <XCircle className="h-4 w-4" />
                                <span>{data.wrongCount}/{data.totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">AI Smart Assessment</span>
                    </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 shrink-0">
                    <div className={`hidden md:block text-2xl font-black italic ${scoreColor}`}>{data.percentage}%</div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                            Preview
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-[#5b5bd6] text-white font-bold text-sm hover:bg-[#4f4fbe] transition-colors shadow-md shadow-indigo-200">
                            Retest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PreviousResultsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState<AssessmentResult[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState<AssessmentFilters>({
        subject: "All",
        level: "All",
        search: "",
        sortBy: "Most Recent",
        page: 1,
        limit: 6
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPastAssessments(filters);
            setResults(response.data);
            setTotalCount(response.total);
        } catch (error) {
            console.error("Failed to fetch assessments", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        // Debounce search if needed
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleFilterChange = (newFilters: Partial<AssessmentFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(totalCount / (filters.limit || 6));
    const currentPage = filters.page || 1;

    return (
        <div className="min-h-screen bg-[#fafbfc] p-6 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 max-w-[1600px] mx-auto">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-1">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Previous Papers</h1>
                        <p className="text-sm text-gray-500 font-medium">Previously appeared AI Smart Assessment Papers</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar Filter - Desktop */}
                <div className="hidden lg:block">
                    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>

                {/* Mobile Filter Drawer */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden font-sans">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowMobileFilters(false)}
                        />

                        {/* Drawer */}
                        <div className="fixed inset-y-0 right-0 w-[300px] bg-[#fafbfc] p-6 shadow-2xl overflow-y-auto animate-slide-in-right focus:outline-none">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 border border-gray-100 shadow-sm"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                        </div>
                    </div>
                )}

                {/* Main Content List */}
                <div className="flex-1 space-y-6">
                    {/* Search & Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-[400px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Paper by Subject or Teacher Name"
                                value={filters.search}
                                onChange={(e) => handleFilterChange({ search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                            />
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </button>

                            <div className="flex items-center space-x-2">
                                <span className="hidden sm:inline text-sm font-medium text-gray-500">Sort By</span>
                                <div className="relative">
                                    <button
                                        onClick={() => handleFilterChange({
                                            sortBy: filters.sortBy === "Most Recent" ? "Score High-Low" : "Most Recent"
                                        })}
                                        className="flex items-center space-x-2 px-4 py-2 bg-[#eaeaff] rounded-lg text-[#5b5bd6] text-sm font-bold min-w-[140px] justify-between"
                                    >
                                        <span>{filters.sortBy}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            // Skeletons
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-[24px] p-6 h-[200px] animate-pulse border border-gray-100">
                                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                                    <div className="h-20 bg-gray-50 rounded w-full" />
                                </div>
                            ))
                        ) : results.length > 0 ? (
                            results.map(result => (
                                <AssessmentCard key={result.id} data={result} />
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-lg font-medium">No results found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 pt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={cn(
                                    "text-sm font-medium mr-2 transition-colors",
                                    currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                            currentPage === page
                                                ? "bg-[#eaeaff] text-[#5b5bd6]"
                                                : "text-gray-500 hover:bg-gray-100"
                                        )}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "text-sm font-bold ml-2 transition-colors",
                                    currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-[#5b5bd6] hover:text-[#4f4fbe]"
                                )}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
