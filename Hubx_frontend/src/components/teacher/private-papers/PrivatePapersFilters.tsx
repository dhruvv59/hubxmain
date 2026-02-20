"use client";

import React, { useState } from "react";
import { Sparkles, ChevronRight, Search } from "lucide-react";
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
    const [subjectSearch, setSubjectSearch] = useState("");
    const [standardSearch, setStandardSearch] = useState("");

    // Use dynamic lists if available. If empty, it means either loading or no papers exist with metadata.
    // In strict dynamic mode ("only show what exists"), we defaults to just ["All"] if nothing is returned.
    const displaySubjects = availableSubjects.length > 0 ? ["All", ...availableSubjects] : ["All"];
    const displayStandards = availableStandards.length > 0 ? ["All", ...availableStandards] : ["All"];

    // Filter subjects based on search
    const filteredSubjects = displaySubjects.filter(subject =>
        subject === "All" || subject.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    // Filter standards based on search
    const filteredStandards = displayStandards.filter(standard =>
        standard === "All" || standard.toLowerCase().includes(standardSearch.toLowerCase())
    );

    return (
        <div className={cn("w-[280px] shrink-0 flex flex-col gap-6", className)}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Standard */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Standard</h3>

                    {/* Search box (only show if more than 5 standards) */}
                    {displayStandards.length > 5 && (
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={standardSearch}
                                onChange={(e) => setStandardSearch(e.target.value)}
                                className="w-full h-8 pl-9 pr-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#5b5bd6] placeholder:text-gray-400"
                            />
                        </div>
                    )}

                    {/* Scrollable list with max height */}
                    <div className={cn("space-y-3", displayStandards.length > 8 && "max-h-[240px] overflow-y-auto pr-2")}>
                        {filteredStandards.length > 0 ? (
                            filteredStandards.map((std) => (
                                <label key={std} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
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
                                        onChange={() => {
                                            onFilterChange("std", std);
                                            setStandardSearch(""); // Clear search after selection
                                        }}
                                    />
                                </label>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 py-2">No standards found</p>
                        )}
                    </div>
                </div>

                {/* Subjects */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Subjects</h3>

                    {/* Search box (only show if more than 5 subjects) */}
                    {displaySubjects.length > 5 && (
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={subjectSearch}
                                onChange={(e) => setSubjectSearch(e.target.value)}
                                className="w-full h-8 pl-9 pr-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#5b5bd6] placeholder:text-gray-400"
                            />
                        </div>
                    )}

                    {/* Scrollable list with max height */}
                    <div className={cn("space-y-3", displaySubjects.length > 8 && "max-h-[240px] overflow-y-auto pr-2")}>
                        {filteredSubjects.length > 0 ? (
                            filteredSubjects.map((subject) => (
                                <label key={subject} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
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
                                        onChange={() => {
                                            onFilterChange("subject", subject);
                                            setSubjectSearch(""); // Clear search after selection
                                        }}
                                    />
                                </label>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 py-2">No subjects found</p>
                        )}
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
            {/* <div
                onClick={() => router.push("/teacher/x-factor/create")}
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
            </div> */}
        </div>
    );
}
