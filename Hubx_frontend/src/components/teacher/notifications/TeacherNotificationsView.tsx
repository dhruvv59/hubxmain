"use client";

/**
 * TeacherNotificationsView Component
 * 
 * Full-page view for teachers to manage all notifications.
 * Features: filtering, bulk actions, mark as read, delete, etc.
 */

import React, { useState } from 'react';
import { Bell, Check, Filter, Loader2, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/notification';
import { NOTIFICATION_FILTER_TYPES, getNotificationFilterLabel } from '@/lib/filter-constants';

// Import the notification item component from the dropdown
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';

export function TeacherNotificationsView() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading,
        error,
        hasMore,
        loadMore,
        refresh,
        isRefreshing
    } = useNotifications({
        refreshInterval: 60000,
        enableRealtime: false,
    });

    // Filter notifications based on selected filter
    const filteredNotifications = selectedFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === selectedFilter);

    const handleGoBack = () => {
        router.push('/teacher/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Bell className="h-7 w-7 text-indigo-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={refresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={cn(
                                    "h-4 w-4",
                                    isRefreshing && "animate-spin"
                                )} />
                                <span className="font-medium hidden sm:inline">Refresh</span>
                            </button>

                            {/* Mark All as Read */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                                >
                                    <Check className="h-4 w-4" />
                                    <span className="font-medium hidden sm:inline">Mark all read</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Tabs - Responsive */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
                    {/* Mobile: Dropdown Style */}
                    <div className="sm:hidden relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Filter className="h-4 w-4 text-gray-400" />
                                {getNotificationFilterLabel(selectedFilter)}
                            </span>
                            <svg className={cn("h-4 w-4 text-gray-400 transition-transform", isFilterOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isFilterOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {NOTIFICATION_FILTER_TYPES.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => {
                                            setSelectedFilter(filter);
                                            setIsFilterOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b last:border-b-0",
                                            selectedFilter === filter
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        {getNotificationFilterLabel(filter)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop: Expanded Tabs */}
                    <div className="hidden sm:flex items-center gap-3 flex-wrap">
                        <Filter className="h-5 w-5 text-gray-400 shrink-0" />
                        <span className="text-sm font-semibold text-gray-700">Filter:</span>
                        <div className="flex gap-2 flex-wrap">
                            {NOTIFICATION_FILTER_TYPES.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                        selectedFilter === filter
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {getNotificationFilterLabel(filter)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Failed to load notifications</p>
                            <p className="text-xs text-gray-500 text-center mb-4">{error.message}</p>
                            <button
                                onClick={refresh}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-4 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    ) : isLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
                            <p className="text-sm text-gray-500">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">No notifications</p>
                            <p className="text-xs text-gray-500 text-center">
                                {selectedFilter === 'all'
                                    ? "You're all caught up! We'll notify you when something new happens."
                                    : `No ${selectedFilter} notifications found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && !isLoading && filteredNotifications.length > 0 && (
                        <div className="flex justify-center py-6 border-t border-gray-100">
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-6 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load more notifications'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Individual Notification Item
 */
function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
}: {
    notification: any;
    onMarkAsRead: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [isActing, setIsActing] = useState(false);
    const router = useRouter();

    const handleMarkAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActing(true);
        try {
            await onMarkAsRead(notification.id);
        } finally {
            setIsActing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActing(true);
        try {
            await onDelete(notification.id);
        } finally {
            setIsActing(false);
        }
    };

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        if (notification.action?.type === 'navigate' && notification.action.url) {
            router.push(notification.action.url);
        }
    };

    const isPriorityHigh = notification.priority === 'high' || notification.priority === 'urgent';

    return (
        <div
            onClick={handleClick}
            className={cn(
                "p-6 transition-all duration-200 relative group cursor-pointer",
                "hover:bg-gray-50 active:bg-gray-100",
                !notification.isRead && "bg-indigo-50/30 hover:bg-indigo-50/50",
                isPriorityHigh && !notification.isRead && "border-l-4 border-l-red-500"
            )}
        >
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="shrink-0 relative">
                    {notification.avatar ? (
                        <img
                            src={notification.avatar}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl border-2 border-indigo-200">
                            📝
                        </div>
                    )}
                    {!notification.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <p className={cn(
                                "text-base mb-1",
                                notification.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-bold"
                            )}>
                                {notification.title}
                            </p>
                            {isPriorityHigh && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                    {notification.priority === 'urgent' ? '🔴 Urgent' : '⚠️ High Priority'}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                    </p>

                    {/* Actions */}
                    <div className={cn(
                        "flex items-center gap-3 transition-opacity",
                        notification.isRead ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    )}>
                        {!notification.isRead && (
                            <button
                                onClick={handleMarkAsRead}
                                disabled={isActing}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                            >
                                {isActing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                Mark as read
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isActing}
                            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {isActing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Helper: Format timestamp to relative time
 */
function formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
