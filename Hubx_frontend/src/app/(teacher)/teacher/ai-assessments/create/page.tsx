"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperSummaryCard } from "@/components/teacher/ai/PaperSummaryCard";
import { MethodCard } from "@/components/teacher/ai/MethodCard";
import { getDraft } from "@/services/draft-service";
import { PaperConfig } from "@/types/generate-paper";

function CreatePaperContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");

    const [config, setConfig] = useState<PaperConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDraft = async () => {
            if (!draftId) {
                // Determine behavior on missing ID (e.g. fresh start or redirect)
                // For now, redirect back
                router.push("/teacher/ai-assessments");
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
                    <PaperSummaryCard config={config} showChaptersList={true} />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    {/* Dynamic Title */}
                    <h2 className="text-lg font-bold text-[#5b5bd6] mb-8 pb-4 border-b border-gray-100">
                        {config.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MethodCard
                            type="manual"
                            onClick={() => router.push(`/teacher/ai-assessments/create/manual?draftId=${draftId}`)}
                        />
                        <MethodCard
                            type="bulk"
                            onClick={() => router.push(`/teacher/ai-assessments/create/bulk?draftId=${draftId}`)}
                        />
                        <MethodCard
                            type="ai"
                            onClick={() => router.push(`/teacher/ai-assessments/create/ai?draftId=${draftId}`)}
                        />
                    </div>
                </div>
            </div>
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
