"use client";

import React, { useState } from "react";
import { Search, MapPin, Clock, Users, BarChart3, ChevronRight, CheckCircle2, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExcursionHero } from "@/components/excursion/ExcursionHero";
import { ExcursionFilters, FilterState } from "@/components/excursion/ExcursionFilters";
import { MobileFilterSidebar } from "@/components/excursion/MobileFilterSidebar";
import { Excursion } from "@/types/excursion";

interface ExcursionClientProps {
    initialExcursions: Excursion[];
}

export function ExcursionClient({ initialExcursions }: ExcursionClientProps) {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        status: "All",
        type: "All"
    });

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Helper to map Excursion object to status string for filtering
    const getStatusString = (item: Excursion): string => {
        if (item.isApproved) return "Approved";
        if (item.statusType === "consent") return "Pending";
        if (item.highDemand) return "High Demand";
        return "Voting";
    };

    const filteredExcursions = initialExcursions.filter(item => {
        const itemStatus = getStatusString(item);
        const matchesStatus = filters.status === "All" || itemStatus === filters.status;
        const matchesType = filters.type === "All" || item.industry === filters.type;
        return matchesStatus && matchesType;
    });

    return (
        <div className="min-h-screen bg-[#fafafa] p-6 font-sans">
            <MobileFilterSidebar
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Link href="/dashboard" className="flex items-center gap-1 hover:text-gray-600 cursor-pointer transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                </div>
                <ExcursionHero />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters - Desktop Only */}
                <div className="hidden md:block w-64 flex-shrink-0 space-y-8">
                    <ExcursionFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Search Bar and Mobile Filter Button */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Industries, Companies or Locations"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                            />
                        </div>
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="md:hidden px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cards */}
                    <div className="space-y-6">
                        {filteredExcursions.map((item) => {
                            const status = getStatusString(item);

                            return (
                                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                                    {/* Header Row */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            {/* Logo Render Logic */}
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold overflow-hidden bg-gray-50 border border-gray-100")}>
                                                {item.logoUrl ? (
                                                    <img src={item.logoUrl} alt={item.companyName} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <span className="text-gray-400">{item.companyName.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.companyName}</h3>
                                                <p className="text-sm text-gray-500">{item.industry}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {/* Status Badge Logic */}
                                            {status === "Approved" && (
                                                <div className="flex items-center gap-2">
                                                    {item.dateBadge && <span className="text-xs font-semibold text-gray-600">{item.dateBadge}</span>}
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">Approved</span>
                                                </div>
                                            )}
                                            {status === "Pending" && (
                                                <div className="flex items-center gap-2">
                                                    {item.dateBadge && <span className="text-xs font-semibold text-gray-600">{item.dateBadge}</span>}
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                </div>
                                            )}
                                            {status === "High Demand" && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-emerald-500">High Demand - Ready to Book</span>
                                                </div>
                                            )}
                                            {status === "Voting" && item.statusLabel && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-gray-500">{item.statusLabel}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar for Voting/Interest */}
                                    {(status === "High Demand" || status === "Voting") && (
                                        <div className="mb-6">
                                            <div className="flex justify-between text-xs mb-1 font-semibold">
                                                <span>Student Interest - {item.statusValue}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-gradient-to-r from-orange-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${item.statusValue}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap items-center gap-6 mb-4 text-xs font-medium text-gray-600">
                                        <div className="flex items-center gap-1"><span className="text-orange-400">★</span> {item.rating}</div>
                                        <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {item.duration}</div>
                                        <div className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" /> Max {item.maxStudents} Students</div>
                                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {item.visits} Visits</div>
                                        <div className="flex items-center gap-1"><BarChart3 className="w-4 h-4 text-gray-400" /> {item.votes} Votes</div>
                                        <div className="flex items-center gap-1 ml-auto"><MapPin className="w-4 h-4 text-gray-400" /> {item.location}</div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                        {item.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-100 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3">
                                        <button suppressHydrationWarning className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                                            View Details
                                        </button>
                                        {item.showConsentButton && (
                                            <Link href={`/excursion/${item.id}/consent`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                                View Consent Form
                                            </Link>
                                        )}
                                        {item.companyName === "Google" && (
                                            <button suppressHydrationWarning className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><CheckCircle2 className="w-5 h-5 text-gray-400" /></button>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 pt-8">
                        <span className="text-sm text-gray-400 mr-2">Prev</span>
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                            <button suppressHydrationWarning key={num} className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors", num === 1 ? "bg-indigo-100 text-indigo-600" : "text-gray-500 hover:bg-gray-100")}>
                                {num}
                            </button>
                        ))}
                        <span className="text-sm text-indigo-600 font-medium ml-2 cursor-pointer">Next</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
