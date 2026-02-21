"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Save, Loader2, MessageCircle, FileText, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";
import { teacherQuestionService, Question } from "@/services/teacher-questions";
import { teacherDoubtService, Doubt } from "@/services/teacher-doubts";
import { PrivatePaper } from "@/types/private-paper";
import { QuestionForm } from "@/components/teacher/questions/QuestionForm";
import { QuestionBankModal } from "@/components/teacher/questions/QuestionBankModal";
import { useToast } from "@/components/ui/ToastContainer";

export default function PaperDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = params.id as string;
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<"overview" | "questions" | "doubts">("overview");
    const [paper, setPaper] = useState<any>(null); // Using any for now to match backend response roughly
    const [isLoading, setIsLoading] = useState(true);

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    // Doubts State
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoadingDoubts, setIsLoadingDoubts] = useState(false);
    const [replyText, setReplyText] = useState<string>("");
    const [replyingToDoubt, setReplyingToDoubt] = useState<string | null>(null);

    // Modal States
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

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

    // --- Questions Logic ---
    const loadQuestions = async () => {
        setIsLoadingQuestions(true);
        try {
            console.log('🔍 Loading questions for paperId:', paperId);
            const data = await teacherQuestionService.getAll(paperId);
            console.log('✅ Questions loaded:', data);
            console.log('📊 Number of questions:', data?.length || 0);
            setQuestions(data); // getAll returns Question[] directly
        } catch (error) {
            console.error('❌ Failed to load questions:', error);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsBulkUploading(true);
        try {
            await teacherQuestionService.bulkUpload(paperId, file);
            addToast("Questions uploaded successfully!", "success");
            loadQuestions();
        } catch (error) {
            console.error("Bulk upload failed:", error);
            addToast("Failed to upload questions. Please check the file format.", "error");
        } finally {
            setIsBulkUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    useEffect(() => {
        if (activeTab === "questions") {
            loadQuestions();
        } else if (activeTab === "doubts") {
            loadDoubts();
        }
    }, [activeTab]);



    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            await teacherQuestionService.delete(paperId, questionId);
            loadQuestions();
        } catch (error) {
            console.error("Failed to delete question:", error);
        }
    };

    const handlePublish = async () => {
        if (paper.status === 'PUBLISHED') {
            addToast("This paper is already published!", "warning");
            return;
        }

        if (!confirm("Are you sure you want to publish this paper? It cannot be edited after publishing.")) {
            return;
        }

        setIsPublishing(true);
        try {
            await http.patch<any>(TEACHER_ENDPOINTS.publishPaper(paperId));
            addToast("Paper published successfully!", "success");
            loadPaperDetails();
        } catch (error: any) {
            console.error("Failed to publish paper:", error);
            addToast(error.response?.data?.message || "Failed to publish paper. Please try again.", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePreview = () => {
        // Navigate to paper preview as student would see it
        router.push(`/teacher/papers/${paperId}/preview`);
    };

    // --- Doubts Logic ---
    const loadDoubts = async () => {
        setIsLoadingDoubts(true);
        try {
            const data = await teacherDoubtService.getAll(paperId);
            setDoubts(data);
        } catch (error) {
            console.error("Failed to load doubts:", error);
        } finally {
            setIsLoadingDoubts(false);
        }
    };

    const handleReplyDoubt = async (doubtId: string) => {
        if (!replyText.trim()) return;
        try {
            await teacherDoubtService.reply(doubtId, replyText);
            setReplyingToDoubt(null);
            setReplyText("");
            loadDoubts();
        } catch (error) {
            console.error("Failed to reply to doubt:", error);
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
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{paper.title}</h1>
                    <p className="text-sm text-gray-500">{paper.subject?.name} • {paper.standard}th Grade</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <button
                        onClick={handlePreview}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || paper.status === 'PUBLISHED'}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors",
                            paper.status === 'PUBLISHED'
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-[#6366f1] text-white hover:bg-[#4f4fbe] disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                        {paper.status === 'PUBLISHED' ? 'Published' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    {["overview", "questions", "doubts"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors",
                                activeTab === tab
                                    ? "border-[#6366f1] text-[#6366f1]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {paper.description || "No description provided."}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Chapters Covered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {paper.chapters && paper.chapters.length > 0 ? (
                                        paper.chapters.map((c: any) => (
                                            <span key={c.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                {c.chapter?.name || c.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No chapters linked</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Attempts</span>
                                        <span className="font-bold text-gray-900">{paper.totalAttempts || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Average Score</span>
                                        <span className="font-bold text-gray-900">{paper.averageScore || 0}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className={cn(
                                            "font-bold px-2 py-0.5 rounded text-xs",
                                            paper.status === 'PUBLISHED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        )}>{paper.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Questions ({questions.length})</h3>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleBulkUpload}
                                        className="hidden"
                                        id="bulk-upload"
                                        disabled={isBulkUploading}
                                    />
                                    <label
                                        htmlFor="bulk-upload"
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer",
                                            isBulkUploading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isBulkUploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                        Bulk Upload
                                    </label>
                                </div>
                                <button
                                    onClick={() => setShowQuestionForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] transition-colors font-medium text-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </button>
                            </div>
                        </div>



                        {isLoadingQuestions ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No questions added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questions.map(q => (
                                    <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                                        q.difficulty === 'EASY' ? "bg-green-100 text-green-700" :
                                                            q.difficulty === 'INTERMEDIATE' ? "bg-orange-100 text-orange-700" :
                                                                "bg-red-100 text-red-700"
                                                    )}>{q.difficulty}</span>
                                                    <span className="text-xs font-medium text-gray-500">{q.type} • {q.marks} Marks</span>
                                                </div>
                                                <p className="font-medium text-gray-900 mb-2">{q.text}</p>
                                                {q.questionImageUrl && (
                                                    <div className="mb-3">
                                                        <img src={q.questionImageUrl} alt="Question Attachment" className="max-h-60 rounded-lg border border-gray-200" />
                                                    </div>
                                                )}
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                                                    <span className="font-bold text-gray-500 mr-2">Answer:</span>
                                                    {q.correctAnswer || "See explanation"}
                                                </div>
                                                {q.explanation && (
                                                    <div className="mt-3 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                        <span className="font-bold text-blue-700 block mb-1 text-xs uppercase tracking-wider">Solution / Explanation</span>
                                                        <p className="leading-relaxed">{q.explanation}</p>
                                                        {q.solutionImageUrl && (
                                                            <div className="mt-3">
                                                                <img src={q.solutionImageUrl} alt="Solution Attachment" className="max-h-60 rounded-lg border border-gray-200" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "doubts" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Student Doubts ({doubts.length})</h3>

                        {isLoadingDoubts ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
                            </div>
                        ) : doubts.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No doubts raised yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {doubts.map(doubt => (
                                    <div key={doubt.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {doubt.studentId ? "S" : "?"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Student Question</p>
                                                    <p className="text-xs text-gray-500">{new Date(doubt.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 rounded-full",
                                                doubt.status === 'RESOLVED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            )}>{doubt.status}</span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <p className="text-gray-900 font-medium">{doubt.content}</p>
                                        </div>

                                        {doubt.replies && doubt.replies.length > 0 ? (
                                            <div className="bg-[#f5f6ff] p-4 rounded-lg border border-[#e0e7ff] space-y-2">
                                                <p className="text-xs font-bold text-[#6366f1] mb-1">Replies</p>
                                                {doubt.replies.map(reply => (
                                                    <div key={reply.id} className="border-l-2 border-[#6366f1] pl-2">
                                                        <p className="text-xs text-gray-500 font-bold mb-0.5">{reply.teacher?.name || "You"}</p>
                                                        <p className="text-gray-800 text-sm">{reply.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                {replyingToDoubt === doubt.id ? (
                                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366f1] outline-none mb-3"
                                                            placeholder="Type your explanation here..."
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleReplyDoubt(doubt.id)}
                                                                className="px-4 py-2 bg-[#6366f1] text-white text-sm font-bold rounded-lg hover:bg-[#4f4fbe]"
                                                            >
                                                                Submit Reply
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingToDoubt(null)}
                                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 text-sm font-bold rounded-lg"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setReplyingToDoubt(doubt.id);
                                                            setReplyText("");
                                                        }}
                                                        className="text-sm font-bold text-[#6366f1] hover:underline mt-2"
                                                    >
                                                        Reply to Doubt
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
                <QuestionForm
                    paperId={paperId}
                    onQuestionAdded={() => {
                        loadQuestions();
                        setShowQuestionForm(false);
                    }}
                    onClose={() => setShowQuestionForm(false)}
                    questionNumber={questions.length + 1}
                    onOpenQuestionBank={() => {
                        setShowQuestionForm(false);
                        setShowQuestionBank(true);
                    }}
                />
            )}

            {/* Question Bank Modal */}
            {showQuestionBank && (
                <QuestionBankModal
                    paperId={paperId}
                    onQuestionAdded={() => {
                        loadQuestions();
                        setShowQuestionBank(false);
                    }}
                    onClose={() => setShowQuestionBank(false)}
                />
            )}
        </div>
    );
}
