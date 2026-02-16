"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { startAssessment, getAssessmentDetail, submitAssessment } from "@/services/assessment";
import { http } from "@/lib/http-client";
import { EXAM_ENDPOINTS } from "@/lib/api-config";
import { ExamLoadingSkeleton } from "@/components/exam/ExamLoadingSkeleton";
import { DoubtSubmitModal } from "@/components/exam/DoubtSubmitModal";
import { useExamState } from "@/hooks/useExamState";

// --- Question Data Types ---
interface QuestionData {
    id: string; // Backend uses string IDs
    questionNumber: number; // For display (1, 2, 3...)
    text: string;
    options: { id: string; text: string }[];
    correctOptionId?: string; // Not available during exam
    explanation?: string; // Not available during exam
    marks: number;
    type: string;
}

// --- Main Page Component ---
export default function TakePaperPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = params.id as string;

    // Backend integration state
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [examTitle, setExamTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);

    // Initial config for hook
    const [hookConfig, setHookConfig] = useState({
        attemptId: "",
        totalQuestions: 0,
        durationSeconds: 0
    });

    // Use the central exam state hook
    const examState = useExamState(hookConfig);

    // Initialize exam
    useEffect(() => {
        if (!paperId) return;
        initializeExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paperId]);

    const initializeExam = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Start exam - returns attemptId
            const { attemptId: newAttemptId } = await startAssessment(paperId);
            setAttemptId(newAttemptId);

            // Get exam data with questions
            const examData = await getAssessmentDetail(newAttemptId);

            // Transform questions to match UI format
            const transformedQuestions: QuestionData[] = examData.questions.map((q, index) => ({
                id: q.id, // Use real backend question ID (CUID)
                questionNumber: index + 1, // Human readable number (1, 2, 3...)
                text: q.text,
                options: q.options,
                marks: q.points,
                type: q.type
            }));

            setQuestions(transformedQuestions);
            setExamTitle(examData.title);

            setQuestions(transformedQuestions);
            setExamTitle(examData.title);

            // Trigger the hook to sync
            setHookConfig({
                attemptId: newAttemptId,
                totalQuestions: transformedQuestions.length,
                durationSeconds: examData.durationSeconds || 0
            });

            setIsLoading(false);
        } catch (err: any) {
            console.error('[TakePaperPage] Failed to initialize exam:', err);
            setError(err.message || 'Failed to load exam. Please try again.');
            setIsLoading(false);
        }
    };

    const currentQuestion = questions[examState.currentQuestionIndex];
    // We map answers using the backend question ID (CUID)
    const currentAnswer = currentQuestion ? examState.answers[currentQuestion.id] : undefined;

    // Derived Stats
    const answeredCount = Object.keys(examState.answers).length;
    const totalQuestions = questions.length;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- Questions and Answers ---
    const nextQuestion = () => {
        examState.setQuestionIndex(examState.currentQuestionIndex + 1);
    };

    const prevQuestion = () => {
        examState.setQuestionIndex(examState.currentQuestionIndex - 1);
    };

    const handleOptionSelect = (optionId: string, index: number) => {
        if (!attemptId || !questions[index]) return;
        const currentQ = questions[index];
        // Use backend ID from the question object. 
        examState.saveAnswer(currentQ.id, optionId, currentQ.type);
    };

    const toggleMark = () => {
        if (!currentQuestion) return;
        examState.toggleFlag(currentQuestion.id);
    };

    const handleSubmit = async () => {
        if (!attemptId) return;

        try {
            setIsSubmitting(true);
            await submitAssessment(attemptId, {}); // Save is handled by hook
            localStorage.removeItem(`exam:${attemptId}`);
            router.push(`/assessments/results/${attemptId}`);
        } catch (err: any) {
            console.error('[TakePaperPage] Failed to submit exam:', err);
            setError('Failed to submit exam. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Helper to determine option style
    const getOptionStyle = (optionId: string) => {
        // Real exam mode - no immediate feedback
        if (!currentAnswer) return "border-gray-100 hover:bg-gray-50";

        // If this is the selected answer, highlight it
        if (currentAnswer === optionId) {
            return "border-[#5b5bd6] bg-indigo-50 ring-1 ring-[#5b5bd6]";
        }

        return "border-gray-100";
    };

    // Loading state
    if (isLoading) {
        return <ExamLoadingSkeleton />;
    }

    // Error state
    if (error || !attemptId || questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Exam</h2>
                    <p className="text-gray-600 mb-6">{error || 'Unable to load exam questions. Please try again.'}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-[#5b5bd6] text-white rounded-lg font-bold hover:bg-[#4f4fbe]"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
            {/* Header / Nav if needed (Image shows clean view with back arrow) */}
            <div className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{examTitle || 'Exam'}</h1>
                        <p className="text-xs text-gray-500 font-medium">{totalQuestions} Questions</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Image
                        src="/assets/images/avatar-female-1.png"
                        alt="User" width={32} height={32} className="rounded-full"
                    />
                </div>
            </div>

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">

                {/* Left: Question Area */}
                <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
                    {/* Q List Sidebar (Mini) */}
                    <div className="w-[70px] border-r border-gray-100 flex flex-col items-center py-4 space-y-2 overflow-y-auto max-h-[800px] scrollbar-thin">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => examState.setQuestionIndex(idx)}
                                className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                                    examState.currentQuestionIndex === idx
                                        ? "bg-[#eaeaff] text-[#5b5bd6] ring-2 ring-[#5b5bd6] ring-offset-1"
                                        : examState.answers[q.id]
                                            ? "bg-green-50 text-green-600 border border-green-200"
                                            : "text-gray-400 hover:bg-gray-50"
                                )}
                            >
                                Q{q.questionNumber}
                            </button>
                        ))}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 p-8 relative flex flex-col">

                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[#5b5bd6] text-xs font-bold tracking-wider uppercase">QUESTION {currentQuestion.questionNumber}</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsDoubtModalOpen(true)}
                                    className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                                    title="Ask Teacher"
                                >
                                    <HelpCircle className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={toggleMark}
                                    className={cn("p-2 rounded-lg transition-colors", examState.flagged.has(currentQuestion.id) ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:bg-gray-50")} title="Mark for later"
                                >
                                    <Flag className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Text */}
                        <h2 className="text-lg font-bold text-gray-900 mb-8">
                            {currentQuestion.text}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4 mb-8">
                            {currentQuestion.options.map((option) => {
                                const isSelected = currentAnswer === option.id;
                                const styleClass = getOptionStyle(option.id);

                                return (
                                    <label
                                        key={option.id}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer group relative",
                                            styleClass
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestion.id}`}
                                            className="hidden"
                                            checked={isSelected}
                                            // Note: using questionNumber as key
                                            onChange={() => handleOptionSelect(option.id, examState.currentQuestionIndex)}
                                        />

                                        {/* Custom Radio Circle */}
                                        <div className={cn(
                                            "h-5 w-5 rounded-full border-[2px] flex items-center justify-center mr-4 shrink-0 transition-colors",
                                            isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300 group-hover:border-gray-400"
                                        )}>
                                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                        </div>

                                        <span className={cn("text-sm font-bold flex-1", isSelected ? "text-gray-900" : "text-gray-600")}>
                                            <span className="mr-2 opacity-70">{option.id}.</span> {option.text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Action Buttons Center */}
                        <div className="flex items-center justify-center space-x-4 mt-auto">
                            <button
                                onClick={prevQuestion}
                                disabled={examState.currentQuestionIndex === 0 || isSubmitting}
                                className="px-8 py-2.5 rounded-lg border border-gray-300 text-gray-500 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                onClick={nextQuestion}
                                disabled={isSubmitting}
                                className="px-8 py-2.5 rounded-lg bg-[#5b5bd6] text-white font-bold hover:bg-[#4f4fbe] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
                            >
                                {isSubmitting ? "Submitting..." : examState.currentQuestionIndex === totalQuestions - 1 ? "Submit Exam" : "Next"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Progress Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    {/* Timer Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-purple-100">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-gray-900">Test Progress</span>
                            <div className="flex items-center space-x-2 text-[#ff5757] bg-red-50 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono font-bold text-sm">{formatTime(examState.timeLeft)}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ANSWERED</span>
                                <span className="text-sm font-bold text-gray-900">{answeredCount}/{totalQuestions}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">REMAINING</span>
                                <span className="text-sm font-bold text-gray-900">{totalQuestions - answeredCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">DOUBTS</span>
                                <div className="flex items-center space-x-2">
                                    <HelpCircle className="h-3 w-3 text-orange-500" />
                                    <span className="text-sm font-bold text-gray-900">{examState.askTeacher.size}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">MARKED</span>
                                <div className="flex items-center space-x-2">
                                    <Flag className="h-3 w-3 text-yellow-500" />
                                    <span className="text-sm font-bold text-gray-900">{examState.flagged.size}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[140px]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">PROGRESS</span>
                        <div className="text-3xl font-black text-gray-900">
                            {answeredCount}<span className="text-gray-300">/{totalQuestions}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {Math.round((answeredCount / totalQuestions) * 100)}% Complete
                        </div>
                    </div>
                </div>
            </main>

            {/* Doubt Submission Modal */}
            {attemptId && currentQuestion && (
                <DoubtSubmitModal
                    isOpen={isDoubtModalOpen}
                    onClose={() => setIsDoubtModalOpen(false)}
                    attemptId={attemptId}
                    questionId={currentQuestion.id}
                    questionNumber={currentQuestion.questionNumber}
                />
            )}
        </div>
    );
}
