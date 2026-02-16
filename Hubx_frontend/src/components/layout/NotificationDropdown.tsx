"use client";

/**
 * NotificationDropdown Component
 * 
 * Production-grade notification dropdown with premium UX.
 * Features: grouping, filtering, infinite scroll, animations, accessibility.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Bell, Check, X, Eye, Trash2, Clock, AlertCircle, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType, NotificationGroup } from '@/types/notification';

/**
 * Component Props
 */
interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => Promise<void>;
    onMarkAllAsRead: () => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    unreadCount: number;
    isLoading?: boolean;
    error?: Error | null;
    hasMore?: boolean;
    onLoadMore?: () => Promise<void>;
    onRefresh?: () => Promise<void>;
}

/**
 * Notification type styling configuration
 */
const NOTIFICATION_STYLES: Record<NotificationType, {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
}> = {
    assignment: {
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-100',
        icon: '📝'
    },
    test: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100',
        icon: '📋'
    },
    achievement: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-100',
        icon: '🏆'
    },
    feedback: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-100',
        icon: '💬'
    },
    announcement: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-100',
        icon: '📢'
    },
    reminder: {
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-100',
        icon: '⏰'
    },
    system: {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-100',
        icon: '⚙️'
    }
};

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

/**
 * Helper: Group notifications by date
 */
function groupNotificationsByDate(notifications: Notification[]): NotificationGroup[] {
    if (!notifications) return [];
    const groups: NotificationGroup[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayNotifs: Notification[] = [];
    const yesterdayNotifs: Notification[] = [];
    const olderNotifs: Notification[] = [];

    notifications.forEach(notif => {
        const notifDate = new Date(notif.createdAt);
        notifDate.setHours(0, 0, 0, 0);

        if (notifDate.getTime() === today.getTime()) {
            todayNotifs.push(notif);
        } else if (notifDate.getTime() === yesterday.getTime()) {
            yesterdayNotifs.push(notif);
        } else {
            olderNotifs.push(notif);
        }
    });

    if (todayNotifs.length > 0) {
        groups.push({ label: 'Today', notifications: todayNotifs });
    }
    if (yesterdayNotifs.length > 0) {
        groups.push({ label: 'Yesterday', notifications: yesterdayNotifs });
    }
    if (olderNotifs.length > 0) {
        groups.push({ label: 'Earlier', notifications: olderNotifs });
    }

    return groups;
}

/**
 * NotificationItem Component
 */
function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick
}: {
    notification: Notification;
    onMarkAsRead: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onClick?: () => void;
}) {
    const [isActing, setIsActing] = React.useState(false);
    const style = NOTIFICATION_STYLES[notification.type];

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

    const isPriorityHigh = notification.priority === 'high' || notification.priority === 'urgent';

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 transition-all duration-200 relative group cursor-pointer",
                "hover:bg-gray-50 active:bg-gray-100",
                !notification.isRead && "bg-blue-50/30 hover:bg-blue-50/50",
                isPriorityHigh && !notification.isRead && "border-l-4 border-l-red-500"
            )}
        >
            <div className="flex gap-3">
                {/* Avatar or Icon */}
                <div className="shrink-0 relative">
                    {notification.avatar ? (
                        <img
                            src={notification.avatar}
                            alt=""
                            className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className={cn(
                            "h-11 w-11 rounded-full flex items-center justify-center border-2",
                            style.bgColor,
                            style.borderColor,
                            "text-xl"
                        )}>
                            {style.icon}
                        </div>
                    )}
                    {!notification.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm line-clamp-1 transition-colors",
                                notification.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-bold"
                            )}>
                                {notification.title}
                            </p>
                            {isPriorityHigh && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 mt-0.5">
                                    <AlertCircle className="h-3 w-3" />
                                    {notification.priority === 'urgent' ? 'Urgent' : 'High Priority'}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                        </div>

                        {/* Action buttons (shown on hover or for unread) */}
                        <div className={cn(
                            "flex items-center gap-2 transition-opacity",
                            notification.isRead ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                        )}>
                            {!notification.isRead && (
                                <button
                                    onClick={handleMarkAsRead}
                                    disabled={isActing}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {isActing ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Eye className="h-3 w-3" />
                                    )}
                                    Mark read
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                disabled={isActing}
                                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {isActing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3 w-3" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Main NotificationDropdown Component
 */
export function NotificationDropdown({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    unreadCount,
    isLoading = false,
    error = null,
    hasMore = false,
    onLoadMore,
    onRefresh
}: NotificationDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Group notifications by date
    const groupedNotifications = useMemo(() =>
        groupNotificationsByDate(notifications),
        [notifications]
    );

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    // Prevent body scroll when dropdown is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Infinite scroll handler
    useEffect(() => {
        if (!isOpen || !hasMore || !onLoadMore) return;

        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            if (scrollHeight - scrollTop - clientHeight < 100) {
                onLoadMore();
            }
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [isOpen, hasMore, onLoadMore]);

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }

        // Handle action
        if (notification.action) {
            if (notification.action.type === 'navigate' && notification.action.url) {
                router.push(notification.action.url);
                onClose();
            } else if (notification.action.type === 'external' && notification.action.url) {
                window.open(notification.action.url, '_blank');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div
                ref={dropdownRef}
                className={cn(
                    "fixed md:absolute top-16 md:top-full right-0 md:right-0 mt-0 md:mt-2",
                    "w-full md:w-[460px] max-h-[calc(100vh-4rem)] md:max-h-[680px]",
                    "bg-white rounded-none md:rounded-2xl shadow-2xl border-0 md:border border-gray-100",
                    "flex flex-col z-50",
                    "animate-in fade-in slide-in-from-top-2 md:slide-in-from-top-4 duration-200"
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5 md:rounded-t-2xl z-10 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors hover:bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                            <Check className="h-4 w-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Failed to load notifications</p>
                            <p className="text-xs text-gray-500 text-center mb-4">{error.message}</p>
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    ) : isLoading && (!notifications || notifications.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-sm text-gray-500">Loading notifications...</p>
                        </div>
                    ) : !notifications || notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">No notifications</p>
                            <p className="text-xs text-gray-500 text-center">
                                You're all caught up! We'll notify you when something new happens.
                            </p>
                        </div>
                    ) : (
                        <>
                            {groupedNotifications.map((group, groupIndex) => (
                                <div key={group.label}>
                                    {/* Group Label */}
                                    <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm px-5 py-2 border-b border-gray-100 z-[5]">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            {group.label}
                                        </p>
                                    </div>

                                    {/* Notifications in group */}
                                    <div className="divide-y divide-gray-50">
                                        {group.notifications.map(notification => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                                onMarkAsRead={onMarkAsRead}
                                                onDelete={onDelete}
                                                onClick={() => handleNotificationClick(notification)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Load More */}
                            {hasMore && onLoadMore && (
                                <div className="flex justify-center py-4">
                                    <button
                                        onClick={onLoadMore}
                                        disabled={isLoading}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4" />
                                                Load more
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
