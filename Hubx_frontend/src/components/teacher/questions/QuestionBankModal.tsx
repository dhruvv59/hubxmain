"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Filter, Loader2, Plus, Check } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";

interface QuestionBankModalProps {
    paperId: string;
    onQuestionAdded: () => void;
    onClose: () => void;
}

interface BankQuestion {
    id: string;
    questionText: string;
    type: string;
    difficulty: "EASY" | "INTERMEDIATE" | "ADVANCED";
    marks: number;
    subject?: { name: string };
    tags?: string[];
}

export function QuestionBankModal({ paperId, onQuestionAdded, onClose }: QuestionBankModalProps) {
    const [questions, setQuestions] = useState<BankQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [addingIds, setAddingIds] = useState<string[]>([]);

    useEffect(() => {
        fetchQuestions();
    }, [search]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hubx_access_token");
            const queryParams = new URLSearchParams();
            if (search) queryParams.append("search", search);

            const response = await fetch(`${API_BASE_URL}/teacher/question-bank?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions(data.data.questions || []);
            }
        } catch (error) {
            console.error("Error fetching question bank:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const handleAddSelected = async () => {
        if (selectedQuestions.length === 0) return;

        setAddingIds(selectedQuestions);
        const token = localStorage.getItem("hubx_access_token");

        try {
            // Add questions sequentially or parallel
            const promises = selectedQuestions.map(questionId =>
                fetch(`${API_BASE_URL}/teacher/question-bank/${questionId}/add-to-paper`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ paperId }),
                })
            );

            await Promise.all(promises);

            onQuestionAdded(); // Refresh parent
            onClose(); // Close modal
        } catch (error) {
            console.error("Error adding questions:", error);
            alert("Failed to add some questions");
            setAddingIds([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-2xl sm:max-w-4xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Add from Question Bank</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            No questions found matching your search.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((q) => {
                                const isSelected = selectedQuestions.includes(q.id);
                                const isAdding = addingIds.includes(q.id);

                                return (
                                    <div
                                        key={q.id}
                                        onClick={() => handleToggleSelect(q.id)}
                                        className={cn(
                                            "group border rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md",
                                            isSelected ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-blue-300"
                                        )}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className={cn(
                                                "w-5 h-5 mt-0.5 sm:mt-1 rounded border flex items-center justify-center transition-colors shrink-0",
                                                isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                                            )}>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                                    <span className={cn(
                                                        "text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border uppercase whitespace-nowrap",
                                                        q.difficulty === "EASY" ? "bg-green-50 text-green-700 border-green-200" :
                                                            q.difficulty === "INTERMEDIATE" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                                "bg-red-50 text-red-700 border-red-200"
                                                    )}>
                                                        {q.difficulty === "INTERMEDIATE" ? "MED" : q.difficulty}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 uppercase whitespace-nowrap">
                                                        {q.type === "FILL_IN_THE_BLANKS" ? "BLANKS" : q.type.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                                        {q.marks} Marks
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-800 font-medium line-clamp-2">{q.questionText}</p>
                                                {q.tags && q.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {q.tags.map(tag => (
                                                            <span key={tag} className="text-[9px] sm:text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">
                        {selectedQuestions.length} selected
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 sm:px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddSelected}
                            disabled={selectedQuestions.length === 0 || addingIds.length > 0}
                            className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#5b5bd6] text-white text-xs sm:text-sm font-bold hover:bg-[#4f46e5] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                        >
                            {addingIds.length > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span className="hidden sm:inline">Add Selected</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
