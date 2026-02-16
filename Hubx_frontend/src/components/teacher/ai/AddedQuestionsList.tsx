"use client";

import React from "react";
import { Question } from "@/types/generate-paper";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface AddedQuestionsListProps {
    questions: Question[];
    onRemove: (id: string) => void;
}

export function AddedQuestionsList({ questions, onRemove }: AddedQuestionsListProps) {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
                Added Questions ({questions.length})
            </h3>

            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                        {/* Header Tags & Remove */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                                    q.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                                        q.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                            "bg-red-50 text-red-700 border-red-200"
                                )}>
                                    {q.difficulty}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                                    q.type === "Text" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        q.type === "MCQ" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                            "bg-indigo-50 text-indigo-700 border-indigo-200"
                                )}>
                                    {q.type}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemove(q.id)}
                                className="px-4 py-1.5 rounded-full border border-red-200 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Question Content */}
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                                Q{index + 1}. {q.content}
                            </h4>
                        </div>

                        {/* MCQ Options */}
                        {q.type === "MCQ" && q.options && q.options.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Options</h5>
                                <div className="space-y-2">
                                    {q.options.map((option, optIndex) => (
                                        <div
                                            key={option.id}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-lg border",
                                                option.isCorrect
                                                    ? "bg-green-50/50 border-green-200"
                                                    : "bg-gray-50/50 border-gray-200"
                                            )}
                                        >
                                            {option.isCorrect ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {String.fromCharCode(65 + optIndex)}. {option.text}
                                                </span>
                                                {option.isCorrect && (
                                                    <span className="ml-2 text-xs font-bold text-green-600">
                                                        (Correct Answer)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fill in the Blanks Answers */}
                        {q.type === "Fill in the Blanks" && q.blanks && q.blanks.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Correct Answers</h5>
                                <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-200">
                                    <div className="space-y-2">
                                        {q.blanks.map((blank, blankIndex) => (
                                            <div key={blank.id} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-indigo-700 min-w-[60px]">
                                                    Blank {blankIndex + 1}:
                                                </span>
                                                <span className="text-sm font-medium text-gray-800 bg-white px-3 py-1 rounded border border-indigo-200">
                                                    {blank.correctAnswer}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Solution Content */}
                        {q.solution && q.solution.trim() && (
                            <div>
                                <h5 className="text-xs font-bold text-[#10b981] mb-2 uppercase tracking-wide">Solution</h5>
                                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                        {q.solution}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
