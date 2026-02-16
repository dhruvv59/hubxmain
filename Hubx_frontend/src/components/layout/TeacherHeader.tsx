"use client";

/**
 * TeacherHeader Component
 * 
 * Main application header for teachers with search, notifications, and profile.
 * Integrates with useNotifications hook for real-time updates.
 */

import React, { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { TeacherProfileDropdown, TeacherProfile } from "./TeacherProfileDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

interface TeacherHeaderProps {
    onMenuClick?: () => void;
}

export function TeacherHeader({ onMenuClick }: TeacherHeaderProps) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, isLoading } = useAuth();

    /**
     * Notification Management
     * Using the custom hook for real-time notification updates
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
    } = useNotifications({
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
            console.error('[TeacherHeader] Notification error:', err);
        }
    });

    const handleNotificationToggle = () => {
        setIsNotificationOpen(!isNotificationOpen);
        if (isProfileOpen) setIsProfileOpen(false);
    };

    const handleProfileToggle = () => {
        setIsProfileOpen(!isProfileOpen);
        if (isNotificationOpen) setIsNotificationOpen(false);
    };

    // Transform user data to TeacherProfile format
    const teacherProfile: TeacherProfile | null = user ? {
        name: user.fullName,
        email: user.email,
        role: user.role.toLowerCase() as 'teacher' | 'admin',
    } : null;

    // Show loading skeleton while fetching user data
    if (isLoading) {
        return (
            <header className="h-[70px] w-full bg-white border-b border-[#f0f0f0] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
                <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-full max-w-[400px] bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
            </header>
        );
    }

    // Don't render header if no user
    if (!user || !teacherProfile) {
        return null;
    }

    return (
        <header className="h-[70px] w-full bg-white border-b border-[#f0f0f0] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 gap-4">
            {/* Left Section: Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
                    suppressHydrationWarning
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar */}
                <div className="relative w-full max-w-[400px] hidden sm:block">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Papers, Students & Classes"
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                        suppressHydrationWarning={true}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                {/* Mobile Search Icon (visible when search bar is hidden) */}
                <button
                    className="p-2 text-gray-400 hover:text-gray-600 sm:hidden"
                    suppressHydrationWarning
                >
                    <Search className="h-5 w-5" />
                </button>

                {/* Notification Button with Dropdown */}
                <div className="relative">
                    <button
                        onClick={handleNotificationToggle}
                        className={`
                            relative p-2 rounded-full transition-all duration-200
                            ${isNotificationOpen
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }
                        `}
                        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                        aria-expanded={isNotificationOpen}
                        suppressHydrationWarning={true}
                    >
                        <Bell className="h-6 w-6" />

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white animate-in zoom-in duration-200">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}

                        {/* Pulse animation for new notifications */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-2 h-[18px] w-[18px] rounded-full bg-red-400 animate-ping opacity-75" />
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

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={handleProfileToggle}
                        className={`
                            h-9 w-9 rounded-full flex items-center justify-center font-semibold
                            border-2 border-white shadow-sm transition-all duration-200
                            ${isProfileOpen
                                ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                                : 'hover:shadow-md hover:scale-105'
                            }
                            bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white
                        `}
                        aria-label="Profile menu"
                        aria-expanded={isProfileOpen}
                        suppressHydrationWarning
                    >
                        <span className="sr-only">User Menu</span>
                        <span className="text-sm font-bold">
                            {teacherProfile.name.charAt(0).toUpperCase()}
                        </span>
                    </button>

                    <TeacherProfileDropdown
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={teacherProfile}
                    />
                </div>
            </div>
        </header>
    );
}

