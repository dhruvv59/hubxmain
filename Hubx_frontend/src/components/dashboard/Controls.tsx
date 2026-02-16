import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";

export const TabButton = ({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-1.5 text-[11px] font-semibold rounded-full transition-colors border",
            active ? "border-[#c4b5fd] text-[#7c3aed] bg-[#f5f3ff]" : "bg-white text-gray-400 hover:text-gray-600 border-gray-200"
        )}>
        {children}
    </button>
);

interface DateSelectorProps {
    fromDate: string;
    toDate: string;
    onFromChange?: (date: string) => void;
    onToChange?: (date: string) => void;
}

export const DateSelector = ({ fromDate, toDate, onFromChange, onToChange }: DateSelectorProps) => {
    const fromInputRef = useRef<HTMLInputElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);

    // Helper to convert DD.MM.YYYY to YYYY-MM-DD for input
    const toInputFormat = (dateStr: string) => {
        try {
            const date = parse(dateStr, "dd.MM.yyyy", new Date());
            return isValid(date) ? format(date, "yyyy-MM-dd") : "";
        } catch (e) {
            return "";
        }
    };

    // Helper to convert input YYYY-MM-DD back to DD.MM.YYYY
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange?: (date: string) => void) => {
        try {
            const date = parse(e.target.value, "yyyy-MM-dd", new Date());
            if (isValid(date) && onChange) {
                onChange(format(date, "dd.MM.yyyy"));
            }
        } catch (e) {
            // Ignore invalid dates
        }
    };

    const handleTriggerClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
                // Fallback for browsers that don't support showPicker, though the absolute input should handle it
                ref.current.click();
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div
                className="relative flex items-center border border-gray-200 rounded-md bg-white overflow-hidden shadow-sm group hover:border-[#c4b5fd] transition-colors flex-1 min-w-[140px] cursor-pointer"
                onClick={() => handleTriggerClick(fromInputRef)}
            >
                <span className="text-[11px] text-gray-500 font-medium px-3 py-2 bg-gray-50 border-r border-gray-200 pointer-events-none">From</span>
                <div className="px-3 py-2 text-[12px] font-bold text-[#1f2937] flex items-center justify-between min-w-[100px] flex-1 pointer-events-none">
                    {fromDate} <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                </div>
                <input
                    ref={fromInputRef}
                    type="date"
                    className="absolute inset-0 z-10 opacity-0 cursor-pointer w-full h-full"
                    value={toInputFormat(fromDate)}
                    onChange={(e) => handleDateChange(e, onFromChange)}
                />
            </div>
            <div
                className="relative flex items-center border border-gray-200 rounded-md bg-white overflow-hidden shadow-sm group hover:border-[#c4b5fd] transition-colors flex-1 min-w-[140px] cursor-pointer"
                onClick={() => handleTriggerClick(toInputRef)}
            >
                <span className="text-[11px] text-gray-500 font-medium px-3 py-2 bg-gray-50 border-r border-gray-200 pointer-events-none">To</span>
                <div className="px-3 py-2 text-[12px] font-bold text-[#1f2937] flex items-center justify-between min-w-[100px] flex-1 pointer-events-none">
                    {toDate} <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                </div>
                <input
                    ref={toInputRef}
                    type="date"
                    className="absolute inset-0 z-10 opacity-0 cursor-pointer w-full h-full"
                    value={toInputFormat(toDate)}
                    onChange={(e) => handleDateChange(e, onToChange)}
                />
            </div>
        </div>
    );
};
