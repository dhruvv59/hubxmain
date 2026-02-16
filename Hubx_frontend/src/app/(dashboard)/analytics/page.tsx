"use client";

import React, { useEffect, useState } from "react";
import { getStudentAnalytics } from "@/services/dashboard";
import { Loader2, BarChart, TrendingUp, Clock, Award } from "lucide-react";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

function AnalyticsContent() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getStudentAnalytics()
            .then(setAnalytics)
            .catch((err) => {
                console.error("Failed to load analytics:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-[500px] items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
            </div>
        );
    }

    if (error) return <ErrorFallback message="Failed to load analytics data" />;

    if (!analytics) return <div className="text-center p-8">No analytics data available.</div>;

    // Determine data structure dynamically or assume standard fields
    // Assuming structure: { summary: { ... }, subjects: [...], history: [...] } based on typical patterns

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Average Score</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.averagePercentage || 0}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Attempts</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalAttempts || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <BarChart className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Highest Score</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.highestScore || 0}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Study Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round((analytics.totalTimeSpent || 0) / 60)} mins</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
                    <div className="space-y-4">
                        {analytics.subjectPerformance && analytics.subjectPerformance.length > 0 ? (
                            analytics.subjectPerformance.map((subj: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{subj.subject}</span>
                                        <span className="font-bold text-gray-900">{subj.percentage || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6366f1] rounded-full"
                                            style={{ width: `${subj.percentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No subject data available.</p>
                        )}
                    </div>
                </div>

                {/* Recent Trends or Raw Data fallback */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Difficulty</h3>
                    <div className="space-y-4">
                        {analytics.performanceByDifficulty?.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700 capitalize">{item.level.toLowerCase()}</span>
                                    <span className="font-bold text-gray-900">{item.percentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.level === "EASY"
                                                ? "bg-green-500"
                                                : item.level === "INTERMEDIATE"
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                            }`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Score: {item.score}/{item.total}
                                </p>
                            </div>
                        ))}
                        {(!analytics.performanceByDifficulty || analytics.performanceByDifficulty.length === 0) && (
                            <p className="text-gray-500 text-sm">No difficulty data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            <ErrorBoundary fallback={<ErrorFallback message="Something went wrong loading analytics" />}>
                <AnalyticsContent />
            </ErrorBoundary>
        </div>
    );
}
