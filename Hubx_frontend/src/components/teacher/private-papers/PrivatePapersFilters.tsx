"use client";

import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PrivatePaperFilters } from "@/types/private-paper";

interface PrivatePapersFiltersProps {
    className?: string;
    filters: PrivatePaperFilters;
    onFilterChange: (key: keyof Omit<PrivatePaperFilters, "page" | "limit">, value: string) => void;
    availableSubjects?: string[];
    availableStandards?: string[];
}

export function PrivatePapersFilters({ className, filters, onFilterChange, availableSubjects = [], availableStandards = [] }: PrivatePapersFiltersProps) {
    const router = useRouter();

    // Use dynamic lists if available. If empty, it means either loading or no papers exist with metadata.
    // In strict dynamic mode ("only show what exists"), we defaults to just ["All"] if nothing is returned.
    const displaySubjects = availableSubjects.length > 0 ? ["All", ...availableSubjects] : ["All"];
    const displayStandards = availableStandards.length > 0 ? ["All", ...availableStandards] : ["All"];

    return (
        <div className={cn("w-[280px] shrink-0 flex flex-col gap-6", className)}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Subjects */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Subjects</h3>
                    <div className="space-y-3">
                        {displaySubjects.map((subject) => (
                            <label key={subject} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    filters.subject === subject ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                )}>
                                    {filters.subject === subject && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                </div>
                                <span className={cn("text-xs font-bold", filters.subject === subject ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    {subject}
                                </span>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={filters.subject === subject}
                                    onChange={() => onFilterChange("subject", subject)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Standard */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Standard</h3>
                    <div className="space-y-3">
                        {displayStandards.map((std) => (
                            <label key={std} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    filters.std === std ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                )}>
                                    {filters.std === std && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                </div>
                                <span className={cn("text-xs font-bold", filters.std === std ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    {std}
                                </span>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={filters.std === std}
                                    onChange={() => onFilterChange("std", std)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Difficulty Level */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Difficulty Level</h3>
                    <div className="space-y-3">
                        {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                            <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    filters.difficulty === level ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                )}>
                                    {filters.difficulty === level && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                </div>
                                <span className={cn("text-xs font-bold", filters.difficulty === level ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    {level}
                                </span>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={filters.difficulty === level}
                                    onChange={() => onFilterChange("difficulty", level)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Smart Generator Card */}
            <div
                onClick={() => router.push("/teacher/ai-assessments/create")}
                className="bg-white rounded-2xl border border-[#f3e8ff] p-5 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#dbeafe]" />

                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-black italic tracking-wide text-gray-900">
                            AI SMART
                        </h3>
                        <Sparkles className="w-4 h-4 text-[#d946ef] fill-[#d946ef]" />
                    </div>
                </div>
                <h3 className="text-base font-black italic tracking-wide text-gray-900 mb-3">
                    GENERATOR
                </h3>

                <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-[#5b5bd6] transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5b5bd6]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
