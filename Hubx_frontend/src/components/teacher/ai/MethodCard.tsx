"use client";

import React from "react";
import { Plus, Upload, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MethodCardProps {
    type: "manual" | "bulk" | "ai";
    onClick?: () => void;
}

export function MethodCard({ type, onClick }: MethodCardProps) {
    const config = {
        manual: {
            title: "ADD QUESTION MANUALLY",
            description: "Add question one by one",
            icon: Plus,
            color: "text-[#f97316]", // Orange
            borderColor: "border-[#fed7aa] hover:border-[#f97316]",
            bgHover: "hover:bg-[#fff7ed]",
            iconBg: "bg-white border-[#fed7aa] text-[#f97316]"
        },
        bulk: {
            title: "BULK UPLOAD",
            description: "Bulk Upload with Excel",
            icon: Upload,
            color: "text-[#10b981]", // Emerald
            borderColor: "border-[#a7f3d0] hover:border-[#10b981]",
            bgHover: "hover:bg-[#ecfdf5]",
            iconBg: "bg-white border-[#a7f3d0] text-[#10b981]"
        },
        ai: {
            title: "AI SMART GENERATOR",
            description: "Take help of AI to generate paper",
            icon: Sparkles,
            color: "text-[#d946ef]", // Fuchsia/Purple
            borderColor: "border-[#e9d5ff] hover:border-[#bd5eee]",
            bgHover: "hover:bg-[#fdf4ff]",
            iconBg: "bg-white border-[#e9d5ff] text-[#d946ef]"
        }
    };

    const { title, description, icon: Icon, color, borderColor, bgHover, iconBg } = config[type];

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative w-full aspect-[4/3] rounded-[24px] border-[1.5px] bg-white p-8 flex flex-col items-center justify-center transition-all duration-300",
                borderColor,
                bgHover,
                "shadow-sm hover:shadow-md"
            )}
        >
            <div className={cn(
                "h-16 w-16 rounded-full border-[1.5px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                iconBg
            )}>
                <Icon className="w-8 h-8 stroke-[1.5px]" />
            </div>

            <h3 className={cn("text-[13px] font-black italic tracking-wide mb-2 uppercase", color)}>
                {title}
            </h3>

            <p className="text-sm font-medium text-gray-500 text-center">
                {description}
            </p>
        </button>
    );
}
