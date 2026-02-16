"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    BarChart3,
    Trophy,
    ArrowRight,
    HelpCircle,
    AlertCircle,
    Loader2,
    Sparkles,
    Calendar,
    Share2,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { EXAM_ENDPOINTS } from "@/lib/api-config";
import { ApiAssessmentResult } from "@/types/assessment";

export default function AssessmentIndividualResultPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<ApiAssessmentResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            setIsLoading(true);
            try {
                const response = await http.get<any>(EXAM_ENDPOINTS.result(attemptId));
                if (response.success) {
                    setResult(response.data);
                } else {
                    throw new Error(response.message || "Failed to fetch result");
                }
            } catch (err: any) {
                console.error("[ResultPage] Error:", err);
                setError(err.message || "Unable to load result. It might still be processing.");
            } finally {
                setIsLoading(false);
            }
        };

        if (attemptId) {
            fetchResult();
        }
    }, [attemptId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-indigo-100 rounded-full animate-pulse" />
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin absolute inset-0 m-auto" />
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">Analyzing your performance...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
                <div className="bg-white rounded-[32px] p-10 shadow-xl border border-red-50 max-w-md text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 italic">Result Unavailable</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">{error || "We couldn't find the result for this attempt."}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full mt-4 py-4 text-indigo-600 font-bold hover:bg-indigo-50 rounded-2xl transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const percentage = Math.round((result.score_details.obtained / result.score_details.max) * 100);
    const scoreColor = percentage >= 80 ? "text-emerald-500" : percentage >= 50 ? "text-amber-500" : "text-rose-500";
    const bgColor = percentage >= 80 ? "bg-emerald-50" : percentage >= 50 ? "bg-amber-50" : "bg-rose-50";

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Top Toolbar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all group"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </div>
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                            <Download className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Score Wheel */}
                    <div className="w-full lg:w-1/3 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className={cn("absolute top-0 left-0 w-full h-2", percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-rose-500")} />

                        <div className="relative mb-6">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-gray-50"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={553}
                                    strokeDashoffset={553 - (553 * percentage) / 100}
                                    strokeLinecap="round"
                                    className={cn("transition-all duration-1000 ease-out", scoreColor)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-5xl font-black italic", scoreColor)}>{percentage}%</span>
                                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Accuracy</span>
                            </div>
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 mb-2 italic">Performance Rating</h1>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                            {percentage >= 80 ? "Outstanding performance! You're dominating the curriculum." :
                                percentage >= 50 ? "Good effort. Consistent practice will help you reach elite status." :
                                    "Room for improvement. Review the core concepts and try again."}
                        </p>
                    </div>

                    {/* Right: Quick Stats */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title Card */}
                        <div className="col-span-full bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Assessment Result</span>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 italic">{result.exam_title}</h2>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(result.submission_date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="h-1 w-1 bg-gray-300 rounded-full" />
                                    <div className="flex items-center gap-1.5 uppercase tracking-wide">
                                        <Trophy className="h-4 w-4 text-amber-500" />
                                        {result.difficulty_level}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                            <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                                <Target className="h-7 w-7 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SCORE OBTAINED</p>
                                <p className="text-2xl font-black text-gray-900 italic">
                                    {result.score_details.obtained} <span className="text-gray-300 font-bold">/ {result.score_details.max}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                            <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                <Clock className="h-7 w-7 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TIME TAKEN</p>
                                <p className="text-2xl font-black text-gray-900 italic">
                                    {formatDuration(result.timings.time_taken_seconds)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex gap-4 col-span-full">
                            <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50 rounded-2xl p-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-1" />
                                <p className="text-xl font-black text-emerald-700">{result.stats.correct}</p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Correct</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center bg-rose-50 rounded-2xl p-4">
                                <XCircle className="h-6 w-6 text-rose-600 mb-1" />
                                <p className="text-xl font-black text-rose-700">{result.stats.wrong}</p>
                                <p className="text-[10px] font-bold text-rose-600 uppercase">Incorrect</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4">
                                <HelpCircle className="h-6 w-6 text-blue-600 mb-1" />
                                <p className="text-xl font-black text-blue-700">{result.stats.doubts}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase">Unanswered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Wise Performance */}
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 italic">Topic Breakdown</h3>
                            <p className="text-sm text-gray-500 font-medium">Subject-wise performance analysis</p>
                        </div>
                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* If we have subject breakdown data, map it here. For now show placeholder based on result tags */}
                        {result.tags_list.map((tag, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-gray-700 text-sm uppercase tracking-wide">{tag}</span>
                                    <span className="font-black text-indigo-600">{percentage}%</span>
                                </div>
                                <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations Page */}
                <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-[40px] p-10 shadow-xl shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy className="h-64 w-64 text-white" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white border border-white/30">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Next Steps</span>
                        </div>
                        <h3 className="text-4xl font-black text-white italic mb-4 leading-tight">Master this subject with precision.</h3>
                        <p className="text-indigo-50 font-medium text-lg mb-8 leading-relaxed">
                            Based on your performance, we've identified key areas where you can improve. Our AI tutor has prepared a custom practice session for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.push("/assessments")}
                                className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                            >
                                START PRACTICE <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-8 py-4 bg-white/10 text-white border border-white/30 backdrop-blur-sm rounded-2xl font-black hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                                BACK TO DASHBOARD
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
