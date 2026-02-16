"use client";

import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartDataPoint } from "@/types/dashboard";
import { TabButton, DateSelector } from "./Controls";

interface PerformanceChartProps {
    initialData: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[150px]">
                <p className="text-gray-800 font-bold mb-1 border-b border-gray-100 pb-1">{label}</p>
                <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="text-gray-500 text-sm">Score:</span>
                    <span className="text-gray-900 font-bold" style={{ color: payload[0].payload.fill }}>
                        {payload[0].value}%
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 mt-1">
                    <span className="text-gray-500 text-sm">Tests Taken:</span>
                    <span className="text-gray-700 font-semibold">{payload[0].payload.count}</span>
                </div>
            </div>
        );
    }
    return null;
};

export function PerformanceChart({ initialData }: PerformanceChartProps) {
    const [activeTab, setActiveTab] = React.useState("Last Month");
    const [data, setData] = React.useState(initialData);

    // Helpers
    const formatDate = (date: Date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    };

    const getRange = (months: number) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        return { from: formatDate(start), to: formatDate(end) };
    };

    const [dateRange, setDateRange] = React.useState(getRange(1)); // Default Last Month
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch data when dateRange changes
    React.useEffect(() => {
        const fetchData = async () => {
            const toApiDate = (dateStr: string) => {
                const parts = dateStr.split('.');
                if (parts.length !== 3) return undefined;
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            };

            const apiFrom = toApiDate(dateRange.from);
            const apiTo = toApiDate(dateRange.to);

            try {
                const { getSubjectPerformance } = await import("@/services/dashboard");
                const resData = await getSubjectPerformance(apiFrom, apiTo);

                if (resData && resData.metrics) {
                    const chartData = resData.metrics.map((m: any) => ({
                        name: m.subject,
                        score: m.score,
                        fill: m.color,
                        count: m.count
                    }));
                    setData(chartData);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
                setData([]);
            }
        };

        fetchData();
    }, [dateRange]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        let range = { from: "", to: "" };

        switch (tab) {
            case "Last Month": range = getRange(1); break;
            case "Last 3 Months": range = getRange(3); break;
            case "Last 6 Months": range = getRange(6); break;
            default: return;
        }
        setDateRange(range);
    };

    const handleFromDateChange = (newDate: string) => {
        setDateRange(prev => ({ ...prev, from: newDate }));
        setActiveTab("");
    };

    const handleToDateChange = (newDate: string) => {
        setDateRange(prev => ({ ...prev, to: newDate }));
        setActiveTab("");
    };

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm w-full border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h3 className="text-[18px] font-bold text-gray-800 whitespace-nowrap">Performance Analysis</h3>
                    <div className="flex flex-wrap gap-2 items-center">
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
                </div>
                <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <DateSelector
                        fromDate={dateRange.from}
                        toDate={dateRange.to}
                        onFromChange={handleFromDateChange}
                        onToChange={handleToDateChange}
                    />
                </div>
            </div>

            <div className="h-[350px] w-full mt-4">
                {data.length > 0 ? (
                    <>
                        <style>
                            {`
                                .custom-scrollbar::-webkit-scrollbar {
                                    height: 6px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background-color: #e5e7eb;
                                    border-radius: 20px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background-color: #d1d5db;
                                }
                            `}
                        </style>
                        <div className="w-full h-full overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
                            <div style={{ width: data.length > 0 ? `${Math.max(data.length * (isMobile ? 100 : 120), isMobile ? 300 : 600)}px` : '100%', minWidth: '100%', height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                                        barSize={isMobile ? 32 : 48}
                                    >
                                        <defs>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                const item = data.find((d) => d.name === payload.value);
                                                const count = item?.count || 0;
                                                const displayName = payload.value.length > 15 ? `${payload.value.substring(0, 15)}...` : payload.value;

                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={0}
                                                            y={0}
                                                            dy={16}
                                                            textAnchor="middle"
                                                            fill="#6b7280"
                                                            fontSize={12}
                                                            fontWeight={500}
                                                        >
                                                            {displayName}
                                                            <tspan fill="#9ca3af" dx={4}>({count})</tspan>
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                            height={60}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            width={40}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 } as any} />
                                        <Bar dataKey="score" radius={[12, 12, 12, 12]}>
                                            {data.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill || '#3b82f6'}
                                                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.05))' }}
                                                />
                                            ))}
                                            <LabelList dataKey="score" position="top" formatter={(val: any) => `${val}%`} style={{ fill: '#374151', fontSize: '12px', fontWeight: 'bold' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <TrendingUp className="h-8 w-8 text-gray-300" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">No Data Available</h4>
                        <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
                            Take some tests to see your subject-wise performance analysis here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
