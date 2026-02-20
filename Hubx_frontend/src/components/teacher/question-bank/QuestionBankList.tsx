"use client";

import { useState, useEffect } from "react";
import { Question } from "@/types/generate-paper";
import { cn } from "@/lib/utils";
import { MoreVertical, Trash2, Eye, EyeOff, Loader2, ChevronDown, ChevronUp, Pencil, Check } from "lucide-react";
import { deleteBankQuestion } from "@/services/question-bank-service";

interface QuestionBankListProps {
    questions: Question[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onAddQuestions: () => void;
    isAdding?: boolean;
    showAddBar?: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

function QuestionCard({
    q,
    index,
    isSelected,
    onToggleSelect,
    showAddBar,
    onDeleted,
    onEdit,
}: {
    q: Question;
    index: number;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    showAddBar: boolean;
    onDeleted: (id: string) => void;
    onEdit?: (id: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteBankQuestion(q.id);
            setIsDeleteOpen(false);
            onDeleted(q.id);
        } catch (err: any) {
            // If 404 "not found", still remove from UI (may have been deleted elsewhere)
            if (err?.statusCode === 404 || err?.message?.includes("not found")) {
                setIsDeleteOpen(false);
                onDeleted(q.id);
            } else {
                alert(err?.message || "Failed to delete question. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div
                className={cn(
                    "bg-white rounded-xl border transition-all",
                    isSelected && showAddBar ? "border-[#5b5bd6] shadow-sm bg-[#fdfcff]" : "border-gray-200 hover:border-indigo-200"
                )}
            >
                {/* Card Top — clickable for select (only in addBar mode) */}
                <div
                    className={cn("p-5", showAddBar && "cursor-pointer")}
                    onClick={() => showAddBar && onToggleSelect(q.id)}
                >
                    {/* Row: Checkbox (when addBar) + Tags + Actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {showAddBar && (
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                        isSelected ? "bg-[#5b5bd6] border-[#5b5bd6]" : "border-gray-300 bg-white"
                                    )}
                                    onClick={(e) => { e.stopPropagation(); onToggleSelect(q.id); }}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                            )}
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold border",
                                q.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                                    q.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                        "bg-red-50 text-red-700 border-red-200"
                            )}>
                                {q.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 bg-gray-50 capitalize">
                                {q.type}
                            </span>
                            {(q as any).marks && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 text-blue-600 bg-blue-50">
                                    {(q as any).marks} marks
                                </span>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* View toggle */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title={isExpanded ? "Hide details" : "View details"}
                            >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* 3-dot menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {isMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                        <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-36 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                                            <button
                                                onClick={() => { setIsExpanded(!isExpanded); setIsMenuOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                            >
                                                {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {isExpanded ? "Hide" : "View"}
                                            </button>
                                            {onEdit && (
                                                <button
                                                    onClick={() => { onEdit(q.id); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setIsDeleteOpen(true); setIsMenuOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-sm font-bold text-gray-900">
                        Q{index + 1} — <span className="font-semibold text-gray-800">{q.content}</span>
                    </h4>
                    {/* Question Image - visible in main card */}
                    {q.questionImage && (
                        <div className="mt-3">
                            <img
                                src={q.questionImage}
                                alt="Question"
                                className="max-h-32 rounded-lg border border-gray-200 object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Expanded: Options + Solution */}
                {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                        {/* MCQ Options */}
                        {q.type === "MCQ" && q.options && q.options.length > 0 && (
                            <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Options</h5>
                                <div className="space-y-2">
                                    {q.options.map((opt: any, i: number) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm border",
                                                opt.isCorrect
                                                    ? "bg-green-50 border-green-200 text-green-800 font-bold"
                                                    : "bg-gray-50 border-gray-100 text-gray-700"
                                            )}
                                        >
                                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ borderColor: opt.isCorrect ? '#16a34a' : '#d1d5db', color: opt.isCorrect ? '#16a34a' : '#6b7280' }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {opt.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Solution */}
                        {(q.solution || q.solutionImage) && (
                            <div>
                                <h5 className="text-xs font-bold text-[#10b981] uppercase tracking-wide mb-2">Solution</h5>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-3">
                                    {q.solution && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{q.solution}</p>
                                    )}
                                    {q.solutionImage && (
                                        <img
                                            src={q.solutionImage}
                                            alt="Solution"
                                            className="max-h-48 rounded-lg border border-gray-200 object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => !isDeleting && setIsDeleteOpen(false)} />
                    <div className="relative bg-white rounded-2xl p-6 shadow-xl w-[90vw] max-w-md z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Question?</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this question? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function QuestionBankList({ questions, selectedIds, onToggleSelect, onAddQuestions, isAdding, showAddBar = false, onDelete, onEdit }: QuestionBankListProps) {
    const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

    // Sync when parent questions change (e.g. filter change, refetch, or delete)
    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const handleDeleted = (id: string) => {
        setLocalQuestions(prev => prev.filter(q => q.id !== id));
        if (onDelete) onDelete(id);
    };

    return (
        <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                    Questions {localQuestions.length > 0 && <span className="text-gray-400 font-medium text-base">({localQuestions.length})</span>}
                </h2>
                {showAddBar && (
                    <div className="flex items-center gap-4">
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
                )}
            </div>

            {/* List */}
            {localQuestions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-400 font-medium text-sm">No questions found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {localQuestions.map((q, index) => (
                        <QuestionCard
                            key={q.id}
                            q={q}
                            index={index}
                            isSelected={selectedIds.includes(q.id)}
                            onToggleSelect={onToggleSelect}
                            showAddBar={showAddBar}
                            onDeleted={handleDeleted}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
