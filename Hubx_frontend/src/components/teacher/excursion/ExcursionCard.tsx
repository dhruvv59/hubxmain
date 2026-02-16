import React from "react";
import { Star, Clock, Users, MapPin, TrendingUp, Eye } from "lucide-react";
import { Excursion } from "@/types/excursion";

export interface ExcursionCardProps extends Excursion {
    onBook?: () => void;
    onSendConsent?: () => void;
}

export function ExcursionCard({
    companyName,
    industry,
    logoUrl,
    dateBadge,
    rating,
    duration,
    maxStudents,
    visits,
    votes,
    location,
    description,
    tags,
    statusType,
    statusValue,
    statusTotal,
    statusLabel,
    highDemand,
    isApproved,
    onBook,
    onSendConsent
}: ExcursionCardProps) {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 sm:gap-0">
                <div className="flex gap-4 w-full sm:w-auto">
                    {/* Logo Placeholder */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        {/* Replace with actual Image component when URLs are real */}
                        {logoUrl.startsWith("/") || logoUrl.startsWith("http") ? (
                            <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-xl font-bold text-gray-400">{companyName[0]}</div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{companyName}</h3>
                        <p className="text-sm text-gray-500">{industry}</p>
                    </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    {dateBadge && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f3e8ff] text-[#9333ea]">
                            {/* Calendar Icon could go here */}
                            📅 {dateBadge}
                        </span>
                    )}
                    {highDemand && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#22c55e] bg-[#dcfce7] px-2 py-0.5 rounded whitespace-nowrap">
                                High Demand - Ready to Book
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    <span>{rating}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{duration}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Max {maxStudents} Students</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{visits} Visits</span>
                </div>
                <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{votes} Votes</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="h-px bg-gray-100 mb-4" />

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
                {/* Progress Section */}
                <div className="flex-1 max-w-full sm:max-w-md">
                    {statusType === "consent" ? (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-700 italic">
                                    CONSENT FORM RECEIVED - {statusValue}/{statusTotal}
                                </span>
                                <span className="text-xs font-bold text-gray-900">
                                    {Math.round((statusValue / (statusTotal || 1)) * 100)}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#a3e635] rounded-full"
                                    style={{ width: `${(statusValue / (statusTotal || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                    Student Interest - {statusValue}%
                                </span>
                                {statusLabel && (
                                    <span className="text-[10px] text-gray-400">
                                        {statusLabel}
                                    </span>
                                )}
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${statusValue < 30 ? "bg-orange-400" : "bg-[#a3e635]"}`}
                                    style={{ width: `${statusValue}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        suppressHydrationWarning={true}
                    >
                        View Details
                    </button>
                    {isApproved ? (
                        <button
                            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[#bbf7d0] text-[#166534] text-sm font-bold cursor-default"
                            suppressHydrationWarning={true}
                        >
                            Approved
                        </button>
                    ) : (
                        <button
                            onClick={onBook}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-[#4f46e5] text-white text-sm font-semibold hover:bg-[#4338ca] shadow-sm shadow-indigo-200 transition-colors"
                            suppressHydrationWarning={true}
                        >
                            Book
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
