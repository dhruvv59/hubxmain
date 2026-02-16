"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
    getStudentProfile,
    getDashboardStats,
    getExcursionData,
    getPapersList,
    getPerformanceMetrics,
    getSubjectPerformance,
    getPeerRank,
    getSyllabusData,
    getHubXTestRecommendations,
    getRecentActivities,
    getNotificationData,
    getUpcomingExamsList
} from "@/services/dashboard";
import { getPurchasedPapersCount } from "@/services/paper";
import { StatCard } from "@/components/dashboard/StatCard";
import { PaperCard } from "@/components/dashboard/PaperCard";
import { PurchasedPapersCard } from "@/components/dashboard/PurchasedPapersCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { SubjectPerformanceWidget } from "@/components/dashboard/SubjectPerformanceWidget";
import { PeerRankWidget } from "@/components/dashboard/PeerRankWidget";
import { ExcursionBanner } from "@/components/dashboard/ExcursionBanner";
import { AIAssessmentBanner } from "@/components/dashboard/AIAssessmentBanner";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { UpcomingExamsWidget } from "@/components/dashboard/UpcomingExamsWidget";
import { CombinedWidget } from "@/components/dashboard/CombinedWidget";
import { HubXSmartTestsWidget } from "@/components/dashboard/HubXSmartTestsWidget";
import { SyllabusCoverageWidget } from "@/components/dashboard/SyllabusCoverageWidget";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

// --- COMPONENTS ---

function HeaderSection() {
    const [profile, setProfile] = useState<{ name: string } | null>(null);

    useEffect(() => {
        getStudentProfile().then(setProfile).catch(console.error);
    }, []);

    if (!profile) return <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>;

    return (
        <div>
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#111827] tracking-tight">
                Hello, {profile.name}
            </h1>
        </div>
    );
}

function StatsSection() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <StatsSkeleton />;
    if (error) return <ErrorFallback message="Failed to load stats" />;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {stats.map(stat => (
                <StatCard key={stat.id} data={stat} />
            ))}
        </div>
    );
}

function ExcursionSection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExcursionData().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-[100px] bg-gray-200 rounded-[24px] animate-pulse"></div>;
    if (!data) return null;

    return <ExcursionBanner data={data} />;
}

function PapersSection({ isMobile }: { isMobile?: boolean }) {
    const [papers, setPapers] = useState<any[]>([]);
    const [purchasedCount, setPurchasedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getPapersList(),
            getPurchasedPapersCount()
        ]).then(([papersList, count]) => {
            setPapers(Array.isArray(papersList) ? papersList : []);
            setPurchasedCount(count);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return isMobile ? null : <div className="h-[200px] bg-gray-200 rounded-[24px] animate-pulse"></div>;
    }

    return (
        <div className={isMobile ? "grid grid-cols-2 gap-3 lg:hidden" : "hidden lg:grid lg:grid-cols-1 gap-5"}>
            {papers.map(paper => (
                <PaperCard key={paper.id} data={paper} />
            ))}

            {purchasedCount > 0 && (
                <PurchasedPapersCard count={purchasedCount} />
            )}

            <AIAssessmentBanner />
        </div>
    );
}

function PerformanceChartSection() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getSubjectPerformance()
            .then((res) => {
                if (res && res.metrics) {
                    const chartData = res.metrics.map((m: any) => ({
                        name: m.subject,
                        score: m.score,
                        fill: m.color,
                        count: m.count
                    }));
                    setData(chartData);
                } else {
                    setData([]);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <ChartSkeleton />;
    if (error) return <ErrorFallback message="Chart unavailable" />;

    return <PerformanceChart initialData={data} />;
}

function BottomChartsSection() {
    const [subjectPerf, setSubjectPerf] = useState<any>(null);
    const [peerRank, setPeerRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getSubjectPerformance(),
            getPeerRank()
        ]).then(([subj, rank]) => {
            setSubjectPerf(subj);
            setPeerRank(rank);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[200px] bg-gray-100 rounded-[24px] animate-pulse"></div>;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 order-1 lg:order-none">
            {subjectPerf && <SubjectPerformanceWidget data={subjectPerf} />}
            {peerRank && <PeerRankWidget data={peerRank} />}
        </div>
    );
}

function SyllabusSection() {
    const [syllabus, setSyllabus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSyllabusData()
            .then((res) => setSyllabus(Array.isArray(res) ? res : []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-[150px] bg-gray-200 rounded-[24px] animate-pulse"></div>;

    return (
        <div className="w-full order-3 lg:order-none">
            <SyllabusCoverageWidget data={syllabus} />
        </div>
    );
}

function TestRecommendationsSection() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHubXTestRecommendations()
            .then((res) => setTests(Array.isArray(res) ? res : []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-[150px] bg-gray-200 rounded-[24px] animate-pulse"></div>;

    return (
        <div className="order-4 lg:order-none">
            <HubXSmartTestsWidget tests={tests} />
        </div>
    );
}

function SidebarWidgets() {
    const [data, setData] = useState<{ upcoming: any[], recent: any[], notifs: any[], focus: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getUpcomingExamsList(),
            getRecentActivities(),
            getNotificationData()
        ]).then(([upcoming, recent, notifData]) => {
            setData({
                upcoming: Array.isArray(upcoming) ? upcoming : [],
                recent: Array.isArray(recent) ? recent : [],
                notifs: notifData && Array.isArray(notifData.notifications) ? notifData.notifications : [],
                focus: notifData && Array.isArray(notifData.focusAreas) ? notifData.focusAreas : []
            });
        }).catch((err) => {
            console.error("Failed to load sidebar widgets data:", err);
            // Fallback to empty state on error
            setData({
                upcoming: [],
                recent: [],
                notifs: [],
                focus: []
            });
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <SidebarSkeleton />;
    if (!data) return null;

    return (
        <>
            <div className="h-auto">
                <UpcomingExamsWidget exams={data.upcoming} />
            </div>

            <RecentActivityWidget activities={data.recent} />

            <CombinedWidget
                notifications={data.notifs}
                focusAreas={data.focus}
            />
        </>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-[180px] bg-gray-200 rounded-[24px]"></div>)}
        </div>
    );
}

function ChartSkeleton() {
    return <div className="h-[300px] bg-gray-200 rounded-[24px] animate-pulse"></div>;
}

function SidebarSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            <div className="h-[100px] bg-gray-200 rounded-[24px]"></div>
            <div className="h-[150px] bg-gray-200 rounded-[24px]"></div>
            <div className="h-[200px] bg-gray-200 rounded-[24px]"></div>
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 font-sans bg-[#fafafa] min-h-screen">
            {/* Greeting */}
            <HeaderSection />

            <div className="grid grid-cols-12 gap-6">
                {/* LEFT COLUMN (Main Content) */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-5">

                    {/* Stats */}
                    <StatsSection />

                    {/* Excursion Banner */}
                    <ExcursionSection />

                    {/* Mobile Papers Grid */}
                    <PapersSection isMobile={true} />

                    {/* Performance Chart */}
                    <PerformanceChartSection />

                    {/* Bottom Charts */}
                    <BottomChartsSection />

                    {/* Syllabus */}
                    <SyllabusSection />

                    {/* Test Recommendations */}
                    <TestRecommendationsSection />

                </div>

                {/* RIGHT COLUMN (Widgets) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">

                    {/* Desktop Papers Sidebar & Widgets */}
                    <PapersSection isMobile={false} />
                    <SidebarWidgets />

                </div>
            </div>
        </div>
    );
}

