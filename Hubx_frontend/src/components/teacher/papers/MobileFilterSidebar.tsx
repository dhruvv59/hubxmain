"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterSection } from "./FilterSidebar";

interface MobileFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        subject: string;
        standard: string;
        difficulty: string;
        rating: string;
    };
    onFilterChange: (key: string, value: string) => void;
}

export function MobileFilterSidebar({ isOpen, onClose, filters, onFilterChange }: MobileFilterSidebarProps) {
    // Prevent scrolling when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 lg:hidden transition-all duration-300",
                isOpen ? "visible" : "invisible pointer-events-none"
            )}
        >
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />
            {/* Sidebar */}
            <div
                className={cn(
                    "absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900 z-10">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <FilterSection
                                title="Subjects"
                                options={["All", "Science", "Mathematics"]}
                                selected={filters.subject}
                                onChange={(val) => onFilterChange("subject", val)}
                            />
                            <FilterSection
                                title="Standard"
                                options={["All", "8th", "9th", "10th"]}
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
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
