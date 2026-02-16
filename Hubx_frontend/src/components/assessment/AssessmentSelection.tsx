import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Subject, PerformanceLevel } from "@/types/assessment";

const performanceColors: Record<PerformanceLevel, string> = {
    Excellent: "text-green-500",
    Average: "text-orange-500",
    Poor: "text-red-500",
};

export function SubjectCheckbox({
    subject,
    isSelected,
    onToggle,
}: {
    subject: Subject;
    isSelected: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            onClick={onToggle}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors min-h-[44px]"
        >
            <div
                className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0",
                    isSelected ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-300 bg-white"
                )}
            >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
            </div>
            <span className="text-sm font-medium text-gray-700 leading-tight">
                {subject.name} <span className={performanceColors[subject.performance]}>({subject.score}%)</span>
            </span>
        </div>
    );
}

export function ChapterAccordion({
    subject,
    selectedChapters,
    onToggleChapter,
    onSelectAllChapters,
}: {
    subject: Subject;
    selectedChapters: string[];
    onToggleChapter: (id: string) => void;
    onSelectAllChapters: (ids: string[]) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [includePoor, setIncludePoor] = useState(false);

    const chapters = subject.chapters || [];
    const allSelected = chapters.length > 0 && chapters.every((ch) => selectedChapters.includes(ch.id));

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50/50 cursor-pointer gap-3 sm:gap-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-sm md:text-base text-gray-800">Select {subject.name} Chapters</span>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIncludePoor(!includePoor);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                            includePoor
                                ? "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20"
                                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        )}
                    >
                        <div
                            className={cn(
                                "h-3 w-3 rounded-full border flex items-center justify-center shrink-0",
                                !includePoor ? "border-gray-400" : "bg-[#6366f1] border-[#6366f1]"
                            )}
                        >
                            {includePoor && <Check className="h-2 w-2 text-white" />}
                        </div>
                        <span className="whitespace-nowrap">Include Poor Performed</span>
                    </button>
                    {isOpen ? <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" /> : <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />}
                </div>
            </div>

            {isOpen && (
                <div className="p-3 md:p-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg w-fit">
                        <div
                            onClick={() => {
                                const ids = chapters.map((c) => c.id);
                                onSelectAllChapters(allSelected ? [] : ids);
                            }}
                            className={cn(
                                "h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors",
                                allSelected ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-300 bg-white"
                            )}
                        >
                            {allSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onSelectAllChapters(allSelected ? [] : chapters.map(c => c.id))}>All</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                        {chapters.map((chapter) => {
                            const isSelected = selectedChapters.includes(chapter.id);
                            return (
                                <div
                                    key={chapter.id}
                                    onClick={() => onToggleChapter(chapter.id)}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                                >
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                            isSelected ? "bg-gray-800 border-gray-800" : "border-gray-300 group-hover:border-gray-400"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {chapter.name}
                                        {chapter.questionCount && chapter.questionCount > 0 &&
                                            <span className="text-xs text-gray-400 ml-1">({chapter.questionCount} Qs)</span>
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
