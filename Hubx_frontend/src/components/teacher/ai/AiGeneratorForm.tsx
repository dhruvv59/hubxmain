"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { PaperConfig } from "@/types/generate-paper";
import { cn } from "@/lib/utils";

interface AiGeneratorFormProps {
    config: PaperConfig;
    onGenerate: (count: number, instructions: string, difficulty: string) => void;
    onCancel: () => void;
    isGenerating?: boolean;
}

export function AiGeneratorForm({ config, onGenerate, onCancel, isGenerating }: AiGeneratorFormProps) {
    const [count, setCount] = useState<string>("");
    const [instructions, setInstructions] = useState("");
    const [difficulty, setDifficulty] = useState<string>(config.difficulty || "Intermediate");

    const handleGenerate = () => {
        const num = parseInt(count);
        if (num > 0) {
            onGenerate(num, instructions, difficulty);
        }
    };

    const selectedChaptersText = config.chapters
        .filter(c => c.selected)
        .map(c => c.name)
        .join(", ");

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 bg-white">
                <h3 className="text-sm font-bold text-gray-900">Question {config.questions?.length || 0}</h3>
            </div>

            <div className="p-8 bg-[#fdfcff]">
                <div className="bg-[#fcfaff] rounded-xl border border-[#f3e8ff] p-8">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-[#d946ef] fill-[#d946ef]" />
                        <h3 className="text-sm font-black italic tracking-wide uppercase text-gray-900">
                            AI SMART GENERATOR
                        </h3>
                    </div>

                    {/* Summary Info */}
                    <div className="mb-8">
                        <p className="text-sm font-bold text-[#5b5bd6] mb-3">AI will generate questions based on:</p>
                        <div className="space-y-1.5 pl-0.5">
                            <p className="text-xs font-bold text-gray-700">
                                <span className="text-gray-500 font-medium">Subject:</span> {config.subject}
                            </p>
                            <p className="text-xs font-bold text-gray-700 leading-relaxed">
                                <span className="text-gray-500 font-medium">Chapters:</span> {selectedChaptersText || "All Chapters"}
                            </p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Difficulty Level</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full md:w-[300px] h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#d946ef] bg-white appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235b5bd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: '36px'
                                }}
                                disabled={isGenerating}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Number of questions</label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                                className="w-full md:w-[300px] h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#d946ef] bg-white placeholder:text-gray-300"
                                placeholder="Enter number..."
                                min={1}
                                max={50}
                                disabled={isGenerating}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Additional Instructions (Optional)</label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="w-full h-24 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#d946ef] resize-none bg-white placeholder:text-gray-300"
                                placeholder="E.g., Focus more on numerical problems..."
                                disabled={isGenerating}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 py-8 bg-white border-t border-gray-100">
                <button
                    onClick={onCancel}
                    disabled={isGenerating}
                    className="w-[180px] h-11 rounded-lg border border-[#5b5bd6] text-[#5b5bd6] text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={!count || parseInt(count) <= 0 || isGenerating}
                    className="w-[180px] h-11 rounded-lg bg-[#4338ca] text-white text-sm font-bold hover:bg-[#3730a3] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Generate
                </button>
            </div>
        </div>
    );
}
