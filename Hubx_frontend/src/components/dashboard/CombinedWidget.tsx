"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ChevronRight, Bell, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, FocusArea } from "@/types/dashboard";

interface CombinedWidgetProps {
    notifications: Notification[];
    focusAreas: FocusArea[];
}

export function CombinedWidget({ notifications, focusAreas }: CombinedWidgetProps) {
    const [activeTab, setActiveTab] = useState<"notifications" | "focus">("notifications");

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[420px]">
            {/* Custom Tab Header */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={cn(
                        "flex-1 py-4 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors relative",
                        activeTab === "notifications" ? "text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {activeTab === "notifications" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600" />
                    )}
                </button>
                <div className="w-[1px] bg-gray-100" />
                <button
                    onClick={() => setActiveTab("focus")}
                    className={cn(
                        "flex-1 py-4 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors relative",
                        activeTab === "focus" ? "text-red-600 bg-red-50/50" : "text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <Target className="h-4 w-4" />
                    AI Focus Areas
                    {activeTab === "focus" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {activeTab === "notifications" ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-8">No new notifications</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative border border-white shadow-sm flex items-center justify-center">
                                        {notif.avatar ? (
                                            <Image src={notif.avatar} alt={notif.author} fill className="object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-500">{notif.author.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[11px] leading-relaxed text-gray-800">
                                            <span className="font-bold">{notif.author}</span> {notif.text}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        {focusAreas.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-8">Great job! No weak areas detected.</p>
                        ) : (
                            focusAreas.map((area) => (
                                <div key={area.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[10px] uppercase font-bold text-gray-400">{area.subject}</p>
                                        <span className={cn("text-[10px] font-bold", area.scoreColorClass)}>Score {area.score}</span>
                                    </div>
                                    <p className="text-[12px] font-bold text-gray-900 leading-tight">
                                        {area.topic}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Link href="/dashboard">
                    <button className="w-full py-2.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center">
                        View All {activeTab === "notifications" ? "Notifications" : "Focus Areas"} <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                </Link>
            </div>

        </div>
    );
}
