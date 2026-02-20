"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type Subject, type Standard, type Chapter } from "@/services/teacher-content";

interface QuestionBankFiltersProps {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    onChapterToggle?: (chapterId: string) => void;
    standards?: Standard[];
    subjects?: Subject[];
    chapters?: Chapter[];
    isOpen?: boolean;
    onClose?: () => void;
    isLoadingContent?: boolean;
}

export function QuestionBankFilters({ filters, onFilterChange, onChapterToggle, standards = [], subjects = [], chapters = [], isOpen, onClose, isLoadingContent }: QuestionBankFiltersProps) {
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Standards */}
            <div className="pl-1">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Standards</h3>
                <div className="space-y-3">
                    {isLoadingContent ? (
                        <p className="text-xs text-gray-500">Loading standards...</p>
                    ) : (standards?.length ?? 0) === 0 ? (
                        <p className="text-xs text-gray-500">No standards available</p>
                    ) : (
                        (standards ?? []).map((standard) => (
                            <label key={standard.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    filters.standardId === standard.id ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                )}>
                                    {filters.standardId === standard.id && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                </div>
                                <span className={cn("text-xs font-bold", filters.standardId === standard.id ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    {standard.name}
                                </span>
                                <input
                                    type="radio"
                                    name="standard"
                                    className="hidden"
                                    checked={filters.standardId === standard.id}
                                    onChange={() => onFilterChange("standardId", standard.id)}
                                />
                            </label>
                        ))
                    )}
                </div>
            </div>

            {/* Subjects */}
            <div className="pl-1">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Subjects</h3>
                <div className="space-y-3">
                    {isLoadingContent ? (
                        <p className="text-xs text-gray-500">Loading subjects...</p>
                    ) : (
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    !filters.subjectId ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                )}>
                                    {!filters.subjectId && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                </div>
                                <span className={cn("text-xs font-bold", !filters.subjectId ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    All Subjects
                                </span>
                                <input
                                    type="radio"
                                    name="subject"
                                    className="hidden"
                                    checked={!filters.subjectId}
                                    onChange={() => onFilterChange("subjectId", "")}
                                />
                            </label>
                            {(subjects ?? []).map((subject) => (
                                <label key={subject.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                        filters.subjectId === subject.id ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                                    )}>
                                        {filters.subjectId === subject.id && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                                    </div>
                                    <span className={cn("text-xs font-bold", filters.subjectId === subject.id ? "text-[#5b5bd6]" : "text-gray-600")}>
                                        {subject.name}
                                    </span>
                                    <input
                                        type="radio"
                                        name="subject"
                                        className="hidden"
                                        checked={filters.subjectId === subject.id}
                                        onChange={() => onFilterChange("subjectId", subject.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chapters */}
            {(chapters?.length ?? 0) > 0 && onChapterToggle && (
                <div className="pl-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Chapters</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(chapters ?? []).map((chapter) => (
                            <label key={chapter.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={(filters.chapterIds || []).includes(chapter.id)}
                                    onChange={() => onChapterToggle(chapter.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#5b5bd6] focus:ring-[#5b5bd6]"
                                />
                                <span className={cn("text-xs font-medium", (filters.chapterIds || []).includes(chapter.id) ? "text-[#5b5bd6]" : "text-gray-600")}>
                                    {chapter.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

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
                                name="difficulty"
                                className="hidden"
                                checked={filters.difficulty === level}
                                onChange={() => onFilterChange("difficulty", level)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating */}
            {/* <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Rating</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                            filters.rating === "4star" ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                        )}>
                            {filters.rating === "4star" && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-600 hover:text-[#5b5bd6] transition-colors">4 <span className="text-orange-400">★</span> & above</span>
                        </div>
                        <input
                            type="radio"
                            name="rating"
                            className="hidden"
                            checked={filters.rating === "4star"}
                            onChange={() => onFilterChange("rating", "4star")}
                        />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                            filters.rating === "popular" ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                        )}>
                            {filters.rating === "popular" && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                        </div>
                        <span className={cn("text-xs font-bold", filters.rating === "popular" ? "text-[#5b5bd6]" : "text-gray-600")}>Most Popular</span>
                        <input
                            type="radio"
                            name="rating"
                            className="hidden"
                            checked={filters.rating === "popular"}
                            onChange={() => onFilterChange("rating", "popular")}
                        />
                    </label>
                </div>
            </div> */}

            {/* Added Time */}
            {/* <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Added Time</h3>
                <div className="space-y-3">
                    {["Latest", "Oldest"].map((time) => (
                        <label key={time} className="flex items-center gap-3 cursor-pointer group">
                            <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                filters.addedTime === time ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                            )}>
                                {filters.addedTime === time && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                            </div>
                            <span className={cn("text-xs font-bold", filters.addedTime === time ? "text-[#5b5bd6]" : "text-gray-600")}>
                                {time}
                            </span>
                            <input
                                type="radio"
                                name="addedTime"
                                className="hidden"
                                checked={filters.addedTime === time}
                                onChange={() => onFilterChange("addedTime", time)}
                            />
                        </label>
                    ))}
                </div>
            </div> */}
        </div>
    );

    return (
        <>
            {/* Desktop View */}
            <div className="hidden lg:block w-[280px] shrink-0 bg-white rounded-2xl border border-[#f3e8ff] p-6 h-fit shadow-sm">
                <FilterContent />
            </div>

            {/* Mobile Drawer */}
            {onClose && (
                <>
                    <div className={cn(
                        "lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )} onClick={onClose} />

                    <div className={cn(
                        "lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}>
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <FilterContent />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
