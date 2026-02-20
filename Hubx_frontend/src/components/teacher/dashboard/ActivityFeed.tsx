"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'EXAM_ATTEMPT':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Clock className="w-5 h-5 text-blue-500" />;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-4">Recent Activities</h3>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="py-8 text-center">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No recent activities</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 hover:bg-gray-50 p-3 rounded-lg transition-colors group cursor-pointer"
                        >
                            <div className="flex-shrink-0 pt-1">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 leading-snug">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function ActivityFeedSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 pb-4 border-b border-gray-100">
                        <div className="h-5 w-5 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-2 w-1/3 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
