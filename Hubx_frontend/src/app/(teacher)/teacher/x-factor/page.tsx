"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PaperConfig } from "@/types/generate-paper";
import { GeneratePaperForm } from "@/components/teacher/ai/GeneratePaperForm";
import { PaperSummaryCard } from "@/components/teacher/ai/PaperSummaryCard";
import { saveDraft } from "@/services/draft-service";
import { getStandards, getSubjects, getChapters, Standard, Subject } from "@/services/teacher-dashboard";

const INITIAL_CONFIG: PaperConfig = {
    title: "",
    standard: "",
    subject: "",
    difficulty: "Intermediate",
    chapters: [],
    isTimeBound: true,
    isPublic: true,
    schoolOnly: false,
    duration: 60,
    price: 199,
    // Initialize IDs as empty
    standardId: "",
    subjectId: ""
};

export default function GeneratePaperPage() {
    const router = useRouter();
    const [config, setConfig] = useState<PaperConfig>(INITIAL_CONFIG);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Metadata State
    const [standards, setStandards] = useState<Standard[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // 1. Fetch Standards on Mount
    useEffect(() => {
        const fetchStandards = async () => {
            const data = await getStandards();
            // Include standards that have:
            // 1. Valid numeric standard (10, 11, 12, etc)
            // 2. OR a valid name (Guni, BCA Sem 3, etc - even if standard is NaN)
            const validStandards = data.filter(std => {
                const hasValidStandard = std.standard !== null && std.standard !== undefined && std.standard !== 0 && !isNaN(std.standard);
                const hasValidName = std.name && std.name.trim().length > 0;
                return hasValidStandard || hasValidName;
            });
            setStandards(validStandards);

            // Optional: Auto-select first standard if none selected
            if (validStandards.length > 0 && !config.standardId) {
                // We don't auto-select to force user choice, but could if desired
            }
        };
        fetchStandards();
    }, []);

    // 2. Fetch Subjects when Standard Changes
    useEffect(() => {
        if (!config.standardId) {
            setSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            const data = await getSubjects(config.standardId!);
            setSubjects(data);
        };
        fetchSubjects();
    }, [config.standardId]);

    // 3. Fetch Chapters when Subject Changes
    useEffect(() => {
        if (!config.standardId || !config.subjectId) {
            // Don't clear chapters here if we want to preserve them during rapid switching, 
            // but business logic implies chapters belong to subjects.
            // If subject changes, we MUST clear chapters and fetch new ones.
            // This logic is partially handled in the Form onChange, but fetching handles the population.
            return;
        }

        const fetchChapters = async () => {
            const data = await getChapters(config.standardId!, config.subjectId!);

            // Map backend chapters to frontend selection format
            const mappedChapters = data.map(ch => ({
                id: ch.id,
                name: ch.name,
                selected: false
            }));

            setConfig(prev => ({
                ...prev,
                chapters: mappedChapters
            }));
        };
        fetchChapters();
    }, [config.standardId, config.subjectId]);


    const handleAddQuestion = async () => {
        // Validation
        if (!config.title) {
            alert("Please enter a paper title");
            return;
        }
        if (!config.standardId || !config.subjectId) {
            alert("Please select standard and subject");
            return;
        }
        if (config.chapters.filter(c => c.selected).length === 0) {
            alert("Please select at least one chapter");
            return;
        }

        setIsSubmitting(true);
        try {
            const paperId = await saveDraft(config);
            // Go to the options page showing all available methods
            router.push(`/teacher/x-factor/create?draftId=${paperId}`);
        } catch (error: any) {
            console.error("Failed to save draft", error);
            alert(error.message || "Failed to create paper");
            setIsSubmitting(false); // Only reset on error
        }
    };

    return (
        <div className="max-w-[1300px] mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Generate Paper</h1>
                </div>
                <p className="text-gray-500 text-sm ml-9 font-medium">Generate intelligent papers from multiple materials using advanced AI</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Main Form */}
                <div className="flex-1 w-full">
                    <GeneratePaperForm
                        config={config}
                        onChange={setConfig}
                        onAddQuestion={handleAddQuestion}
                        isSubmitting={isSubmitting}
                        standards={standards}
                        subjects={subjects}
                    />
                </div>

                {/* Sidebar Summary */}
                <div className="w-full lg:w-[350px] shrink-0 order-2 lg:order-none">
                    <PaperSummaryCard config={config} />
                </div>
            </div>

            {/* Add Question Button - Mobile Only (Below Summary) */}
            <div className="flex justify-center lg:hidden mt-6 mb-20">
                <button
                    onClick={handleAddQuestion}
                    disabled={isSubmitting}
                    className="w-full sm:w-[280px] h-14 bg-[#5b5bd6] hover:bg-[#4f46e5] active:bg-[#4340c9] text-white font-bold rounded-lg shadow-md transition-all text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            {/* Loader icon */}
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        "Add Question"
                    )}
                </button>
            </div>
        </div>
    );
}
