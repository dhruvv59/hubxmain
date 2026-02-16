import React from "react";
import { Clock } from "lucide-react";

export function ExamLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans animate-pulse">
            {/* Header */}
            <div className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div>
                        <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
                {/* Left: Question Area */}
                <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
                    {/* Q List Sidebar */}
                    <div className="w-[70px] border-r border-gray-100 flex flex-col items-center py-4 space-y-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg bg-gray-200" />
                        ))}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                            </div>
                        </div>

                        <div className="h-6 w-3/4 bg-gray-200 rounded mb-8" />

                        <div className="space-y-4 mb-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                            ))}
                        </div>

                        <div className="flex items-center justify-center space-x-4 mt-8">
                            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Right: Progress Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-purple-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4 text-gray-300" />
                                <div className="h-4 w-16 bg-gray-200 rounded" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <div className="h-3 w-24 bg-gray-200 rounded" />
                                    <div className="h-4 w-12 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[140px]">
                        <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-10 w-40 bg-gray-200 rounded" />
                    </div>
                </div>
            </main>
        </div>
    );
}
