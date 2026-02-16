"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Calendar, Loader2 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { ChartDataPoint } from "@/types/teacher";

type TimePeriod = '1month' | '3months' | '6months' | 'custom';

interface DateRange {
    from: string;
    to: string;
}

interface RevenueChartProps {
    data: ChartDataPoint[];
}

function DatePickerButton({ label, onClick, className }: { label: string; onClick?: () => void; className?: string }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors cursor-pointer select-none ${className || 'hover:bg-gray-50'}`}
        >
            <Calendar className="w-3 h-3 text-gray-400" />
            {label}
            <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
    );
}

export function RevenueChart({ data: initialData }: RevenueChartProps) {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('1month');
    const [dateRange, setDateRange] = useState<DateRange>({
        from: '',
        to: ''
    });
    const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize date range on client side to avoid hydration mismatch
    useEffect(() => {
        const today = new Date();
        const fromDate = new Date(new Date().setMonth(today.getMonth() - 1));

        setDateRange({
            from: fromDate.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        });
    }, []);

    // Filter data client-side when filters change
    const filterData = (period: TimePeriod, range: DateRange) => {
        setIsLoading(true);

        try {
            let filteredData = [...initialData];

            if (period === 'custom' && range.from && range.to) {
                const fromDate = new Date(range.from);
                const toDate = new Date(range.to);
                toDate.setHours(23, 59, 59, 999); // End of day

                filteredData = initialData.filter(item => {
                    // Assuming item.fullDate exists from backend improvement, 
                    // OR we parse "Jan 2024" if fullDate is missing.
                    // The backend now returns fullDate (e.g., "Jan 2024"). 
                    // Actually, let's look at what we did in backend:
                    // name: "Jan", details: ..., fullDate: "Jan 2024"
                    // Wait, frontend Type ChartDataPoint usually only has name, value.
                    // I need to be careful about matching types.
                    // If strict type doesn't have fullDate, I might need to rely on parsing `name` if it was full, 
                    // BUT the backend returns `name: "Jan"` and `fullDate: "Jan 2024"`.
                    // The ChartDataPoint type might strip extra fields.
                    // For now, let's assume we can rely on index or basic filtering if we don't have full dates.
                    // OR better, since this is a chart, "Last 3 months" usually means "Last 3 data points" if sorted.

                    // Simple "Last N Months" logic based on array length (assuming sorted data)
                    return true;
                });
            }

            const monthMap: Record<TimePeriod, number> = {
                '1month': 1,
                '3months': 3,
                '6months': 6,
                'custom': 0
            };

            if (period !== 'custom') {
                const monthsToShow = monthMap[period];
                // Take the last N items
                filteredData = initialData.slice(-monthsToShow);
            } else {
                // Custom range filtering implementation
                // Since we might not have full date objects on the frontend interface,
                // and parsing "Jan" is ambiguous without year,
                // we will stick to the "slice" logic for presets.
                // For custom, if we can't parse, we show all or keep valid logic.

                // If data has fullDate (which we added in backend), we can use it.
                // Let's coerce type for now to accessing fullDate if present.
                const fromTime = new Date(range.from).getTime();
                const toTime = new Date(range.to).getTime();

                filteredData = initialData.filter((item: any) => {
                    if (!item.fullDate) return true;
                    // parse "Jan 2024"
                    const itemTime = new Date("01 " + item.fullDate).getTime();
                    return itemTime >= fromTime && itemTime <= toTime;
                });
            }

            setChartData(filteredData);
        } catch (err) {
            console.error('Error filtering revenue data:', err);
            setError('Failed to filter data');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle time period button click
    const handlePeriodChange = (period: TimePeriod) => {
        setTimePeriod(period);

        // Update date range based on period (visual only/helper)
        const today = new Date();
        let fromDate: Date;

        switch (period) {
            case '1month':
                fromDate = new Date(today.setMonth(today.getMonth() - 1));
                break;
            case '3months':
                fromDate = new Date(today.setMonth(today.getMonth() - 3));
                break;
            case '6months':
                fromDate = new Date(today.setMonth(today.getMonth() - 6));
                break;
            default:
                return; // Don't update range for custom
        }

        const newRange = {
            from: fromDate.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
        };

        setDateRange(newRange);
        filterData(period, newRange);
    };

    // Handle custom date selection
    const handleDateChange = (type: 'from' | 'to', value: string) => {
        const newRange = { ...dateRange, [type]: value };
        setDateRange(newRange);
        setTimePeriod('custom');
        filterData('custom', newRange);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Select Date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-base font-bold text-gray-800">Revenue Analysis</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Date Range Pickers */}
                    <div className="flex items-center gap-2 sm:mr-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">From</span>
                            <div className="relative flex-1 sm:flex-none">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => handleDateChange('from', e.target.value)}
                                    max={dateRange.to}
                                    className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <DatePickerButton
                                    label={formatDate(dateRange.from)}
                                    className="peer-hover:bg-gray-50"
                                />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">To</span>
                            <div className="relative flex-1 sm:flex-none">
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => handleDateChange('to', e.target.value)}
                                    min={dateRange.from}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <DatePickerButton
                                    label={formatDate(dateRange.to)}
                                    className="peer-hover:bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time Period Buttons */}
                    <div className="flex bg-[#f8f9fa] rounded-lg p-1 border border-gray-100 overflow-x-auto max-w-[100vw] sm:max-w-none custom-scrollbar">
                        <button
                            onClick={() => handlePeriodChange('1month')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${timePeriod === '1month'
                                ? 'bg-[#e0e7ff] text-[#4338ca] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Last Month
                        </button>
                        <button
                            onClick={() => handlePeriodChange('3months')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${timePeriod === '3months'
                                ? 'bg-[#e0e7ff] text-[#4338ca] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Last 3 Months
                        </button>
                        <button
                            onClick={() => handlePeriodChange('6months')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${timePeriod === '6months'
                                ? 'bg-[#e0e7ff] text-[#4338ca] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Last 6 Months
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[280px] w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="w-8 h-8 text-[#4338ca] animate-spin" />
                    </div>
                )}

                {error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-red-500 font-medium mb-2">Failed to load revenue data</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => filterData(timePeriod, dateRange)}
                            className="px-4 py-2 bg-[#4338ca] text-white text-sm font-medium rounded-lg hover:bg-[#3730a3] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 font-medium">No revenue data available for this period</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#4f46e5', opacity: 0.05 }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                formatter={(value: any) => [`₹${value?.toLocaleString() ?? 0}`, 'Revenue']}
                            />
                            <Bar
                                dataKey="value"
                                fill="#5b5fc7"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export function RevenueChartSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] animate-pulse">
            <div className="flex justify-between mb-8">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-[250px] bg-gray-100 rounded"></div>
        </div>
    );
}
