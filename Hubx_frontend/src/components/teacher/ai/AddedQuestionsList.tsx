"use client";

import { useState } from "react";
import { Question } from "@/types/generate-paper";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, X } from "lucide-react";

interface AddedQuestionsListProps {
    questions: Question[];
    onRemove: (id: string) => void;
    onSelectEdit?: (question: Question | null) => void;
    /** When true, show section even when empty (e.g. on bank page) */
    alwaysShow?: boolean;
}

export function AddedQuestionsList({ questions, onRemove, onSelectEdit, alwaysShow = false }: AddedQuestionsListProps) {
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    if (!questions || questions.length === 0) {
        if (!alwaysShow) return null;
        return (
            <div className="mt-8 lg:mt-12 w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Added Questions (0)
                </h3>
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <p className="text-gray-500 font-medium text-sm mb-1">No questions added yet</p>
                    <p className="text-gray-400 text-xs">Select questions from the bank above and click &quot;Add Questions&quot;</p>
                </div>
            </div>
        );
    }

    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    const handleSelectQuestion = (question: Question) => {
        setSelectedQuestionId(question.id);
        onSelectEdit?.(question);
    };

    const handleClearSelection = () => {
        setSelectedQuestionId(null);
        onSelectEdit?.(null);
    };

    return (
        <div className="mt-8 lg:mt-12 w-full overflow-x-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
                Added Questions ({questions.length})
            </h3>

            {/* Questions Grid - Vertical Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        onClick={() => handleSelectQuestion(q)}
                        className={cn(
                            "bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                            selectedQuestionId === q.id
                                ? "border-[#5b5bd6] bg-indigo-50/30"
                                : "border-gray-200 hover:border-indigo-300"
                        )}
                    >
                        {/* Header Tags */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-[9px] font-bold border whitespace-nowrap",
                                    q.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                                        q.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                            "bg-red-50 text-red-700 border-red-200"
                                )}>
                                    {q.difficulty}
                                </span>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-[9px] font-bold border whitespace-nowrap",
                                    q.type === "Text" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        q.type === "MCQ" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                            "bg-indigo-50 text-indigo-700 border-indigo-200"
                                )}>
                                    {q.type}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedQuestionId === q.id) {
                                        handleClearSelection();
                                    }
                                    onRemove(q.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Question Content */}
                        <h4 className="text-sm font-bold text-gray-900 mb-3 line-clamp-3">
                            Q{index + 1}. {q.content}
                        </h4>

                        {/* Question Image - thumbnail in card */}
                        {q.questionImage && typeof q.questionImage === "string" && (
                            <div className="mb-2">
                                <img
                                    src={q.questionImage}
                                    alt="Question"
                                    className="max-h-20 w-full rounded-lg border border-gray-200 object-contain"
                                />
                            </div>
                        )}

                        {/* Type-specific Preview */}
                        {q.type === "MCQ" && q.options && q.options.length > 0 && (
                            <div className="text-[10px] text-gray-600 mb-2">
                                {q.options.length} options
                            </div>
                        )}
                        {q.type === "Fill in the Blanks" && q.blanks && q.blanks.length > 0 && (
                            <div className="text-[10px] text-gray-600 mb-2">
                                {q.blanks.length} blank(s)
                            </div>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold">
                            {q.questionImage && typeof q.questionImage === "string" && (
                                <span className="text-blue-600">📷 Has Image</span>
                            )}
                            {(q.solution?.trim() || (q.solutionImage && typeof q.solutionImage === "string")) && (
                                <span className="text-[#10b981]">✓ Has Solution</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Question Details - Full Content */}
            {selectedQuestion && (
                <div className="mt-8 bg-white rounded-2xl border-2 border-[#5b5bd6] p-4 sm:p-6 lg:p-8 shadow-sm">
                    {/* Header */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Question {(questions.findIndex(q => q.id === selectedQuestion.id) || 0) + 1}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold border",
                                selectedQuestion.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                                    selectedQuestion.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                        "bg-red-50 text-red-700 border-red-200"
                            )}>
                                {selectedQuestion.difficulty}
                            </span>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold border",
                                selectedQuestion.type === "Text" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    selectedQuestion.type === "MCQ" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                        "bg-indigo-50 text-indigo-700 border-indigo-200"
                            )}>
                                {selectedQuestion.type}
                            </span>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Question</h4>
                        <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {selectedQuestion.content}
                        </p>
                        {selectedQuestion.questionImage && typeof selectedQuestion.questionImage === "string" && (
                            <div className="mt-8">
                                <img
                                    src={selectedQuestion.questionImage}
                                    alt="Question"
                                    className="max-h-80 w-full rounded-lg border border-gray-200 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* MCQ Options */}
                    {selectedQuestion.type === "MCQ" && selectedQuestion.options && selectedQuestion.options.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">Options</h4>
                            <div className="space-y-3">
                                {selectedQuestion.options.map((option, optIndex) => (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            "flex items-start gap-3 p-4 rounded-lg border",
                                            option.isCorrect
                                                ? "bg-green-50/50 border-green-200"
                                                : "bg-gray-50/50 border-gray-200"
                                        )}
                                    >
                                        {option.isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                {String.fromCharCode(65 + optIndex)}. {option.text}
                                            </span>
                                            {option.isCorrect && (
                                                <span className="ml-2 text-xs font-bold text-green-600">
                                                    ✓ Correct Answer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fill in the Blanks Answers */}
                    {selectedQuestion.type === "Fill in the Blanks" && selectedQuestion.blanks && selectedQuestion.blanks.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">Correct Answers</h4>
                            <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-200">
                                <div className="space-y-3">
                                    {selectedQuestion.blanks.map((blank, blankIndex) => (
                                        <div key={blank.id} className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-indigo-700 min-w-[80px]">
                                                Blank {blankIndex + 1}:
                                            </span>
                                            <span className="text-sm font-medium text-gray-800 bg-white px-4 py-2 rounded border border-indigo-200">
                                                {blank.correctAnswer}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Solution Content */}
                    {(selectedQuestion.solution?.trim() || selectedQuestion.solutionImage) && (
                        <div>
                            <h4 className="text-sm font-bold text-[#10b981] mb-3 uppercase tracking-wide">Solution</h4>
                            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100 space-y-3">
                                {selectedQuestion.solution?.trim() && (
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                        {selectedQuestion.solution}
                                    </p>
                                )}
                                {selectedQuestion.solutionImage && typeof selectedQuestion.solutionImage === "string" && (
                                    <img
                                        src={selectedQuestion.solutionImage}
                                        alt="Solution"
                                        className="max-h-80 w-full rounded-lg border border-gray-200 object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
