"use client";

import React, { useEffect, useState } from "react";
import { teacherAnalyticsService, TeacherAnalyticsData } from "@/services/teacher-analytics";
import { Loader2, TrendingUp, Users, BookOpen, DollarSign, BarChart2 } from "lucide-react";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

function AnalyticsContent() {
    const [data, setData] = useState<TeacherAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        teacherAnalyticsService.getAnalytics()
            .then(setData)
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

    if (!data) return <div className="text-center p-8">No analytics data available.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Teacher Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Students</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.totalStudents || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Papers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.totalPapers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Avg Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.averageRating || 0}/5</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{data.revenue || 0}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Performance by Subject */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Student Performance by Subject</h3>
                    <div className="space-y-4">
                        {data.studentPerformance && data.studentPerformance.length > 0 ? (
                            data.studentPerformance.map((subj: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{subj.subject}</span>
                                        <div className="flex gap-4">
                                            <span className="text-gray-500 text-xs">{subj.totalAttempts} attempts</span>
                                            <span className="font-bold text-gray-900">{subj.averageScore || 0}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6366f1] rounded-full"
                                            style={{ width: `${subj.averageScore || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No performance data available.</p>
                        )}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                        {data.recentActivities && data.recentActivities.length > 0 ? (
                            data.recentActivities.map((activity: any, idx: number) => (
                                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="mt-1 p-1.5 bg-gray-50 rounded-full h-fit">
                                        <BarChart2 className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activities.</p>
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
