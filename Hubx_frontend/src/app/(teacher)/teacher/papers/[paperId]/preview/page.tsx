"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";
import { cn } from "@/lib/utils";

export default function PaperPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = params.paperId as string;

    const [paper, setPaper] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (paperId) {
            loadPaperDetails();
        }
    }, [paperId]);

    const loadPaperDetails = async () => {
        setIsLoading(true);
        try {
            const response = await http.get<any>(TEACHER_ENDPOINTS.getPaperById(paperId));
            setPaper(response.data);
        } catch (error) {
            console.error("Failed to load paper details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
            </div>
        );
    }

    if (!paper) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900">Paper not found</h1>
                <button onClick={() => router.back()} className="text-[#6366f1] mt-4 hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{paper.title} (Preview)</h1>
                        <p className="text-sm text-gray-500">{paper.subject?.name} • {paper.standard}th Grade</p>
                    </div>
                </div>
            </div>

            {/* Paper Content */}
            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
                {/* Paper Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Paper Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Difficulty</p>
                            <p className="font-bold text-gray-900">{paper.difficulty}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Type</p>
                            <p className="font-bold text-gray-900">{paper.type === 'TIME_BOUND' ? 'Time Bound' : 'Untimed'}</p>
                        </div>
                        {paper.duration && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Duration</p>
                                <p className="font-bold text-gray-900">{paper.duration} mins</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Questions</p>
                            <p className="font-bold text-gray-900">{paper.questions?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {paper.description && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{paper.description}</p>
                    </div>
                )}

                {/* Chapters */}
                {paper.chapters && paper.chapters.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Chapters Covered</h2>
                        <div className="flex flex-wrap gap-2">
                            {paper.chapters.map((c: any) => (
                                <span key={c.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    {c.chapter?.name || c.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions Preview */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Questions Preview ({paper.questions?.length || 0})</h2>

                    {paper.questions && paper.questions.length > 0 ? (
                        paper.questions.map((q: any, index: number) => (
                            <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Q{index + 1}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                        q.difficulty === 'EASY' ? "bg-green-100 text-green-700" :
                                            q.difficulty === 'INTERMEDIATE' ? "bg-orange-100 text-orange-700" :
                                                "bg-red-100 text-red-700"
                                    )}>{q.difficulty}</span>
                                    <span className="text-xs font-medium text-gray-500">{q.type} • {q.marks} Marks</span>
                                </div>

                                <p className="font-medium text-gray-900 mb-3">{q.text}</p>

                                {q.questionImageUrl && (
                                    <div className="mb-4">
                                        <img src={q.questionImageUrl} alt="Question" className="max-h-80 rounded-lg border border-gray-200" />
                                    </div>
                                )}

                                {/* Hide answer for student preview */}
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                                    [Answer and explanation hidden from student view]
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No questions added yet.</p>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <span className="font-bold">Note:</span> This is how the paper will appear to students. Answers and explanations are hidden in student view.
                    </p>
                </div>
            </div>
        </div>
    );
}
