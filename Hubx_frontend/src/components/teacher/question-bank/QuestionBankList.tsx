"use client";

import React, { useState } from "react";
import { Question } from "@/types/generate-paper";
import { cn } from "@/lib/utils";

interface QuestionBankListProps {
    questions: Question[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onAddQuestions: () => void;
    isAdding?: boolean;
}

export function QuestionBankList({ questions, selectedIds, onToggleSelect, onAddQuestions, isAdding }: QuestionBankListProps) {
    return (
        <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Select Questions</h2>
                <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-gray-900">{selectedIds.length} selected</span>
                    <button
                        onClick={onAddQuestions}
                        disabled={selectedIds.length === 0 || isAdding}
                        className={cn(
                            "h-10 px-6 rounded-lg text-xs font-bold transition-colors shadow-sm",
                            selectedIds.length > 0
                                ? "bg-[#4338ca] hover:bg-[#3730a3] text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isAdding ? "Adding..." : "Add Questions"}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {questions.map((q, index) => {
                    const isSelected = selectedIds.includes(q.id);
                    return (
                        <div
                            key={q.id}
                            className={cn(
                                "bg-white rounded-xl border p-6 transition-all",
                                isSelected ? "border-[#5b5bd6] shadow-sm bg-[#fdfcff]" : "border-gray-200 hover:border-indigo-200"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <div className="pt-1 shrink-0">
                                    <label className="relative flex items-center justify-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="peer h-5 w-5 appearance-none rounded border border-gray-300 checked:border-[#5b5bd6] checked:bg-[#5b5bd6] transition-colors"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(q.id)}
                                        />
                                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 17 12" fill="none">
                                            <path d="M1 5.917L5.724 10.5L16 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </label>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    {/* Tags */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold border",
                                            q.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                                                q.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                    "bg-red-50 text-red-700 border-red-200"
                                        )}>
                                            {q.difficulty}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 bg-gray-50">
                                            Thermodynamics
                                        </span>
                                    </div>

                                    {/* Question Text */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                                            Q{index + 1} - <span className="font-semibold text-gray-800">{q.content}</span>
                                        </h4>
                                    </div>

                                    {/* Solution */}
                                    <div>
                                        <h5 className="text-xs font-bold text-[#10b981] mb-2 uppercase tracking-wide">Solution</h5>
                                        <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {q.solution}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
