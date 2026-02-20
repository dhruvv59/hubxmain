"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopPaper {
    id: string;
    title: string;
    attempts: number;
    averageScore: number;
}

interface TopPapersCardProps {
    papers: TopPaper[];
}

export function TopPapersCard({ papers }: TopPapersCardProps) {
    // Get top 5 papers
    const topPapers = papers.slice(0, 5);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-blue-600 bg-blue-50';
        if (score >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-blue-100 text-blue-700';
        if (score >= 40) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-800">Top Performing Papers</h3>
            </div>

            <div className="space-y-3">
                {topPapers.length === 0 ? (
                    <div className="py-8 text-center">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No papers yet</p>
                    </div>
                ) : (
                    topPapers.map((paper, index) => (
                        <Link
                            key={paper.id}
                            href={`/teacher/papers/${paper.id}`}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <span className={cn(
                                    "text-xs font-bold",
                                    index === 0 ? "text-amber-700" : "text-orange-700"
                                )}>
                                    #{index + 1}
                                </span>
                            </div>

                            {/* Paper Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                                    {paper.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {paper.attempts} {paper.attempts === 1 ? 'attempt' : 'attempts'}
                                </p>
                            </div>

                            {/* Score Badge */}
                            <div className={cn(
                                "flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold",
                                getScoreBadge(paper.averageScore)
                            )}>
                                {Math.round(paper.averageScore)}%
                            </div>

                            {/* Arrow Icon */}
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                        </Link>
                    ))
                )}
            </div>

            {topPapers.length > 0 && (
                <Link
                    href="/teacher/papers"
                    className="w-full mt-4 py-2.5 text-center text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                    View All Papers →
                </Link>
            )}
        </div>
    );
}

export function TopPapersCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] animate-pulse">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-5 w-40 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                            <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-6 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
