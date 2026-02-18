"use client";

import React, { useState } from "react";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";

export interface FilterSectionProps {
    title: string;
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

export function FilterSection({ title, options, selected, onChange }: FilterSectionProps) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {options.map((option) => (
                    <label key={option} className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                            <input
                                type="radio"
                                className="peer appearance-none w-5 h-5 border-[1.5px] border-gray-300 rounded-full checked:border-[#6366f1] checked:border-[5px] transition-all"
                                checked={selected === option}
                                onChange={() => onChange(option)}
                            />
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${selected === option ? "text-[#6366f1]" : "text-gray-500 group-hover:text-gray-700"}`}>
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

interface FilterSidebarProps {
    filters: {
        subject: string;
        standard: string;
        difficulty: string;
        rating: string;
    };
    onFilterChange: (key: string, value: string) => void;
    availableSubjects?: string[];
    availableStandards?: string[];
}

export function FilterSidebar({ filters, onFilterChange, availableSubjects = [], availableStandards = [] }: FilterSidebarProps) {
    // Use dynamic lists if available, otherwise default to empty (user will see only "All")
    const subjectOptions = availableSubjects.length > 0 ? ["All", ...availableSubjects] : ["All"];
    const standardOptions = availableStandards.length > 0 ? ["All", ...availableStandards] : ["All"];

    return (
        <div className="w-[280px] flex-shrink-0 pt-2">
            {/* Filter Group */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <FilterSection
                    title="Subjects"
                    options={subjectOptions}
                    selected={filters.subject}
                    onChange={(val) => onFilterChange("subject", val)}
                />
                <FilterSection
                    title="Standard"
                    options={standardOptions}
                    selected={filters.standard}
                    onChange={(val) => onFilterChange("standard", val)}
                />
                <FilterSection
                    title="Difficulty Level"
                    options={["All", "Beginner", "Intermediate", "Advanced"]}
                    selected={filters.difficulty}
                    onChange={(val) => onFilterChange("difficulty", val)}
                />
                <FilterSection
                    title="Rating"
                    options={["All", "4 ★ & above", "Most Popular"]}
                    selected={filters.rating}
                    onChange={(val) => onFilterChange("rating", val)}
                />
            </div>

            {/* AI Banner Sidebar */}
            <div className="h-[120px] bg-white rounded-2xl border border-[#e9d5ff] p-6 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-black italic text-gray-900 leading-none">
                            AI SMART <br />
                            <span className="text-[#a855f7]">GENERATOR</span>
                            <Sparkles className="inline-block w-5 h-5 text-[#a855f7] ml-2 fill-current" />
                        </h3>
                    </div>
                </div>
                <div className="self-end h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center bg-white z-10 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                </div>
            </div>
        </div>
    );
}
