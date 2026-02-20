"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, User, Calendar, Tag, MoreVertical, TrendingUp, HelpCircle, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

export interface Paper {
    id: string;
    title: string;
    badges: string[];
    standard: string;
    price: number;
    rating: number;
    questions: number;
    duration: string;
    attempts: number;
    date: string;
    idTag: string | number;
    teacher: {
        name: string;
        avatar: string;
    };
    isTrending?: boolean;
    isOwnPaper?: boolean;
}

interface TeacherPaperCardProps {
    paper: Paper;
    onUpdate?: () => void;
}

export function TeacherPaperCard({ paper, onUpdate }: TeacherPaperCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await http.delete(TEACHER_ENDPOINTS.deletePaper(paper.id));
            setIsDeleteOpen(false);
            if (onUpdate) onUpdate();
            else window.location.reload();
        } catch (error) {
            console.error("Failed to delete paper", error);
            alert("Failed to delete paper. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">

                {/* Header: Title + badges row + 3dot */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight flex-1 min-w-0 pr-1">{paper.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {paper.isTrending && (
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                        )}
                        <span className="px-2 py-1 rounded bg-[#f3f4f6] text-[10px] font-bold text-gray-600 border border-gray-200 whitespace-nowrap">
                            Std {paper.standard}
                        </span>
                        <span className="px-2 py-1 rounded bg-[#fef9c3] text-xs font-bold text-gray-800 border border-[#fde047] whitespace-nowrap">
                            ₹ {paper.price}
                        </span>

                        {/* 3-dot menu — only for own papers */}
                        {paper.isOwnPaper ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute top-7 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-32 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => { setIsDeleteOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-6" />
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {paper.badges.map((badge, i) => (
                        <span
                            key={badge}
                            className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                i === 0
                                    ? "bg-red-50 text-red-500 border-red-100"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                            )}
                        >
                            {badge}
                        </span>
                    ))}
                </div>

                {/* Metadata — 2 col grid on mobile, single row on desktop */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1.5 sm:gap-x-6 sm:gap-y-2 text-xs font-semibold text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5 text-orange-500">
                        <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span className="text-gray-700">{Number(paper.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{paper.questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{paper.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>{paper.attempts} Attempts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{paper.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span>{paper.idTag}</span>
                    </div>
                </div>

                {/* Footer: Teacher & Preview */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                            {paper.teacher.avatar && typeof paper.teacher.avatar === 'string' && paper.teacher.avatar.trim() ? (
                                <Image
                                    src={paper.teacher.avatar}
                                    alt={paper.teacher.name}
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-4 w-4 text-white" />
                            )}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">{paper.teacher.name}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (paper.id) {
                                window.location.href = `/teacher/papers/${paper.id}/questions`;
                            }
                        }}
                        className="px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap"
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => !isLoading && setIsDeleteOpen(false)} />
                    <div className="relative bg-white rounded-2xl p-6 shadow-xl w-[90vw] max-w-md z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Paper?</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-gray-900">"{paper.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
