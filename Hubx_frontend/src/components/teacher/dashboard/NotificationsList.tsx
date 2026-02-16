"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NotificationItem } from "@/types/teacher";

export function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
    return (
        <div className="bg-[#f8f9ff] p-4 sm:p-6 rounded-2xl border border-indigo-50/50 flex flex-col h-full">
            <h3 className="font-bold text-gray-800 mb-4 sm:mb-6 text-base sm:text-lg">Notifications from Students</h3>

            <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {notifications.map((notif, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 group cursor-pointer hover:bg-white/50 -mx-2 px-2 py-2 rounded-lg transition-all">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-white shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                            <Image
                                src={notif.avatar}
                                alt={notif.user}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="text-xs sm:text-sm leading-snug pt-1">
                            <p className="text-gray-900">
                                <span className="font-bold">{notif.user} </span>
                                <span className="text-gray-500">{notif.action} </span>
                                <span className="font-bold text-gray-800">{notif.target}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/teacher/notifications"
                className="w-full mt-4 sm:mt-6 py-3 sm:py-3.5 border border-gray-300 rounded-xl bg-white text-xs sm:text-sm font-extrabold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm text-center block"
            >
                View All
            </Link>
        </div>
    );
}

export function NotificationsListSkeleton() {
    return (
        <div className="bg-[#f8f9ff] p-6 rounded-2xl border border-indigo-50/50 h-[350px] animate-pulse">
            <div className="h-5 w-48 bg-indigo-100/50 rounded mb-8"></div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100/50"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-2 bg-indigo-100/50 rounded w-3/4"></div>
                            <div className="h-2 bg-indigo-100/50 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
