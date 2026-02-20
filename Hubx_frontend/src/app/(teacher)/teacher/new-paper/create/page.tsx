"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperSummaryCard } from "@/components/teacher/ai/PaperSummaryCard";
import { MethodCard } from "@/components/teacher/ai/MethodCard";
import { getDraft, publishPaper, unpublishPaper } from "@/services/draft-service";
import { PaperConfig } from "@/types/generate-paper";
import { AppToast, type ToastVariant } from "@/components/ui/AppToast";

function CreatePaperContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");

    const [config, setConfig] = useState<PaperConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [toast, setToast] = useState<{ message: string; variant: ToastVariant; isVisible: boolean }>({
        message: "", variant: "success", isVisible: false,
    });
    const showToast = (message: string, variant: ToastVariant = "success") =>
        setToast({ message, variant, isVisible: true });

    useEffect(() => {
        const fetchDraft = async () => {
            if (!draftId) {
                // Determine behavior on missing ID (e.g. fresh start or redirect)
                // For now, redirect back
                router.push("/teacher/new-paper");
                return;
            }

            try {
                const data = await getDraft(draftId);
                if (data) {
                    setConfig(data);
                } else {
                    console.error("Draft not found");
                    // Could redirect here too
                }
            } catch (error) {
                console.error("Failed to load draft", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDraft();
    }, [draftId, router]);

    const handleBack = () => {
        router.back();
    };

    const handlePublish = async (paperId: string) => {
        try {
            await publishPaper(paperId);
            setIsPublished(true);
            showToast("✅ Paper published successfully! Students can now see it.", "success");
            // Refresh config to reflect published status
            if (draftId) {
                const updatedConfig = await getDraft(draftId);
                if (updatedConfig) {
                    setConfig(updatedConfig);
                }
            }
        } catch (error: any) {
            console.error("Publish failed:", error);
            showToast(error.message || "Failed to publish paper", "error");
        }
    };

    const handleUnpublish = async (paperId: string) => {
        try {
            await unpublishPaper(paperId);
            setIsPublished(false);
            showToast("📝 Paper unpublished. It's now private again.", "success");
            // Refresh config
            if (draftId) {
                const updatedConfig = await getDraft(draftId);
                if (updatedConfig) {
                    setConfig(updatedConfig);
                }
            }
        } catch (error: any) {
            console.error("Unpublish failed:", error);
            showToast(error.message || "Failed to unpublish paper", "error");
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
        <div className="max-w-[1300px] mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Generate Paper</h1>
                </div>
                <p className="text-gray-500 text-sm ml-9 font-medium">Discover and access quality papers created by expert teachers</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Sidebar Summary - Left Side now */}
                <div className="w-full lg:w-[320px] shrink-0">
                    {/* Reusing the card with expanded chapters */}
                    <PaperSummaryCard
                        config={config}
                        showChaptersList={true}
                        paperId={draftId || undefined}
                        isPublished={isPublished}
                        onPublish={handlePublish}
                        onUnpublish={handleUnpublish}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    {/* Header with Title and Edit Button */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-[#5b5bd6]">
                            {config.title}
                        </h2>
                        <button
                            onClick={() => router.push(`/teacher/new-paper`)}
                            className="px-4 py-2 text-sm font-semibold text-[#5b5bd6] border border-[#5b5bd6] rounded-lg hover:bg-[#f5f3ff] transition-colors"
                        >
                            Edit Paper
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                        <MethodCard
                            type="manual"
                            onClick={() => router.push(`/teacher/new-paper/create/manual?draftId=${draftId}`)}
                        />
                        <MethodCard
                            type="bulk"
                            onClick={() => router.push(`/teacher/new-paper/create/bulk?draftId=${draftId}`)}
                        />
                        <MethodCard
                            type="bank"
                            onClick={() => router.push(`/teacher/new-paper/create/bank?draftId=${draftId}`)}
                        />
                    </div>
                </div>
            </div>

            <AppToast
                message={toast.message}
                variant={toast.variant}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

export default function CreatePaperPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
            </div>
        }>
            <CreatePaperContent />
        </Suspense>
    );
}
