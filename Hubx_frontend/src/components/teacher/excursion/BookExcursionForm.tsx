"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, getDate } from "date-fns";
import clsx from "clsx";

interface MonthlyCalendarProps {
    selectedDate: Date | undefined;
    onSelectDate: (date: Date) => void;
    isDateAvailable?: (date: Date) => boolean;
}

function MonthlyCalendar({ selectedDate, onSelectDate, isDateAvailable }: MonthlyCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-6 px-2">
                <button
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                    type="button"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    {format(currentMonth, "MMMM")}
                </div>
                <button
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                    type="button"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-gray-900 italic h-8 flex items-center justify-center">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);

                // Allow custom availability logic, default true
                const isAvailable = isDateAvailable ? isDateAvailable(day) : true;
                const isDisabled = !isCurrentMonth || !isAvailable;

                days.push(
                    <div
                        key={day.toString()}
                        className="flex items-center justify-center p-1"
                    >
                        <button
                            type="button"
                            onClick={() => isAvailable && onSelectDate(cloneDay)}
                            disabled={isDisabled}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all",
                                !isCurrentMonth && "text-gray-300 font-medium cursor-default opacity-0", // Hide non-current month dates completely if desired, or keep as grey
                                isCurrentMonth && !isAvailable && "text-gray-300 font-medium cursor-default", // Greyed out for unavailable
                                isCurrentMonth && isAvailable && !isSelected && "text-gray-900 font-black hover:bg-gray-100",
                                isSelected && "bg-black text-white font-bold shadow-md"
                            )}
                        >
                            {formattedDate}
                        </button>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    return (
        <div className="bg-white">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}

// --- Main Form Component ---

export interface BookingData {
    standard: string;
    students: string;
    date: Date | undefined;
    timeSlot: string;
}

export function BookExcursionForm({
    companyNameInitial = "GlenMark",
    companyTypeInitial = "Biotechnology",
    onUpdate,
    onSubmit
}: {
    companyNameInitial?: string;
    companyTypeInitial?: string;
    onUpdate: (data: BookingData) => void;
    onSubmit?: () => void;
}) {
    const [standard, setStandard] = useState("");
    const [students, setStudents] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState("");

    // Notify parent of changes
    React.useEffect(() => {
        onUpdate({
            standard,
            students,
            date: selectedDate,
            timeSlot: selectedSlot
        });
    }, [standard, students, selectedDate, selectedSlot, onUpdate]);

    // Simplified availability slots - only show when date is selected
    const availableSlots = [
        "9AM TO 12PM",
        "2PM TO 5PM"
    ];

    // Mock availability logic to match screenshot (Jan 1, 2, 3 disabled)
    const isDateAvailable = (date: Date) => {
        const d = getDate(date);
        // Only for demo: disable 1st, 2nd, 3rd of the month to match the "greyed out" look in mockup
        if (d <= 3) return false;
        return true;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Company Name</label>
                    <input
                        type="text"
                        value={companyNameInitial}
                        disabled
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold focus:outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Company Type</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
                            value={companyTypeInitial}
                            disabled
                        >
                            <option value={companyTypeInitial}>{companyTypeInitial}</option>
                            <option value="Renewable Energy">Renewable Energy</option>
                            <option value="Biotechnology">Biotechnology</option>
                            <option value="Software">Software</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <span className="text-[10px]">▼</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Select Standard</label>
                    <div className="relative">
                        <select
                            value={standard}
                            onChange={(e) => setStandard(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
                        >
                            <option value="" disabled hidden></option>
                            <option value="8th">8th</option>
                            <option value="9th">9th</option>
                            <option value="10th">10th</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <span className="text-[10px]">▼</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">No of Students (Max 40)</label>
                    <input
                        type="number"
                        value={students}
                        onChange={(e) => setStudents(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
                        placeholder=""
                    />
                </div>
            </div>

            {/* Row 3: Calendar and Slots */}
            <div className="grid grid-cols-[1.2fr,1fr] gap-8">
                {/* Calendar Column */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1 mb-2">
                        <label className="text-xs font-semibold text-gray-500">Select Date</label>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] font-medium text-gray-400">Not Available</span>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-2xl p-6">
                        <MonthlyCalendar
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            isDateAvailable={isDateAvailable}
                        />
                    </div>
                </div>

                {/* Slots Column */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Select Slot</label>
                    <div className="border border-gray-200 rounded-2xl p-6 h-[400px] flex flex-col overflow-y-auto">
                        <h4 className="text-sm font-black text-gray-800 italic uppercase mb-6">
                            AVAILABLE SLOTS {selectedDate ? `- ${format(selectedDate, "MMMM do").toUpperCase()}` : ""}
                        </h4>

                        {!selectedDate ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center pb-8 opacity-60">
                                {/* Yellow Calendar Icon */}
                                <div className="relative mb-4">
                                    <CalendarIcon className="w-16 h-16 text-gray-800 stroke-[1.5]" />
                                    <div className="absolute top-[8px] left-[6px] right-[6px] bottom-[6px] bg-[#fcd34d] -z-10 rounded-md"></div>
                                    <div className="absolute top-0 left-3 w-1.5 h-3 bg-gray-800 rounded-full"></div>
                                    <div className="absolute top-0 right-3 w-1.5 h-3 bg-gray-800 rounded-full"></div>
                                </div>
                                <p className="text-xs font-semibold text-gray-500 max-w-[150px]">
                                    Select Date to see available slots
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableSlots.map(slot => {
                                    const isSelected = selectedSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={clsx(
                                                "w-full p-4 rounded-lg border-2 flex items-center justify-center transition-all",
                                                isSelected
                                                    ? "border-[#22c55e] bg-[#dcfce7] text-[#15803d]"
                                                    : "border-gray-50/50 bg-[#f9fafb] hover:bg-gray-100 text-gray-800"
                                            )}
                                        >
                                            <span className="text-xs font-black italic tracking-wide">{slot}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    disabled={!selectedDate || !selectedSlot || !standard || !students}
                    className="w-full py-3 rounded-lg bg-[#5356e3] text-white font-bold text-sm shadow-md hover:bg-[#4338ca] disabled:bg-[#9ca3af] disabled:hover:bg-[#9ca3af] disabled:cursor-not-allowed transition-colors disabled:shadow-none"
                    onClick={onSubmit}
                >
                    Submit Excursion Request
                </button>
            </div>
        </div>
    );
}
