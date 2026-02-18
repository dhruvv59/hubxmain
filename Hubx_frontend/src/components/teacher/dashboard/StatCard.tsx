"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { DashboardStat } from "@/types/teacher";

interface StatCardProps {
    stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
    const { title, value, subValue, lastMonthValue, theme } = stat;

    // Theme configurations
    const themes = {
        green: {
            border: "border-[#4ade80]", // green-400
            text: "text-[#22c55e]",     // green-500
            divider: "bg-gradient-to-r from-[#4ade80] to-transparent",
            arrow: "text-[#22c55e]"
        },
        orange: {
            border: "border-[#fb923c]", // orange-400
            text: "text-[#f97316]",     // orange-500
            divider: "bg-gradient-to-r from-[#fb923c] to-transparent",
            arrow: "text-[#22c55e]" // Arrow is usually green for 'up' regardless of card theme
        },
        purple: {
            border: "border-[#d8b4fe]", // purple-300
            text: "text-[#c084fc]",     // purple-400
            divider: "bg-gradient-to-r from-[#d8b4fe] to-transparent",
            arrow: "text-[#22c55e]"
        },
        yellow: {
            border: "border-[#facc15]", // yellow-400
            text: "text-[#fbbf24]",     // amber-400
            divider: "bg-gradient-to-r from-[#facc15] to-transparent",
            arrow: "text-[#22c55e]"
        }
    };

    const currentTheme = themes[theme];

    return (
        <div className={cn("bg-white p-4 xl:p-6 rounded-2xl border-[1.5px] shadow-sm h-full flex flex-col justify-between hover:shadow-md transition-shadow", currentTheme.border)}>
            <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 truncate">{title}</h3>
                <div className={cn("text-2xl sm:text-3xl xl:text-[2.6rem] leading-tight font-black mb-1 truncate", currentTheme.text)}>{value}</div>

                <div className="flex items-center gap-1 text-sm font-bold text-gray-700 mb-6">
                    <span className={cn("flex items-center", currentTheme.arrow)}>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#22c55e] mr-1.5 "></div>
                        {subValue}
                    </span>
                </div>
            </div>

            {lastMonthValue && (
                <div className="relative pt-4">
                    {/* Colored Divider Line */}
                    <div className={cn("absolute top-0 left-0 w-full h-[1.5px]", currentTheme.divider)}></div>

                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">LAST MONTH</p>
                    <p className="text-lg sm:text-xl font-black text-gray-800 italic">{lastMonthValue}</p>
                </div>
            )}
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl border-[1.5px] border-gray-100 shadow-sm h-[200px] animate-pulse">
            <div className="h-3 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-32 bg-gray-200 rounded mb-8"></div>
            <div className="border-t border-gray-100 pt-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}
