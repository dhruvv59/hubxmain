"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { DashboardStat } from "@/types/teacher";

interface StatCardProps {
    stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
    const { title, value, subValue, lastMonthValue, theme, trend } = stat;

    // Theme configurations - Pixel-perfect design
    const themes = {
        green: {
            border: "border-l-4 border-l-[#0ea5e9]", // cyan-500
            bg: "bg-gradient-to-br from-[#f0fafb] to-white",
            text: "text-[#0ea5e9]",
            divider: "bg-gradient-to-r from-[#0ea5e9] to-transparent",
            arrowUp: "text-[#10b981]",
            arrowDown: "text-[#ef4444]"
        },
        orange: {
            border: "border-l-4 border-l-[#f97316]", // orange-500
            bg: "bg-gradient-to-br from-[#fffbf0] to-white",
            text: "text-[#f97316]",
            divider: "bg-gradient-to-r from-[#f97316] to-transparent",
            arrowUp: "text-[#10b981]",
            arrowDown: "text-[#ef4444]"
        },
        purple: {
            border: "border-l-4 border-l-[#a855f7]", // purple-500
            bg: "bg-gradient-to-br from-[#faf5ff] to-white",
            text: "text-[#a855f7]",
            divider: "bg-gradient-to-r from-[#a855f7] to-transparent",
            arrowUp: "text-[#10b981]",
            arrowDown: "text-[#ef4444]"
        },
        yellow: {
            border: "border-l-4 border-l-[#eab308]", // yellow-500
            bg: "bg-gradient-to-br from-[#fffef0] to-white",
            text: "text-[#eab308]",
            divider: "bg-gradient-to-r from-[#eab308] to-transparent",
            arrowUp: "text-[#10b981]",
            arrowDown: "text-[#ef4444]"
        }
    };

    const currentTheme = themes[theme];
    const arrowColor = trend === 'up' ? currentTheme.arrowUp : currentTheme.arrowDown;

    return (
        <div className={cn(
            "h-full flex flex-col justify-between",
            "p-5 rounded-2xl border border-gray-100 border-r-0 border-t-0 border-b-0",
            "shadow-sm hover:shadow-md transition-shadow duration-200",
            "bg-white",
            currentTheme.border
        )}>
            <div className="flex flex-col">
                <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3 leading-none">{title}</h3>
                <div className={cn("text-3xl sm:text-4xl xl:text-[2.75rem] font-black leading-tight mb-2 tracking-tight", currentTheme.text)}>
                    {value}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className={cn(
                            "w-0 h-0",
                            trend === 'up'
                                ? "border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px]"
                                : "border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px]",
                            arrowColor
                        )}></div>
                        <span className="text-sm font-bold text-gray-700">{subValue}</span>
                    </div>
                </div>
            </div>

            {lastMonthValue && (
                <div className="relative pt-4 mt-3">
                    {/* Colored Divider Line */}
                    <div className={cn("absolute top-0 left-0 right-0 h-[1px]", currentTheme.divider)}></div>

                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 tracking-wider">LAST MONTH</p>
                    <p className="text-lg font-black text-gray-800 tracking-tight">{lastMonthValue}</p>
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
