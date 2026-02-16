"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Gauge,
    ClipboardCheck,
    Files,
    Wand2,
    Compass,
    X,
    MessageSquare,
    BarChart2
} from "lucide-react";

// Navigation item type
type NavigationItem = {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    badge?: number;
};

// Matches the visual icons from the image
const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Gauge }, // Speedometer/Gauge
    { name: "Practice Papers", href: "/practice-papers", icon: ClipboardCheck }, // Clipboard with check (Visual Slot 2)
    { name: "Public Paper", href: "/papers", icon: Files }, // Stacked files
    { name: "Chat", href: "/chat", icon: MessageSquare }, // Chat Icon
    { name: "Performance Analytics", href: "/analytics", icon: BarChart2 }, // Analytics Icon
    { name: "Smart AI Assessment", href: "/assessments", icon: Wand2 }, // Magic Wand (Visual Slot 4 - User Confirmed Assessment)
    { name: "Excursion", href: "/excursion", icon: Compass }, // Compass
];

interface SidebarProps {
    className?: string;
    onClose?: () => void;
    isMobile?: boolean;
}

export function Sidebar({ className, onClose, isMobile }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "h-full bg-[#E8EAEA] border-r border-[#f3f4f6] flex flex-col z-50 transition-all duration-300",
            isMobile ? "w-[280px] items-start p-6" : "hidden md:flex w-[100px] items-center py-8 fixed left-0 top-0 bottom-0",
            className
        )}>
            {/* Logo */}
            <div className={cn("mb-10 w-full flex justify-between items-center", isMobile ? "px-2" : "justify-center")}>
                <Image
                    src="/assets/images/logo-icon.png"
                    alt="Lernen Hub"
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                    priority
                />
                {isMobile && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className={cn("flex-1 w-full space-y-4 md:space-y-8 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent", isMobile ? "items-start" : "items-center")}>
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "relative group flex items-center transition-all cursor-pointer",
                                isMobile
                                    ? "w-full gap-3 p-3 rounded-xl hover:bg-gray-50"
                                    : "justify-center h-10 w-full"
                            )}
                        >
                            {/* Active Indicator (Right Border/Pill) - Desktop */}
                            {!isMobile && isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[4px] bg-[#6366f1] rounded-l-md" />
                            )}

                            {/* Icon Container */}
                            <div className="relative flex items-center gap-3">
                                <item.icon
                                    className={cn(
                                        "transition-colors",
                                        isActive || (isMobile && isActive) ? "text-[#6366f1] fill-current/10" : "text-[#9ca3af] group-hover:text-[#6366f1]",
                                        isMobile ? "h-6 w-6" : "h-7 w-7"
                                    )}
                                    {...({ strokeWidth: isActive ? 2.5 : 2 })}
                                />
                                {/* Text - Mobile Only */}
                                {isMobile && (
                                    <span className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isActive ? "text-[#6366f1]" : "text-gray-500 group-hover:text-gray-900"
                                    )}>
                                        {item.name}
                                    </span>
                                )}

                                {/* Notification Badge */}
                                {item.badge && (
                                    <div className={cn(
                                        "absolute bg-[#ff5757] rounded-full flex items-center justify-center border-[2px] border-white shadow-sm",
                                        isMobile ? "relative top-0 right-0 h-5 w-5 ml-auto translate-x-0" : "-top-1.5 -right-1.5 h-4 w-4"
                                    )}>
                                        <span className={cn("font-bold text-white leading-none", isMobile ? "text-[10px]" : "text-[9px]")}>
                                            {item.badge}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

