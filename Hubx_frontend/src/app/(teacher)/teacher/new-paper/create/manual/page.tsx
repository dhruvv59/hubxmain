"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperSummaryCard } from "@/components/teacher/ai/PaperSummaryCard";
import { ManualQuestionForm, ManualQuestionFormRef } from "@/components/teacher/ai/ManualQuestionForm";
import { AddedQuestionsList } from "@/components/teacher/ai/AddedQuestionsList";
import { PublishConfirmModal } from "@/components/teacher/ai/PublishConfirmModal";
import { PublishSuccessModal } from "@/components/teacher/ai/PublishSuccessModal";
import { AppToast, type ToastVariant } from "@/components/ui/AppToast";
import { getDraft, addQuestionToDraft, removeQuestionFromDraft } from "@/services/draft-service";
import { PaperConfig, Question } from "@/types/generate-paper";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

function ManualPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");
    const showDoneFromBank = searchParams.get("showDone") === "true";

    const [config, setConfig] = useState<PaperConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showDoneButton, setShowDoneButton] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const formRef = useRef<ManualQuestionFormRef>(null);
    const [toast, setToast] = useState<{ message: string; variant: ToastVariant; isVisible: boolean }>({
        message: "", variant: "success", isVisible: false,
    });
    const showToast = (message: string, variant: ToastVariant = "success") =>
        setToast({ message, variant, isVisible: true });

    useEffect(() => {
        const fetchDraft = async () => {
            if (!draftId) {
                router.push("/teacher/new-paper");
                return;
            }
            try {
                const data = await getDraft(draftId);
                if (data) setConfig(data);

                // If coming from question bank, show Done button
                if (showDoneFromBank) {
                    setShowDoneButton(true);
                    // Clean URL by removing the showDone parameter
                    router.replace(`/teacher/new-paper/create/manual?draftId=${draftId}`);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDraft();
    }, [draftId, router, showDoneFromBank]);

    const handleAddQuestion = async (question: Question) => {
        if (!draftId) return;
        setIsSubmitting(true);
        try {
            if (selectedQuestion) {
                // Update existing question - merge with selected question's id
                const updatedQuestion = { ...question, id: selectedQuestion.id };
                await addQuestionToDraft(draftId, updatedQuestion as Question & { questionImage?: File; solutionImage?: File });

                // Reload config to show updated questions
                const updated = await getDraft(draftId);
                if (updated) setConfig(updated);

                // Clear form and selection
                if (formRef.current) {
                    formRef.current.resetForm();
                }
                setSelectedQuestion(null);

                showToast("Question updated successfully!", "success");
            } else {
                // Add new question
                await addQuestionToDraft(draftId, question as Question & { questionImage?: File; solutionImage?: File });

                // Reload config to update summary with new question count
                const updated = await getDraft(draftId);
                if (updated) setConfig(updated);

                // Clear form and selection
                if (formRef.current) {
                    formRef.current.resetForm();
                }
                setSelectedQuestion(null);

                showToast("Question added successfully!", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to save question. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDone = () => {
        // Redirect to the paper view page to see the added question
        if (draftId) {
            router.push(`/teacher/papers/${draftId}/preview`);
        }
    };

    const handleRemoveQuestion = async (id: string) => {
        if (!draftId) return;
        try {
            await removeQuestionFromDraft(draftId, id);
            const updated = await getDraft(draftId);
            if (updated) setConfig(updated);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenBank = () => {
        // Navigate to question bank with draftId
        if (draftId) {
            router.push(`/teacher/question-bank?draftId=${draftId}`);
        }
    };

    const handleConfirmPublish = async () => {
        if (!draftId) {
            console.error("No draft ID found");
            showToast("No draft found. Please try again.", "error");
            return;
        }

        setIsPublishing(true);
        try {
            await http.patch(TEACHER_ENDPOINTS.publishPaper(draftId), {});
            setIsPublishModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (error: any) {
            console.error("Publish failed:", error);
            showToast(error?.message || "Failed to publish paper. Please try again.", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="max-w-[1300px] mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Generate Paper</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9 font-medium">Discover and access quality papers created by expert teachers</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* <button className="h-10 px-6 rounded-lg border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">
                        Save Question Paper
                    </button> */}
                    <button
                        onClick={() => setIsPublishModalOpen(true)}
                        className="h-10 px-6 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors shadow-sm"
                    >
                        Publish Paper
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">

                {/* Sidebar Summary */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <PaperSummaryCard config={config} showChaptersList={true} />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {/* Manual Question Form */}
                    <ManualQuestionForm
                        ref={formRef}
                        questionNumber={(config.questions?.length || 0) + 1}
                        onAdd={handleAddQuestion}
                        onCancel={() => {
                            if (formRef.current) {
                                formRef.current.resetForm();
                            }
                            setSelectedQuestion(null);
                        }}
                        onOpenBank={handleOpenBank}
                        isSubmitting={isSubmitting}
                        showDoneButton={showDoneButton}
                        onDone={handleDone}
                        initialQuestion={selectedQuestion || undefined}
                    />

                    {/* Added Questions List with Details */}
                    <AddedQuestionsList
                        questions={config.questions || []}
                        onRemove={handleRemoveQuestion}
                        onSelectEdit={(question) => setSelectedQuestion(question)}
                    />
                </div>
            </div>

            <PublishConfirmModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onConfirm={handleConfirmPublish}
                isPublishing={isPublishing}
            />

            <PublishSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
            />
            <AppToast message={toast.message} variant={toast.variant} isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
        </div>
    );
}

export default function ManualQuestionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" /></div>}>
            <ManualPageContent />
        </Suspense>
    );
}
