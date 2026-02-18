"use client";

import React from "react";
import { PaperConfig, Chapter } from "@/types/generate-paper";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Standard, Subject } from "@/services/teacher-dashboard";

interface GeneratePaperFormProps {
    config: PaperConfig;
    onChange: (newConfig: PaperConfig) => void;
    onAddQuestion: () => void;
    isSubmitting?: boolean;
    standards: Standard[];
    subjects: Subject[];
}

export function GeneratePaperForm({ config, onChange, onAddQuestion, isSubmitting, standards, subjects }: GeneratePaperFormProps) {
    const handleChange = (field: keyof PaperConfig, value: any) => {
        // Special handling for isPublic toggle
        if (field === "isPublic") {
            if (value === true) {
                // When turning PUBLIC ON: turn off free access, set default price
                onChange({
                    ...config,
                    isPublic: true,
                    schoolOnly: false, // Auto-disable free access
                    price: config.price || 450 // Set default price if not set
                });
            } else {
                // When turning PUBLIC OFF: clear price
                onChange({
                    ...config,
                    isPublic: false,
                    price: 0 // Clear price
                });
            }
        }
        // Special handling for schoolOnly (free access) toggle
        else if (field === "schoolOnly") {
            if (value === true && config.isPublic) {
                // If trying to enable free access while public is ON, disable public first
                onChange({
                    ...config,
                    isPublic: false,
                    schoolOnly: true,
                    price: 0
                });
            } else {
                onChange({ ...config, [field]: value });
            }
        }
        else {
            onChange({ ...config, [field]: value });
        }
    };

    const toggleChapter = (id: string) => {
        const newChapters = config.chapters.map(c =>
            c.id === id ? { ...c, selected: !c.selected } : c
        );
        handleChange("chapters", newChapters);
    };

    const toggleAllChapters = () => {
        const allSelected = config.chapters.every(c => c.selected);
        const newChapters = config.chapters.map(c => ({ ...c, selected: !allSelected }));
        handleChange("chapters", newChapters);
    };

    const isAllChaptersSelected = config.chapters.length > 0 && config.chapters.every(c => c.selected);

    // Disable interactions while submitting
    const containerClasses = cn(
        "bg-white rounded-2xl border border-gray-200 p-8 shadow-sm",
        isSubmitting && "opacity-80 pointer-events-none"
    );

    return (
        <div className={containerClasses}>

            {/* Row 1: Title & Standard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Question Paper Title</label>
                    <input
                        type="text"
                        value={config.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        disabled={isSubmitting}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-300 disabled:bg-gray-50"
                        placeholder="Enter title"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Select Standard</label>
                    <div className="relative">
                        <select
                            value={config.standardId || ""}
                            onChange={(e) => {
                                const selectedStd = standards.find(s => s.id === e.target.value);
                                if (selectedStd) {
                                    // Update both ID and display value
                                    onChange({
                                        ...config,
                                        standardId: selectedStd.id,
                                        standardValue: selectedStd.standard,
                                        standard: `Standard ${selectedStd.standard}`,
                                        // Clear dependent fields
                                        subjectId: "",
                                        subject: "",
                                        chapters: []
                                    });
                                }
                            }}
                            disabled={isSubmitting}
                            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white cursor-pointer disabled:bg-gray-50"
                        >
                            <option value="" disabled>Select Standard</option>
                            {standards.map(std => (
                                <option key={std.id} value={std.id}>Standard {std.standard}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Row 2: Subject & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Select Subject</label>
                    <div className="relative">
                        <select
                            value={config.subjectId || ""}
                            onChange={(e) => {
                                const selectedSub = subjects.find(s => s.id === e.target.value);
                                if (selectedSub) {
                                    onChange({
                                        ...config,
                                        subjectId: selectedSub.id,
                                        subject: selectedSub.name,
                                        // Clear chapters
                                        chapters: []
                                    });
                                }
                            }}
                            disabled={isSubmitting || !config.standardId}
                            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white cursor-pointer disabled:bg-gray-50"
                        >
                            <option value="" disabled>Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Select Difficulty Level</label>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden h-11">
                        {["Easy", "Intermediate", "Advanced"].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange("difficulty", level)}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex-1 text-xs font-bold transition-colors border-r border-gray-100 last:border-r-0 hover:bg-gray-50 disabled:bg-gray-50",
                                    config.difficulty === level
                                        ? "bg-[#ede9fe] text-[#7c3aed]" // lighter purple bg, strong purple text
                                        : "bg-white text-gray-700"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Chapters Selection */}
            <div className="mb-8">
                <label className="block text-xs font-medium text-gray-500 mb-3">Select Science Chapters</label>
                <div className="border border-gray-200 rounded-xl p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        {/* All Checkbox */}
                        <label className="flex items-center space-x-3 cursor-pointer group select-none">
                            <div className={cn(
                                "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all",
                                isAllChaptersSelected ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-gray-300 group-hover:border-indigo-400"
                            )}>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isAllChaptersSelected}
                                    onChange={toggleAllChapters}
                                    disabled={isSubmitting}
                                />
                                {isAllChaptersSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                            </div>
                            <span className="text-sm font-bold text-gray-700">All</span>
                        </label>

                        {/* Individual Chapters */}
                        {config.chapters.map(chapter => (
                            <label key={chapter.id} className="flex items-center space-x-3 cursor-pointer group select-none">
                                <div className={cn(
                                    "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all",
                                    chapter.selected ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-gray-300 group-hover:border-indigo-400"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={chapter.selected}
                                        onChange={() => toggleChapter(chapter.id)}
                                        disabled={isSubmitting}
                                    />
                                    {chapter.selected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                                </div>
                                <span className={cn("text-sm transition-colors", chapter.selected ? "font-bold text-gray-900" : "font-medium text-gray-600")}>
                                    {chapter.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: Paper Type Toggles - All 3 in one row */}
            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-2">Select Paper Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Time Bound Test */}
                    <div className="flex items-center justify-between h-11 px-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                        <span className="text-sm font-bold text-gray-900">Time Bound Test</span>
                        <div
                            className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative", config.isTimeBound ? "bg-[#5b5bd6]" : "bg-gray-200")}
                            onClick={() => !isSubmitting && handleChange("isTimeBound", !config.isTimeBound)}
                        >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.isTimeBound ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    {/* Public Paper */}
                    <div className="flex items-center justify-between h-11 px-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                        <span className="text-sm font-bold text-gray-900">Public Paper</span>
                        <div
                            className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative", config.isPublic ? "bg-[#5b5bd6]" : "bg-gray-200")}
                            onClick={() => !isSubmitting && handleChange("isPublic", !config.isPublic)}
                        >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.isPublic ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>

                    {/* Free Access for School Students - ALWAYS VISIBLE */}
                    <div className="flex items-center justify-between h-11 px-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                        <span className="text-sm font-bold text-gray-900">Free Access for School Students</span>
                        <div
                            className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative", config.schoolOnly ? "bg-[#5b5bd6]" : "bg-gray-200")}
                            onClick={() => !isSubmitting && handleChange("schoolOnly", !config.schoolOnly)}
                        >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.schoolOnly ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>
                </div>

                {/* Description below all toggles - full width */}
                {config.schoolOnly && (
                    <p className="text-xs text-gray-500 px-2 mt-3">
                        Students from your school will receive a free access code via email. Others can still purchase.
                    </p>
                )}
            </div>

            {/* Row 5: Duration & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Duration (Mins)</label>
                    <div className="relative">
                        <select
                            value={config.duration}
                            onChange={(e) => handleChange("duration", Number(e.target.value))}
                            disabled={isSubmitting}
                            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white cursor-pointer disabled:bg-gray-50"
                        >
                            <option value={30}>30</option>
                            <option value={60}>60</option>
                            <option value={90}>90</option>
                            <option value={120}>120</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Price Field - ALWAYS IN DOM, HIDE WHEN PUBLIC IS OFF */}
                <div className={cn("transition-all", config.isPublic ? "opacity-100" : "opacity-0 pointer-events-none")}>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Public Paper Price (INR)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                        <input
                            type="number"
                            value={config.price}
                            onChange={(e) => config.isPublic && handleChange("price", Number(e.target.value))}
                            disabled={isSubmitting || !config.isPublic}
                            className="w-full h-11 pl-8 pr-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 disabled:bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Button - Wired to onAddQuestion */}
            <div className="flex justify-center">
                <button
                    onClick={onAddQuestion}
                    disabled={isSubmitting}
                    className="w-full sm:w-[250px] h-12 bg-[#5b5bd6] hover:bg-[#4f46e5] text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
