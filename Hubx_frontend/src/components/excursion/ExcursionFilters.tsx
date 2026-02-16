import React from "react";
import { cn } from "@/lib/utils";

const SidebarFilterItem = ({ label, count, active, onClick }: { label: string, count?: number, active?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className="flex items-center gap-3 py-2 cursor-pointer group">
        <div className={cn("w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors", active && "border-indigo-600")}>
            {active && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
        </div>
        <span className={cn("text-gray-600 text-sm font-medium group-hover:text-indigo-600 transition-colors", active && "text-indigo-900")}>{label}</span>
    </div>
);

export interface FilterState {
    status: string;
    type: string;
}

interface ExcursionFiltersProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
}

export function ExcursionFilters({ filters = { status: "All", type: "All" }, onFilterChange }: ExcursionFiltersProps) {
    const handleStatusChange = (val: string) => onFilterChange?.("status", val);
    const handleTypeChange = (val: string) => onFilterChange?.("type", val);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Status</h3>
                <div className="space-y-1">
                    {["All", "Approved", "Pending", "High Demand", "Voting"].map((status) => (
                        <SidebarFilterItem
                            key={status}
                            label={status}
                            active={filters.status === status}
                            onClick={() => handleStatusChange(status)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Company Type</h3>
                <div className="space-y-1">
                    {["All", "Software Company", "Renewable Energy", "Biotechnology", "Automotive", "Finance", "Aerospace"].map((type) => (
                        <SidebarFilterItem
                            key={type}
                            label={type}
                            active={filters.type === type}
                            onClick={() => handleTypeChange(type)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
