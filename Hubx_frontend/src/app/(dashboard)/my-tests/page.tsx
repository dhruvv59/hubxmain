"use client";

import React, { useState, useEffect } from "react";
import { FileText, Calendar, Clock, Award, TrendingUp, Search, Filter, Loader2, Eye } from "lucide-react";
import { getPastAssessments } from "@/services/assessment";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MyTestsPage() {
    const router = useRouter();
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState<string>("All");

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        setIsLoading(true);
        try {
            const response = await getPastAssessments({ page: 1, limit: 50 });
            setTests(response.data);
        } catch (error) {
            console.error("Failed to load tests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTests = tests.filter((test) => {
        const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterLevel === "All" || test.level === filterLevel;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: tests.length,
        avgScore: tests.length > 0
            ? Math.round(tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length)
            : 0,
        topScore: tests.length > 0
            ? Math.max(...tests.map(t => t.percentage))
            : 0,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
                <p className="text-sm text-gray-500 mt-1">View all your completed assessments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-500">Total Tests</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
                            <p className="text-sm text-gray-500">Average Score</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.topScore}%</p>
                            <p className="text-sm text-gray-500">Highest Score</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tests..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer transition-all"
                        >
                            <option value="All">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tests List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No tests found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => router.push(`/assessments/results?id=${test.id}`)}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {test.title}
                                        </h3>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0",
                                            test.level === "Advanced" && "bg-red-100 text-red-700",
                                            test.level === "Intermediate" && "bg-yellow-100 text-yellow-700",
                                            test.level === "Beginner" && "bg-green-100 text-green-700"
                                        )}>
                                            {test.level}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {test.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {test.durationTakenString}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-2xl font-bold",
                                            test.percentage >= 80 && "text-green-600",
                                            test.percentage >= 60 && test.percentage < 80 && "text-yellow-600",
                                            test.percentage < 60 && "text-red-600"
                                        )}>
                                            {test.percentage}%
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {test.scoreObtained}/{test.totalScore} marks
                                        </p>
                                    </div>
                                    <button className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 transition-colors group">
                                        <Eye className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
