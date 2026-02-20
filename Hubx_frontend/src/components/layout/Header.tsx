"use client";

/**
 * Header Component
 * 
 * Main application header with search, notifications, and profile.
 * Integrates with useNotifications hook for real-time updates.
 */

import React, { useState } from "react";
import { Bell, Search, User, Menu, Zap } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown, UserProfile } from "./ProfileDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/http-client";

import { getStreak } from "@/services/dashboard";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [streak, setStreak] = useState(0);
    const { user, isLoading, logout } = useAuth();

    // Fetch streak on mount
    React.useEffect(() => {
        if (user) {
            getStreak().then(setStreak);
        }
    }, [user]);

    /**
     * Notification Management
     * Using the custom hook - this is ALL you need!
     */
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading: isNotificationsLoading,
        error,
        hasMore,
        loadMore,
        refresh,
        isRefreshing
    } = useNotifications({
        enabled: !!user,
        refreshInterval: 60000, // Auto-refresh every minute
        enableRealtime: false,  // Set to true when WebSocket is ready
        onNewNotification: (notification) => {
            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: notification.avatar || '/logo.png',
                    badge: '/logo.png',
                });
            }
        },
        onError: (err) => {
            if (err instanceof ApiError && err.statusCode === 401) {
                logout();
            } else {
                console.error('[Header] Notification error:', err);
            }
        }
    });

    // Close profile when notification opens and vice versa
    const handleNotificationToggle = () => {
        setIsNotificationOpen(!isNotificationOpen);
        if (isProfileOpen) setIsProfileOpen(false);
    };

    const handleProfileToggle = () => {
        setIsProfileOpen(!isProfileOpen);
        if (isNotificationOpen) setIsNotificationOpen(false);
    };

    // Transform user data to UserProfile format
    const userProfile: UserProfile | null = user ? {
        name: user.fullName,
        email: user.email,
        role: user.role.toLowerCase() as 'student' | 'teacher' | 'admin',
    } : null;

    // Show loading skeleton while fetching user data
    if (isLoading) {
        return (
            <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6 relative z-30">
                <div className="flex items-center gap-4 w-full md:w-96">
                    <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
            </header>
        );
    }

    // Don't render header if no user
    if (!user || !userProfile) {
        return null;
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6 relative z-30">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-4 w-full md:w-96">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-muted-foreground hover:text-foreground p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="Search assessments, papers..."
                        aria-label="Search"
                    />
                </div>
            </div>

            {/* Right: Streak + Notifications + Profile */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Streak Indicator */}
                <div
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-600 rounded-full border border-orange-100 font-bold text-sm shadow-sm cursor-help hover:shadow-md transition-shadow"
                    title="Current Learning Streak - Keep it up!"
                >
                    <div className="p-1 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full">
                        <Zap className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                    </div>
                    <span>{streak} Days</span>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-6 bg-gray-200 hidden md:block mx-1"></div>

                {/* Notification Button */}
                <div className="relative">
                    <button
                        onClick={handleNotificationToggle}
                        className={`
                            relative p-2 rounded-full transition-all duration-200
                            ${isNotificationOpen
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                            }
                        `}
                        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                        aria-expanded={isNotificationOpen}
                    >
                        <Bell className="h-5 w-5" />

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white animate-in zoom-in duration-200">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}

                        {/* Pulse animation for new notifications */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-red-400 animate-ping opacity-75" />
                        )}
                    </button>

                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onDelete={deleteNotification}
                        unreadCount={unreadCount}
                        isLoading={isNotificationsLoading}
                        error={error}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        onRefresh={refresh}
                    />
                </div>

                {/* Profile Button */}
                <div className="relative">
                    <button
                        onClick={handleProfileToggle}
                        className={`
                            h-9 w-9 rounded-full flex items-center justify-center font-semibold
                            border-2 border-white shadow-sm transition-all duration-200
                            ${isProfileOpen
                                ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                                : 'hover:shadow-md hover:scale-105'
                            }
                            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white
                        `}
                        aria-label="Profile menu"
                        aria-expanded={isProfileOpen}
                    >
                        <span className="sr-only">User Menu</span>
                        <span className="text-sm font-bold">
                            {userProfile.name.charAt(0).toUpperCase()}
                        </span>
                    </button>

                    <ProfileDropdown
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={userProfile}
                    />
                </div>
            </div>
        </header>
    );
}
