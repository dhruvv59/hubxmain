"use client";

import React, { useEffect, useRef } from 'react';
import { User, Settings, HelpCircle, LogOut, Users, BookOpen, FileText, BarChart3, Library, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export interface TeacherProfile {
    name: string;
    email: string;
    avatar?: string;
    role: 'teacher' | 'admin';
    department?: string;
    institution?: string;
    employeeId?: string;
}

interface TeacherProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    user: TeacherProfile;
}

export function TeacherProfileDropdown({ isOpen, onClose, user }: TeacherProfileDropdownProps) {
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
            href: '/teacher/profile',
            description: 'View and edit your profile'
        },
        {
            icon: Users,
            label: 'My Classes',
            href: '/teacher/classes',
            description: 'Manage your classes and students'
        },
        {
            icon: BookOpen,
            label: 'Student Management',
            href: '/teacher/students',
            description: 'Track student progress'
        },
        {
            icon: BarChart3,
            label: 'Performance Reports',
            href: '/teacher/reports',
            description: 'View analytics and insights'
        },
        {
            icon: Library,
            label: 'Question Bank',
            href: '/teacher/question-bank',
            description: 'Manage your questions'
        },
        {
            icon: ClipboardList,
            label: 'Paper Management',
            href: '/teacher/public-papers',
            description: 'Create and manage papers'
        },
    ];

    const bottomItems = [
        {
            icon: Settings,
            label: 'Settings',
            href: '/teacher/settings'
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            href: '/teacher/support'
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
                    "w-full md:w-[360px]",
                    "bg-white rounded-none md:rounded-2xl shadow-2xl border-0 md:border border-gray-100",
                    "z-50",
                    "animate-in fade-in slide-in-from-top-2 md:slide-in-from-top-4 duration-200"
                )}
            >
                {/* User Info Header */}
                <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center border-2 border-white shadow-md">
                                    <span className="text-white font-bold text-xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">{user.name}</h3>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-indigo-100">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <span className="text-xs font-semibold text-indigo-700">Teacher</span>
                        </div>
                        {user.department && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-purple-100">
                                <span className="text-xs font-medium text-purple-700">{user.department}</span>
                            </div>
                        )}
                        {user.employeeId && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                <span className="text-xs font-medium text-gray-600">ID: {user.employeeId}</span>
                            </div>
                        )}
                    </div>
                    {user.institution && (
                        <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{user.institution}</span>
                        </div>
                    )}
                </div>

                {/* Main Menu Items */}
                <div className="py-2 max-h-[400px] overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className="w-full flex items-start gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                        >
                            <div className="shrink-0 p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 group-hover:border-indigo-200 transition-all">
                                <item.icon className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
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
