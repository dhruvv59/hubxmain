"use client";

import React, { useState } from "react";

interface FilterSectionProps {
    title: string;
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

function FilterSection({ title, options, selected, onChange }: FilterSectionProps) {
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
                        <span className={`text-sm font-medium transition-colors ${selected === option ? "text-[#6366f1] font-semibold" : "text-gray-500 group-hover:text-gray-700"}`}>
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export function ExcursionFilterSidebar() {
    const [companyFilter, setCompanyFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    return (
        <div className="w-full h-full flex-shrink-0">
            {/* Filter Group */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <FilterSection
                    title="Companies"
                    options={["All", "Upcoming", "Approved", "Most Voted", "Pending"]}
                    selected={companyFilter}
                    onChange={setCompanyFilter}
                />
                <FilterSection
                    title="Company Type"
                    options={[
                        "All",
                        "Software",
                        "Renewable Energy",
                        "Biotechnology",
                        "Automotive",
                        "Finance",
                        "Aerospace"
                    ]}
                    selected={typeFilter}
                    onChange={setTypeFilter}
                />
            </div>
        </div>
    );
}
