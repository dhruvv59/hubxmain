"use client";

import React, { useEffect, useRef } from 'react';
import { User, Settings, HelpCircle, LogOut, GraduationCap, Award, BarChart3, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
    role: 'student' | 'teacher' | 'admin';
    grade?: string;
    institution?: string;
}

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
}

export function ProfileDropdown({ isOpen, onClose, user }: ProfileDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { logout } = useAuth();

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

    // ESC key to close
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    const menuItems = [
        {
            icon: User,
            label: 'My Profile',
            href: '/profile',
            description: 'View and edit your profile'
        },
        {
            icon: BarChart3,
            label: 'Performance Analytics',
            href: '/analytics',
            description: 'Track your progress'
        },
        {
            icon: Award,
            label: 'Achievements',
            href: '/achievements',
            description: 'View badges and awards'
        },
        {
            icon: FileText,
            label: 'My Tests',
            href: '/my-tests',
            description: 'View all completed tests'
        },
    ];

    const bottomItems = [
        {
            icon: Settings,
            label: 'Settings',
            href: '/settings'
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            href: '/support'
        },
    ];

    const handleNavigation = (href: string) => {
        router.push(href);
        onClose();
    };

    const handleLogout = async () => {
        onClose();
        await logout();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="fixed inset-0 bg-black/20 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div
                ref={dropdownRef}
                className={cn(
                    "fixed md:absolute top-16 md:top-full right-0 md:right-0 mt-0 md:mt-2",
                    "w-full md:w-[340px]",
                    "bg-white rounded-none md:rounded-2xl shadow-2xl border-0 md:border border-gray-100",
                    "z-50",
                    "animate-in fade-in slide-in-from-top-2 md:slide-in-from-top-4 duration-200"
                )}
            >
                {/* User Info Header */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-100">
                                    <span className="text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{user.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    {user.grade && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg w-fit">
                            <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">{user.grade}</span>
                            {user.institution && (
                                <span className="text-xs text-blue-600">• {user.institution}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Menu Items */}
                <div className="py-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className="w-full flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="shrink-0 p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 transition-colors">
                                <item.icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {item.label}
                                </p>
                                {item.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Bottom Items */}
                <div className="py-2">
                    {bottomItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors group"
                        >
                            <item.icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Logout Button */}
                <div className="p-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-colors group"
                    >
                        <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );
}
