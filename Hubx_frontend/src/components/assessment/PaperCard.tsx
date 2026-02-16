"use client";

import React from "react";
import Image from "next/image";
import { Star, HelpCircle, Clock, Users, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicPaper } from "@/types/assessment";

interface PaperCardProps {
    data: PublicPaper;
    onPurchase?: () => void;
    onPreview?: () => void;
    onTeacherClick?: () => void;
    onStartTest?: () => void;
}

export function PaperCard({ data, onPurchase, onPreview, onTeacherClick, onStartTest }: PaperCardProps) {
    const levelColors = {
        Advanced: "bg-red-50 text-red-600 border-red-100",
        Intermediate: "bg-orange-50 text-orange-600 border-orange-100",
        Beginner: "bg-green-50 text-green-600 border-green-100"
    };

    return (
        <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            {/* Header Row */}
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 sm:line-clamp-1 leading-snug" title={data.title}>
                        {data.title}
                    </h3>

                    {/* Tags Row - Now underneath title */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("px-2.5 sm:px-3 py-0.5 rounded-full text-xs font-medium border", levelColors[data.level || "Beginner"])}>
                            {data.level}
                        </span>
                        {data.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2.5 sm:px-3 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {tag}
                            </span>
                        ))}
                        {data.tags.length > 2 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                                +{data.tags.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Price & Featured Column */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    {data.badges.includes("FEATURED") && (
                        <span className="px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-[10px] font-bold uppercase tracking-wide border border-fuchsia-200 order-last sm:order-first">
                            Featured
                        </span>
                    )}
                    <span className={cn(
                        "px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base font-bold border shadow-sm min-w-[60px] text-center",
                        data.price === 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-[#fffbeb] text-gray-900 border-[#fcd34d]"
                    )}>
                        ₹ {data.price}
                    </span>
                </div>
            </div>

            {/* Info Metrics Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-6 text-[12px] sm:text-[13px] text-gray-500 mb-4 sm:mb-6">
                <div className="flex items-center space-x-1.5 text-orange-500 font-bold">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                    <span>{data.rating}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                    <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{data.questionCount} Qs</span>
                </div>

                <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{data.durationMinutes} min</span>
                </div>

                <div className="flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{data.attempts} Attempts</span>
                    <span className="sm:hidden">{data.attempts}</span>
                </div>

                <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-1">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{data.date}</span>
                </div>

                <div className="flex items-center space-x-1.5 hidden sm:flex">
                    <Tag className="h-4 w-4" />
                    <span>159</span>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full mb-4" />

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                <div
                    className="flex items-center space-x-3 cursor-pointer group order-2 sm:order-1"
                    onClick={onTeacherClick}
                >
                    <div className="relative h-10 w-10 shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 group-hover:border-[#6366f1] transition-colors">
                            {data.teacher.avatarUrl ? (
                                <Image
                                    src={data.teacher.avatarUrl}
                                    alt={data.teacher.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {data.teacher.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-[#6366f1] transition-colors">{data.teacher.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                    {data.purchased ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview?.();
                                }}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-[#5b5bd6] font-bold text-sm hover:bg-gray-50 transition-colors z-10 relative min-h-[44px] flex items-center justify-center"
                            >
                                View Questions
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartTest?.();
                                }}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg bg-[#5b5bd6] text-white font-bold text-sm hover:bg-[#4f4fbe] transition-colors shadow-md shadow-indigo-200 z-10 relative min-h-[44px] flex items-center justify-center"
                            >
                                Start Test
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview?.();
                                }}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors z-10 relative min-h-[44px] flex items-center justify-center"
                            >
                                Preview
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPurchase?.();
                                }}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg bg-[#5b5bd6] text-white font-bold text-sm hover:bg-[#4f4fbe] transition-colors shadow-md shadow-indigo-200 z-10 relative min-h-[44px] flex items-center justify-center"
                            >
                                Purchase
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
