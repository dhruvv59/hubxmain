"use client";

import React from "react";
import { ArrowLeft, Search, Filter, X, Loader2 } from "lucide-react";
import { ExcursionFilterSidebar } from "@/components/teacher/excursion/ExcursionFilterSidebar";
import { ExcursionCard, ExcursionCardProps } from "@/components/teacher/excursion/ExcursionCard";
import { useRouter } from "next/navigation";
import { useExcursions } from "@/hooks/useExcursions";


export default function ExcursionPage() {
    const [showMobileFilters, setShowMobileFilters] = React.useState(false);
    const router = useRouter();
    const { excursions, isLoading, error } = useExcursions();

    const handleBook = (id: string) => {
        router.push(`/teacher/excursion/book?id=${id}`);
    };

    const handleSendConsent = (id: string) => {
        router.push(`/teacher/excursion/consent?id=${id}`);
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    {/* Sidebar Container */}
                    <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 mb-2">
                            <h2 className="font-bold text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 pt-0">
                            <ExcursionFilterSidebar />
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-6 px-4 lg:px-0">
                <div className="flex items-center gap-2 text-gray-900 mb-1">
                    <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
                    <h1 className="text-2xl font-bold">Excursion</h1>
                </div>
                <p className="text-gray-500 text-sm lg:ml-8">
                    Discover educational excursion opportunities and book visits for your students
                </p>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 gap-6 overflow-hidden flex-col lg:flex-row px-4 lg:px-0">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-[280px] flex-shrink-0 h-full overflow-y-auto pb-4">
                    <ExcursionFilterSidebar />
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Search Bar Row */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Mobile Filter Button */}
                        <button
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Industries, Companies or Locations"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white shadow-sm"
                                suppressHydrationWarning={true}
                            />
                        </div>
                        <button
                            className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#6366f1] text-sm font-medium hover:bg-indigo-50 transition-colors bg-white shadow-sm whitespace-nowrap"
                            suppressHydrationWarning={true}
                        >
                            Completed Trips
                        </button>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto pr-0 lg:pr-2 pb-10 scrollbar-thin scrollbar-thumb-gray-200">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center min-h-[400px]">
                                <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center min-h-[400px] text-red-500 font-medium">
                                {error}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {excursions.map((excursion) => (
                                    <ExcursionCard
                                        key={excursion.id}
                                        {...excursion}
                                        onBook={() => handleBook(excursion.id)}
                                        onSendConsent={() => handleSendConsent(excursion.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 mb-4">
                            <span className="text-sm text-gray-400 mr-2">Prev</span>
                            {[1, 2, 3, 4, 5].map((page) => (
                                <button
                                    key={page}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border ${page === 1
                                        ? "bg-[#e0e7ff] text-[#4338ca] border-[#c7d2fe]"
                                        : "text-gray-500 border-gray-200 hover:bg-gray-50 max-sm:hidden"
                                        } ${page === 1 ? "flex" : ""}`} // Show active page always, hide others on small mobile if needed
                                    suppressHydrationWarning={true}
                                >
                                    {page}
                                </button>
                            ))}
                            {/* Mobile simplified pagination dots if needed, but keeping simple for now */}
                            <span className="text-sm text-[#4338ca] font-medium ml-2 cursor-pointer hover:underline">Next</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
