import React from "react";

interface ExcursionSummaryProps {
    companyName: string;
    companyType: string;
    standard: string;
    students: string;
    date: Date | undefined;
    timeSlot: string;
}

export function ExcursionSummary({
    companyName,
    companyType,
    standard,
    students,
    date,
    timeSlot,
}: ExcursionSummaryProps) {
    const formatDate = (date: Date | undefined) => {
        if (!date) return "-";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const displayDateTime = () => {
        if (!date && !timeSlot) return "-";
        const d = formatDate(date);
        const t = timeSlot || "";
        return `${d} ${t}`.trim();
    };

    return (
        <div className="bg-white rounded-2xl border border-[#f3e8ff] p-6 shadow-sm h-fit w-full sticky top-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Excursion Summary</h3>

            <div className="space-y-6">
                <div>
                    <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1">
                        COMPANY NAME
                    </p>
                    <p className="text-sm font-bold text-gray-900">{companyName || "-"}</p>
                </div>
                <div className="h-px bg-gray-100" />

                <div>
                    <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1">
                        COMPANY TYPE
                    </p>
                    <p className="text-sm font-bold text-gray-900">{companyType || "-"}</p>
                </div>
                <div className="h-px bg-gray-100" />

                <div>
                    <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1">
                        STANDARD
                    </p>
                    <p className="text-sm font-bold text-gray-900">{standard || "-"}</p>
                </div>
                <div className="h-px bg-gray-100" />

                <div>
                    <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1">
                        NO OF STUDENTS
                    </p>
                    <p className="text-sm font-bold text-gray-900">{students || "-"}</p>
                </div>
                <div className="h-px bg-gray-100" />

                <div>
                    <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider mb-1">
                        DATE AND TIME
                    </p>
                    <p className="text-sm font-bold text-gray-900">{displayDateTime()}</p>
                </div>
            </div>
        </div>
    );
}
