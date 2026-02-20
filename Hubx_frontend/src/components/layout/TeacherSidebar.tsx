"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Gauge,          // Dashboard
    ClipboardCheck, // Assessment
    Files,          // Papers
    FileQuestion,   // Help/Question
    Sparkles,       // AI
    Compass,        // Excursion
    Rocket,
    X
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: Gauge },
    { name: "Private Papers", href: "/teacher/paper", icon: ClipboardCheck },
    { name: "Papers", href: "/teacher/published-papers", icon: Files },
    { name: "Question Bank", href: "/teacher/question-bank", icon: FileQuestion },
    { name: "AI Features", href: "/teacher/x-factor", icon: Sparkles },
    { name: "Excursion", href: "/teacher/excursion", icon: Compass },
];

interface TeacherSidebarProps {
    className?: string;
    onClose?: () => void;
    isMobile?: boolean;
}

export function TeacherSidebar({ className, onClose, isMobile }: TeacherSidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "h-full bg-white border-r border-[#f3f4f6] flex flex-col z-50 transition-all duration-300",
            isMobile ? "w-[280px] items-start p-6" : "hidden md:flex w-[100px] items-center py-8 fixed left-0 top-0 bottom-0 shadow-[0_0_15px_rgba(0,0,0,0.02)] scrollbar-hide",
            className
        )}>
            {/* Header / Logo */}
            <div className={cn("mb-10 w-full flex justify-between items-center", isMobile ? "px-2" : "justify-center")}>
                <Image
                    src="/assets/images/logo-icon.png"
                    alt="Hubx"
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                />
                {isMobile && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className={cn("flex-1 w-full space-y-4 md:space-y-6 flex flex-col", isMobile ? "items-start" : "items-center")}>
                {navigation.map((item) => {
                    // Check if active (Excursion is active for all sub-routes too)
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "relative group flex items-center cursor-pointer transition-all",
                                isMobile
                                    ? "w-full gap-3 p-3 rounded-xl hover:bg-gray-50"
                                    : "justify-center w-full h-12"
                            )}
                            suppressHydrationWarning={true}
                        >
                            {/* Active Indicator (Right Border) - Desktop Only */}
                            {!isMobile && isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-[#6366f1] rounded-l-md" />
                            )}

                            {/* Icon Container */}
                            <div className={cn(
                                "flex items-center justify-center rounded-full transition-all duration-300",
                                isMobile
                                    ? "w-6 h-6 text-gray-500"
                                    : "w-10 h-10",
                                !isMobile && isActive && "bg-gradient-to-tr from-[#6366f1] to-[#818cf8] text-white shadow-md shadow-indigo-200",
                                !isMobile && !isActive && "text-gray-400 group-hover:text-[#6366f1] group-hover:bg-gray-50",
                                isMobile && isActive && "text-[#6366f1]"
                            )}>
                                <item.icon
                                    className={cn("w-5 h-5", isActive ? "stroke-[2]" : "stroke-[2]")}
                                />
                            </div>

                            {/* Text - Mobile Only */}
                            {isMobile && (
                                <span className={cn(
                                    "text-sm font-semibold transition-colors",
                                    isActive ? "text-[#6366f1]" : "text-gray-500 group-hover:text-gray-900"
                                )}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Action - Pro Features */}
            <div className={cn("mt-auto flex items-center gap-3", isMobile ? "w-full px-2 mb-4" : "justify-center w-full mb-4 flex-col")}>
                {/* Rocket Button - Pro Features */}
                <button
                    className={cn(
                        "relative flex items-center justify-center rounded-full transition-all",
                        isMobile
                            ? "flex-1 h-10"
                            : "w-10 h-10 group"
                    )}
                    suppressHydrationWarning={true}
                >
                    {isMobile ? (
                        <>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-sm">
                                <Rocket className="w-4 h-4 text-white fill-white" />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Orange Border Ring */}
                            <div className="absolute inset-0 rounded-full border-[3px] border-[#fb923c] opacity-100" />

                            {/* Inner Gradient Circle */}
                            <div className="absolute inset-[3px] rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                                <Rocket className="w-5 h-5 text-white fill-white" />
                            </div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

