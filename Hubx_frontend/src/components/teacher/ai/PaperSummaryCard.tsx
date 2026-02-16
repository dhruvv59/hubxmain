"use client";

import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { PaperConfig } from "@/types/generate-paper";
import { cn } from "@/lib/utils";

export function PaperSummaryCard({ config, showChaptersList = false }: { config: PaperConfig; showChaptersList?: boolean }) {
    const selectedChaptersCount = config.chapters.filter(c => c.selected).length;
    const isAllSelected = selectedChaptersCount === config.chapters.length && config.chapters.length > 0;
    const [isExpanded, setIsExpanded] = React.useState(showChaptersList);

    // If showing full list, display actual chapter names
    const selectedChapters = config.chapters.filter(c => c.selected);

    return (
        <div className="bg-white rounded-2xl border border-[#e9d5ff] p-6 shadow-sm h-fit sticky top-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Question Paper Summary</h3>

            <div className="space-y-5">
                <div>
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">SUBJECTS</label>
                    <p className="text-sm font-bold text-gray-800">{config.subject}</p>
                </div>

                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">DIFFICULTY LEVEL</label>
                    <p className="text-sm font-bold text-gray-800">{config.difficulty}</p>
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
                    <p className="text-sm font-bold text-gray-800">{config.duration} Mins</p>
                </div>

                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">PAPER PRICE</label>
                    <p className="text-base font-extrabold text-gray-900">₹{config.price}</p>
                </div>

                <div className="border-t border-gray-50 pt-3">
                    <label className="block text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">ACCESS</label>
                    <p className="text-sm font-bold text-gray-800">
                        {config.schoolOnly ? "Free for School (via code)" : "Public (Paid)"}
                    </p>
                </div>
            </div>
        </div>
    );
}
