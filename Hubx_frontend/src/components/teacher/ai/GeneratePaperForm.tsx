"use client";

import React from "react";
import { PaperConfig, Chapter } from "@/types/generate-paper";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Standard, Subject } from "@/services/teacher-dashboard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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
                // When turning PUBLIC ON: set default price if not set
                onChange({
                    ...config,
                    isPublic: true,
                    price: config.price || 199 // Set default price if not set
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
            // Allow toggling independently - both can be true
            onChange({ ...config, [field]: value });
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
                    <SearchableSelect
                        options={standards
                            .filter(std => {
                                // Include standards that have:
                                // 1. Valid numeric standard (10, 11, 12, etc)
                                // 2. OR a valid name (Guni, BCA Sem 3, etc - even if standard is NaN)
                                const hasValidStandard = std.standard !== null && std.standard !== undefined && std.standard !== 0 && !isNaN(std.standard);
                                const hasValidName = std.name && std.name.trim().length > 0;
                                return hasValidStandard || hasValidName;
                            })
                            .map(std => {
                                // Check if name is purely numeric or has text
                                const isNumericOnly = std.name && /^\d+$/.test(std.name);
                                // If name is numeric-only, display as "Standard 10", otherwise use the name as-is
                                const displayLabel = isNumericOnly
                                    ? `Standard ${std.name}`
                                    : (std.name || `Standard ${std.standard}`);

                                return {
                                    id: std.id,
                                    label: displayLabel
                                };
                            })}
                        value={config.standardId || ""}
                        onChange={(selectedId) => {
                            const selectedStd = standards.find(s => s.id === selectedId);
                            if (selectedStd) {
                                // Display logic: use name if numeric-only, otherwise use the name directly
                                const isNumericOnly = selectedStd.name && /^\d+$/.test(selectedStd.name);
                                const displayLabel = isNumericOnly
                                    ? `Standard ${selectedStd.name}`
                                    : (selectedStd.name || `Standard ${selectedStd.standard}`);

                                // Update both ID and display value
                                onChange({
                                    ...config,
                                    standardId: selectedStd.id,
                                    standardValue: selectedStd.standard,
                                    standard: displayLabel,
                                    // Clear dependent fields
                                    subjectId: "",
                                    subject: "",
                                    chapters: []
                                });
                            }
                        }}
                        onCustomInput={(customValue) => {
                            // Handle custom standard input
                            onChange({
                                ...config,
                                standardId: `custom-${Date.now()}`,
                                standard: customValue,
                                // Clear dependent fields
                                subjectId: "",
                                subject: "",
                                chapters: []
                            });
                        }}
                        placeholder="Select Standard"
                        disabled={isSubmitting}
                        searchPlaceholder="Search standards or type a custom one..."
                        allowCustomInput={true}
                    />
                </div>
            </div>

            {/* Row 2: Subject & Free Access for School Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Select Subject</label>
                    <SearchableSelect
                        options={subjects
                            .filter(sub => sub.name && sub.name.trim() && !sub.name.toLowerCase().includes('null'))
                            .map(sub => ({
                                id: sub.id,
                                label: sub.name
                            }))}
                        value={config.subjectId || ""}
                        onChange={(selectedId) => {
                            const selectedSub = subjects.find(s => s.id === selectedId);
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
                        placeholder="Select Subject"
                        disabled={isSubmitting || !config.standardId}
                        searchPlaceholder="Search subjects..."
                    />
                </div>

                {/* Free Access for School Students */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Free Access for School Students</label>

                    <div className="flex items-center justify-center h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 transition-colors pointer-events-none">
                        <span className="text-sm font-bold text-gray-900">Free Paper For Student</span>
                        <div
                            className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ml-auto pointer-events-auto", config.schoolOnly ? "bg-[#5b5bd6]" : "bg-gray-200")}
                            onClick={() => !isSubmitting && handleChange("schoolOnly", !config.schoolOnly)}
                        >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.schoolOnly ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Students from your school will receive a free access code via email. Others can still purchase.
                    </p>
                </div>
            </div>

            {/* Row 3: Chapters Selection */}
            <div className="mb-8">
                <label className="block text-xs font-medium text-gray-500 mb-3">Select Chapters</label>
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

            {/* Row 4: Paper Type Toggles with Details */}
            <div className="mb-8">
                {/* <label className="block text-xs font-medium text-gray-500 mb-3">Select Paper Type</label> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Bound Test Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between h-11 px-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                            <span className="text-sm font-bold text-gray-900">Time Bound Test</span>
                            <div
                                className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative", config.isTimeBound ? "bg-[#5b5bd6]" : "bg-gray-200")}
                                onClick={() => !isSubmitting && handleChange("isTimeBound", !config.isTimeBound)}
                            >
                                <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.isTimeBound ? "translate-x-4" : "translate-x-0")} />
                            </div>
                        </div>
                        <div className={cn("transition-all", !config.isTimeBound && "opacity-50 pointer-events-none")}>
                            <label className={cn("block text-xs font-medium mb-2", config.isTimeBound ? "text-gray-500" : "text-gray-400")}>{config.isTimeBound ? "Duration (Mins)" : "Duration (Mins) - Enable Time Bound Test"}</label>
                            <div className="relative">
                                <select
                                    value={config.duration}
                                    onChange={(e) => handleChange("duration", Number(e.target.value))}
                                    disabled={isSubmitting || !config.isTimeBound}
                                    className={cn("w-full h-11 px-4 rounded-lg border text-sm font-bold appearance-none bg-white cursor-pointer focus:outline-none",
                                        config.isTimeBound
                                            ? "border-gray-200 text-gray-900 focus:border-indigo-500"
                                            : "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed"
                                    )}
                                >
                                    <option value={30}>30</option>
                                    <option value={60}>60</option>
                                    <option value={90}>90</option>
                                    <option value={120}>120</option>
                                </select>
                                <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", config.isTimeBound ? "text-gray-400" : "text-gray-300")} />
                            </div>
                        </div>
                    </div>

                    {/* Public Paper Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-center h-11 px-4 rounded-lg border border-gray-200 transition-colors pointer-events-none">
                            <span className="text-sm font-bold text-gray-900">Public Paper</span>
                            <div
                                className={cn("w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ml-auto pointer-events-auto", config.isPublic ? "bg-[#5b5bd6]" : "bg-gray-200")}
                                onClick={() => !isSubmitting && handleChange("isPublic", !config.isPublic)}
                            >
                                <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", config.isPublic ? "translate-x-4" : "translate-x-0")} />
                            </div>
                        </div>
                        <div className={cn("transition-all", !config.isPublic && "opacity-50 pointer-events-none")}>
                            <label className={cn("block text-xs font-medium mb-2", config.isPublic ? "text-gray-500" : "text-gray-400")}>{config.isPublic ? "Public Paper Price (INR)" : "Public Paper Price (INR) - Enable Public Paper"}</label>
                            <div className="relative">
                                <span className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm", config.isPublic ? "text-gray-500" : "text-gray-300")}>₹</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={config.price || ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        if (config.isPublic) {
                                            handleChange("price", val ? Number(val) : 0);
                                        }
                                    }}
                                    disabled={isSubmitting || !config.isPublic}
                                    className={cn("w-full h-11 pl-8 pr-4 rounded-lg border text-sm font-bold focus:outline-none",
                                        config.isPublic
                                            ? "border-gray-200 text-gray-900 focus:border-indigo-500 bg-white"
                                            : "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed"
                                    )}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button - Wired to onAddQuestion (Desktop Only) */}
            <div className="hidden lg:flex justify-center mt-6">
                <button
                    onClick={onAddQuestion}
                    disabled={isSubmitting}
                    className="w-full sm:w-[280px] h-14 bg-[#5b5bd6] hover:bg-[#4f46e5] active:bg-[#4340c9] text-white font-bold rounded-lg shadow-md transition-all text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
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
