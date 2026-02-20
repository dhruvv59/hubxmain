"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

export interface FilterSectionProps {
    title: string;
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

export function FilterSection({ title, options, selected, onChange }: FilterSectionProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const showSearch = options.length > 5;

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        return options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>

            {showSearch && (
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
            )}

            <div className={`space-y-3 ${showSearch && filteredOptions.length > 5 ? 'max-h-48 overflow-y-auto' : ''}`}>
                {filteredOptions.map((option) => (
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
                {filteredOptions.length === 0 && (
                    <p className="text-sm text-gray-400 py-2">No options found</p>
                )}
            </div>
        </div>
    );
}

interface FilterSidebarProps {
    filters: {
        subject: string;
        standard: string;
        difficulty: string;
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
                    title="Standard"
                    options={standardOptions}
                    selected={filters.standard}
                    onChange={(val) => onFilterChange("standard", val)}
                />
                <FilterSection
                    title="Subjects"
                    options={subjectOptions}
                    selected={filters.subject}
                    onChange={(val) => onFilterChange("subject", val)}
                />            
                <FilterSection
                    title="Difficulty Level"
                    options={["All", "Beginner", "Intermediate", "Advanced"]}
                    selected={filters.difficulty}
                    onChange={(val) => onFilterChange("difficulty", val)}
                />
            </div>
        </div>
    );
}
