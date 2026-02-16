"use client";

import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { TabButton, DateSelector } from "./Controls";
import { PeerRankData } from "@/types/dashboard";
import { getPerformanceMetrics } from "@/services/dashboard";

interface PeerRankWidgetProps {
    data: PeerRankData;
}

export function PeerRankWidget({ data }: PeerRankWidgetProps) {
    const getInitialRange = () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return {
            from: start.toLocaleDateString('en-GB').replace(/\//g, '.'),
            to: end.toLocaleDateString('en-GB').replace(/\//g, '.')
        };
    };

    const [activeTab, setActiveTab] = React.useState("Last Month");
    const [dateRange, setDateRange] = React.useState(getInitialRange());
    const [historyData, setHistoryData] = React.useState(data.history);

    // In a production app, these values would update based on the fetched data for the selected period
    const userRank = { rank: data.currentRank, percentile: data.currentPercentile };

    // Helper to format API date
    const toApiDate = (dateStr: string) => {
        const parts = dateStr.split('.');
        if (parts.length !== 3) return undefined;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    React.useEffect(() => {
        const fetchData = async () => {
            const apiFrom = toApiDate(dateRange.from);
            const apiTo = toApiDate(dateRange.to);
            try {
                const res = await getPerformanceMetrics(apiFrom, apiTo);
                // res is array of { name, score, fill, date }
                if (Array.isArray(res)) {
                    // Map to { x, y } format expected by AreaChart
                    // We need to preserve the chronological order (backend returns reversed/newest first usually? 
                    // No, backend getPerformanceMetrics returns: attempts.reverse() -> Oldest to Newest.
                    // So we can just map simple index
                    const newData = res.map((item: any, index: number) => ({
                        x: index + 1,
                        y: item.score
                    }));
                    setHistoryData(newData);
                }
            } catch (err) {
                console.error("Error fetching peer rank history", err);
            }
        };
        // Skip first run if we want to use initial data, but syncing is safer
        if (activeTab !== "") {
            fetchData();
        }
    }, [dateRange, activeTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        let newFrom = "01.09.2025";
        const newTo = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

        const getPastDate = (months: number) => {
            const d = new Date();
            d.setMonth(d.getMonth() - months);
            return d.toLocaleDateString('en-GB').replace(/\//g, '.');
        }

        if (tab === "Last 3 Months") {
            newFrom = getPastDate(3);
        } else if (tab === "Last 6 Months") {
            newFrom = getPastDate(6);
        } else if (tab === "Last Month") {
            newFrom = getPastDate(1);
        }

        setDateRange({ from: newFrom, to: newTo });
    };

    const handleFromDateChange = (newDate: string) => {
        setDateRange(prev => ({ ...prev, from: newDate }));
        setActiveTab("");
    };

    const handleToDateChange = (newDate: string) => {
        setDateRange(prev => ({ ...prev, to: newDate }));
        setActiveTab("");
    };

    // Calculate average percentile from the currently displayed history data
    const dynamicPercentile = React.useMemo(() => {
        if (!historyData || historyData.length === 0) return userRank.percentile;
        const total = historyData.reduce((sum, item) => sum + (item.y || 0), 0);
        return Math.round(total / historyData.length);
    }, [historyData, userRank.percentile]);

    return (
        <div className="bg-white rounded-[24px] p-4 md:p-6 shadow-sm flex flex-col h-auto md:h-[520px] relative w-full">
            <h3 className="text-[16px] font-bold text-gray-800 mb-4">Performance Rank Among Peers</h3>

            <div className="mb-4">
                <DateSelector
                    fromDate={dateRange.from}
                    toDate={dateRange.to}
                    onFromChange={handleFromDateChange}
                    onToChange={handleToDateChange}
                />
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-6">
                {["Last Month", "Last 3 Months", "Last 6 Months"].map((tab) => (
                    <TabButton
                        key={tab}
                        active={activeTab === tab}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </TabButton>
                ))}
            </div>

            {/* Mobile/Tablet Rank Display - Visible up to lg breakpoint */}
            <div className="flex lg:hidden flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Rank</span>
                    <span className="text-lg font-bold text-blue-600">#{userRank.rank} <span className="text-sm font-normal text-gray-400">({dynamicPercentile}%)</span></span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Highest Rank</span>
                    <span className="text-lg font-bold text-teal-500">#1 <span className="text-sm font-normal text-gray-400">({data.highestRankPercentile}%)</span></span>
                </div>
            </div>

            <div className="h-[250px] lg:flex-1 w-full relative">
                <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorY" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#fdba74" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 100]} ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} tickFormatter={(val) => `${val}%`} />

                            {/* Hidden XAxis to maintain shape */}
                            <XAxis dataKey="x" hide />

                            <Area type="monotone" dataKey="y" stroke="#22d3ee" strokeWidth={3} fill="url(#colorY)" fillOpacity={1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Rank Dot/Arrow - Positioned based on Highest Rank Percentile - Hidden on smaller screens */}
                <div className="absolute right-[5px] top-[5%] flex items-center z-10 animate-in fade-in zoom-in duration-500 hidden lg:flex">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[12px] font-bold text-[#2dd4bf] italic mb-1">Rank 1 - {data.highestRankPercentile}%</span>
                        <div className="h-[1px] w-[200px] bg-[#2dd4bf] relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#2dd4bf] ring-2 ring-white"></div>
                            <ChevronDown className="h-3 w-3 text-[#2dd4bf] absolute -left-1 -top-[5px] rotate-90" />
                        </div>
                    </div>
                </div>

                {/* User Rank Dot/Arrow - Dynamic Position - Hidden on smaller screens */}
                {/* 100 - percentile gives the top percentage for css 'top' attribute roughly */}
                <div className="absolute right-[20%] z-10 transition-all duration-500 hidden lg:flex" style={{ top: `${100 - dynamicPercentile + 5}%` }}>
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[12px] font-bold text-[#3b82f6] italic mb-1">Rank {userRank.rank} - {dynamicPercentile}%</span>
                        <div className="h-[1px] w-[250px] bg-[#3b82f6] relative shadow-sm">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#3b82f6] ring-2 ring-white shadow-md"></div>
                            <ChevronDown className="h-3 w-3 text-[#3b82f6] absolute -left-1 -top-[5px] rotate-90" />
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex justify-center mt-4 space-x-6 pb-2">
                <div className="flex items-center text-[11px] font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-[#3b82f6] mr-2"></span> Your Rank</div>
                <div className="flex items-center text-[11px] font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-[#2dd4bf] mr-2"></span> Highest Rank</div>
            </div>
        </div>
    );
}
