"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
    getTeacherInfo,
    getTeacherStats,
    getRevenueData,
    getLikeabilityData,
    getNotifications
} from "@/services/teacher-dashboard";
import { StatCard, StatCardSkeleton } from "@/components/teacher/dashboard/StatCard";
import { Banners } from "@/components/teacher/dashboard/Banners";
import { RevenueChart, RevenueChartSkeleton } from "@/components/teacher/dashboard/RevenueChart";
import { LikeabilityChart, LikeabilityChartSkeleton } from "@/components/teacher/dashboard/LikeabilityChart";
import { NotificationsList, NotificationsListSkeleton } from "@/components/teacher/dashboard/NotificationsList";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

/**
 * CLIENT COMPONENTS WITH DATA FETCHING
 */

function TeacherHeader() {
    const [info, setInfo] = useState<{ teacherName: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeacherInfo()
            .then(setInfo)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>;
    if (!info) return null;

    return <h1 className="text-2xl font-bold text-gray-800">Hello, {info.teacherName}</h1>;
}

function StatsGrid() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeacherStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map(stat => (
                <StatCard key={stat.id} stat={stat} />
            ))}
        </div>
    );
}

function RevenueSection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRevenueData()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <RevenueChartSkeleton />;

    return <RevenueChart data={data} />;
}

function LikeabilitySection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLikeabilityData()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LikeabilityChartSkeleton />;

    return <LikeabilityChart data={data} />;
}

function NotificationsSection() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNotifications()
            .then(setNotifications)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <NotificationsListSkeleton />;

    return <NotificationsList notifications={notifications} />;
}

/**
 * Main Dashboard Page
 */
export default function TeacherDashboard() {
    return (
        <div className="space-y-6 max-w-[1500px] mx-auto pb-10 px-4 sm:px-6">
            {/* Header */}
            <ErrorBoundary>
                <TeacherHeader />
            </ErrorBoundary>

            {/* Stats Grid */}
            <ErrorBoundary>
                <StatsGrid />
            </ErrorBoundary>

            {/* Banners */}
            <Banners />

            {/* Bottom Grid: Charts & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Revenue Chart */}
                    <ErrorBoundary>
                        <RevenueSection />
                    </ErrorBoundary>

                    {/* Likeability Chart */}
                    <ErrorBoundary>
                        <LikeabilitySection />
                    </ErrorBoundary>
                </div>

                {/* Right Column: Notifications */}
                <div className="lg:col-span-1">
                    <ErrorBoundary>
                        <NotificationsSection />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}
