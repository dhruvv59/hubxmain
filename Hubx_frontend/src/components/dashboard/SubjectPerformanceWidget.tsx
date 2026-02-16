"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { TabButton, DateSelector } from "./Controls";
import { SubjectPerformanceData } from "@/types/dashboard";
import { getSubjectPerformance } from "@/services/dashboard";

interface SubjectPerformanceWidgetProps {
    data: SubjectPerformanceData;
}

export function SubjectPerformanceWidget({ data }: SubjectPerformanceWidgetProps) {
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
    const [selectedSubject, setSelectedSubject] = React.useState(data.currentSubject);
    const [dateRange, setDateRange] = React.useState(getInitialRange());
    const [chartMetrics, setChartMetrics] = React.useState(data.metrics);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                // Fetch new data based on date range
                const res = await getSubjectPerformance(apiFrom, apiTo);
                if (res && res.metrics) {
                    setChartMetrics(res.metrics);
                }
            } catch (err) {
                console.error("Error fetching subject performance", err);
            }
        };
        fetchData();
    }, [dateRange]);

    // Changed to trigger effect instead of fake data
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        let newFrom = "01.09.2025";
        const newTo = new Date().toLocaleDateString('en-GB').replace(/\//g, '.'); // Today

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

    const handleSubjectSelect = (subject: string) => {
        setSelectedSubject(subject);
        setIsDropdownOpen(false);
    };

    // Find metrics for selected subject or default to first
    const currentMetric = chartMetrics.find(m => m.subject === selectedSubject) || chartMetrics[0];
    const percentage = currentMetric ? currentMetric.score : 0;
    const color = currentMetric ? currentMetric.color : "#e5e7eb";

    const chartData = [
        { name: "Completed", value: percentage, color: color },
        { name: "Remaining", value: 100 - percentage, color: "#f3f4f6" },
    ];

    return (
        <div className="bg-white rounded-[24px] p-4 md:p-6 shadow-sm flex flex-col h-[520px] w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <h3 className="text-[16px] font-bold text-gray-800">Performance by Subject</h3>

                {/* Dropdown for Subjects */}
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-[12px] font-bold text-blue-600 flex items-center justify-between w-full sm:w-auto bg-blue-50 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                        {selectedSubject} <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Dropdown Content */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full sm:w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            {data.metrics.map(metric => (
                                <div
                                    key={metric.subject}
                                    onClick={() => handleSubjectSelect(metric.subject)}
                                    className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg cursor-pointer font-medium transition-colors"
                                >
                                    {metric.subject}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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

            <div className="flex-1 relative flex items-center justify-center min-h-[250px] lg:min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius="65%"
                            outerRadius="90%"
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[36px] lg:text-[56px] font-black italic" style={{ color: "#1f2937" }}>{percentage}%</span>
                </div>
            </div>
        </div>
    );
}
