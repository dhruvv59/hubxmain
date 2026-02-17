"use client";

import React from "react";
import Image from "next/image";
import { Star, Clock, User, Calendar, Tag, MoreVertical, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    idTag: number;
    teacher: {
        name: string;
        avatar: string;
    };
    isTrending?: boolean;
}

export function TeacherPaperCard({ paper }: { paper: Paper }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            {/* Header: Title, Price, Menu */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{paper.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {/* Trending Icon */}
                            {paper.isTrending && (
                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            )}
                            <span className="px-2 py-1 rounded bg-[#f3f4f6] text-xs font-bold text-gray-600 border border-gray-200 whitespace-nowrap">
                                Std {paper.standard}
                            </span>
                            <span className="px-3 py-1 rounded bg-[#fef9c3] text-sm font-bold text-gray-800 border border-[#fde047] whitespace-nowrap">
                                ₹ {paper.price}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {paper.badges.map((badge, i) => (
                            <span
                                key={badge}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                                    i === 0
                                        ? "bg-red-50 text-red-500 border-red-100"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                )}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 mb-6">
                <div className="flex items-center gap-1.5 text-orange-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-gray-700">{Number(paper.rating).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{paper.questions} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{paper.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{paper.attempts} Attempts</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{paper.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{paper.idTag}</span>
                </div>
            </div>

            {/* Footer: Teacher & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        {paper.teacher.avatar && typeof paper.teacher.avatar === 'string' && paper.teacher.avatar.trim() ? (
                            <Image
                                src={paper.teacher.avatar}
                                alt={paper.teacher.name}
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-5 w-5 text-white" />
                        )}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{paper.teacher.name}</span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (paper.id) {
                                window.location.href = `/teacher/papers/${paper.id}/questions`;
                            }
                        }}
                        className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                        Preview
                    </button>
                    {/* Add to Cart / Buy button could go here */}
                </div>
            </div>
        </div>
    );
}
