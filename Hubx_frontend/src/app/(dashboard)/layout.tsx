"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN') {
                router.push('/teacher');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="mt-4 text-sm text-gray-500">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Return null to prevent flash of content while redirecting
    }

    return (
        <div className="flex h-[100dvh] bg-border/20">
            {/* Desktop Sidebar (Hidden on mobile) */}
            <Sidebar />

            {/* Mobile Sidebar Overlay (Always rendered for smooth transition) */}
            <div
                className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Sidebar Container with Slide Effect */}
                <div
                    className={`absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <Sidebar
                        isMobile={true}
                        onClose={() => setIsMobileMenuOpen(false)}
                        className="w-full h-full relative"
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden pl-0 md:pl-[100px]">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fafafa]">
                    {children}
                </main>
            </div>
        </div>
    );
}

