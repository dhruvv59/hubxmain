"use client";

import React from "react";
import Image from "next/image";
import { Star, Clock, User, Calendar, Tag, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivatePaper } from "@/types/private-paper";

interface PrivatePaperCardProps {
    paper: PrivatePaper;
}

export function PrivatePaperCard({ paper }: PrivatePaperCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{paper.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border",
                            paper.difficulty === "Beginner" ? "bg-green-50 text-green-700 border-green-200" :
                                paper.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                    "bg-red-50 text-red-700 border-red-200"
                        )}>
                            {paper.difficulty}
                        </span>
                        {paper.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 bg-gray-50">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">
                        {paper.std}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5 ">
                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span className="font-bold text-gray-700">{paper.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-700">{paper.questionsCount}</span> Questions
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.duration} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.attempts} Attempts</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-700">{paper.plays}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <Image
                            src={paper.teacher.avatar}
                            alt={paper.teacher.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{paper.teacher.name}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = `/teacher/papers/${paper.id}/questions`}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                        Questions
                    </button>
                    <button
                        onClick={() => window.location.href = `/teacher/paper-assessments/${paper.id}`}
                        className="px-6 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
}
