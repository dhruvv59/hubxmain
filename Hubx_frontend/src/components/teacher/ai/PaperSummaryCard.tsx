"use client";

import React from "react";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { PaperConfig } from "@/types/generate-paper";
import { cn } from "@/lib/utils";

export interface PaperSummaryCardProps {
    config: PaperConfig;
    showChaptersList?: boolean;
    paperId?: string;
    isPublished?: boolean;
    onPublish?: (paperId: string) => Promise<void>;
    onUnpublish?: (paperId: string) => Promise<void>;
}

export function PaperSummaryCard({
    config,
    showChaptersList = false,
    paperId,
    isPublished = false,
    onPublish,
    onUnpublish
}: PaperSummaryCardProps) {
    const selectedChaptersCount = config.chapters.filter(c => c.selected).length;
    const isAllSelected = selectedChaptersCount === config.chapters.length && config.chapters.length > 0;
    const [isExpanded, setIsExpanded] = React.useState(showChaptersList);
    const [isPublishing, setIsPublishing] = React.useState(false);

    // If showing full list, display actual chapter names
    const selectedChapters = config.chapters.filter(c => c.selected);

    // Validation checks
    const questionsCount = config.questions?.length || 0;
    const hasValidTitle = config.title && config.title.trim().length > 0;
    const hasPriceSet = config.isPublic ? config.price && config.price > 0 : true;
    const canPublish = hasValidTitle && questionsCount > 0 && hasPriceSet && !isPublished;
    const canUnpublish = isPublished && paperId;

    const handlePublishClick = async () => {
        if (!paperId || !onPublish) return;

        setIsPublishing(true);
        try {
            await onPublish(paperId);
        } catch (error) {
            console.error("Failed to publish:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublishClick = async () => {
        if (!paperId || !onUnpublish) return;

        setIsPublishing(true);
        try {
            await onUnpublish(paperId);
        } catch (error) {
            console.error("Failed to unpublish:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-[#e9d5ff] p-6 shadow-sm h-fit sticky top-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Question Paper Summary</h3>

            <div className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">PAPER TITLE</label>
                    <p className="text-sm font-bold text-gray-800">{config.title || "Not set"}</p>
                </div>

                {/* Standard */}
                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">STANDARD</label>
                    <p className="text-sm font-bold text-gray-800">{config.standard || "Not selected"}</p>
                </div>

                {/* Subject */}
                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">SUBJECT</label>
                    <p className="text-sm font-bold text-gray-800">{config.subject || "Not selected"}</p>
                </div>

                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">CHAPTERS</label>
                    <div
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <p className="text-sm font-bold text-gray-800">
                            {isAllSelected ? `All (${config.chapters.length})` : `${selectedChaptersCount} Selected`}
                        </p>
                        <ChevronDown className={cn("w-4 h-4 text-gray-400 group-hover:text-[#8b5cf6] transition-transform", isExpanded ? "rotate-180" : "")} />
                    </div>

                    {/* Expanded List */}
                    {isExpanded && (
                        <div className="mt-3 pl-2 space-y-2 border-l-2 border-l-[#ede9fe]">
                            {selectedChapters.length > 0 ? selectedChapters.map(chapter => (
                                <p key={chapter.id} className="text-xs font-semibold text-gray-600">
                                    {chapter.name}
                                </p>
                            )) : (
                                <p className="text-xs text-gray-400 italic">No chapters selected</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">TIME</label>
                    <p className="text-sm font-bold text-gray-800">
                        {config.isTimeBound ? `${config.duration} Mins` : "Anytime (No limit)"}
                    </p>
                </div>

                {/* Paper Price */}
                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">PAPER PRICE</label>
                    <p className="text-base font-extrabold text-gray-900">
                        {config.isPublic && config.price ? `₹${config.price}` : "Free"}
                    </p>
                </div>

                {/* Access Details - Shows Configuration */}
                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">ACCESS TYPE</label>
                    <div className="space-y-2">
                        {/* Public Status */}
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.isPublic ? "bg-green-500" : "bg-gray-300")}></div>
                            <p className="text-xs font-semibold text-gray-700">
                                {config.isPublic ? "✓ Public Paper" : "○ Private Paper"}
                            </p>
                        </div>

                        {/* School Access Status */}
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.schoolOnly ? "bg-blue-500" : "bg-gray-300")}></div>
                            <p className="text-xs font-semibold text-gray-700">
                                {config.schoolOnly ? "✓ Free for School" : "○ No School Access"}
                            </p>
                        </div>
                    </div>

                    {/* Summary Message */}
                    <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs font-bold text-purple-900">
                            {isPublished
                                ? (config.isPublic && config.schoolOnly
                                    ? "📢 Published + 🎓 Free for your school"
                                    : config.isPublic
                                    ? "📢 Published + 💰 Everyone pays ₹" + config.price
                                    : "🔒 Published (Private)")
                                : (config.isPublic && config.schoolOnly
                                    ? "📢 Public Paper + 🎓 Free for your school students (via code)"
                                    : config.isPublic
                                    ? "📢 Public Paper + 💰 Everyone pays ₹" + config.price
                                    : config.schoolOnly
                                    ? "🔒 Private Paper + 🎓 Free for your school students only"
                                    : "🔒 Private Draft (Not published)")}
                        </p>
                    </div>
                </div>

                {/* Publish/Unpublish Section - Only show if paperId exists */}
                {paperId && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                        {!isPublished ? (
                            <>
                                {/* Validation Messages */}
                                {!hasValidTitle && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
                                        ❌ Title is required
                                    </div>
                                )}
                                {questionsCount === 0 && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
                                        ❌ Add at least 1 question before publishing
                                    </div>
                                )}
                                {config.isPublic && !hasPriceSet && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
                                        ❌ Set a price for public paper
                                    </div>
                                )}

                                {/* Publish Button */}
                                <button
                                    onClick={handlePublishClick}
                                    disabled={!canPublish || isPublishing}
                                    className={cn(
                                        "w-full h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        canPublish && !isPublishing
                                            ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            🚀 Publish Paper
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Published Status */}
                                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-semibold">
                                    ✅ Published - Visible to students
                                </div>

                                {/* Unpublish Button */}
                                <button
                                    onClick={handleUnpublishClick}
                                    disabled={isPublishing}
                                    className={cn(
                                        "w-full h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        !isPublishing
                                            ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Unpublishing...
                                        </>
                                    ) : (
                                        <>
                                            🔄 Unpublish
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
