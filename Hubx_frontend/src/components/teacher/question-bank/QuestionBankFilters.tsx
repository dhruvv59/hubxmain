"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface QuestionBankFiltersProps {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export function QuestionBankFilters({ filters, onFilterChange, isOpen, onClose }: QuestionBankFiltersProps) {
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Subjects */}
            <div className="pl-1">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Subjects</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                            filters.subject === "Science" ? "border-[#5b5bd6]" : "border-gray-300 group-hover:border-[#5b5bd6]"
                        )}>
                            {filters.subject === "Science" && <div className="w-2.5 h-2.5 rounded-full bg-[#5b5bd6]" />}
                        </div>
                        <span className={cn("text-xs font-bold", filters.subject === "Science" ? "text-[#5b5bd6]" : "text-gray-600")}>Science</span>
                    </label>
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
            <div>
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
            </div>

            {/* Added Time */}
            <div>
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
            </div>
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
