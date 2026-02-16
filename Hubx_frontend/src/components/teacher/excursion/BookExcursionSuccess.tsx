import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export function BookExcursionSuccess() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-white">
            {/* Success Icon */}
            <div className="mb-6 relative">
                {/* Outer Circle - lighter green */}
                <div className="w-24 h-24 rounded-full bg-[#dcfce7] flex items-center justify-center border border-[#86efac]">
                    {/* Inner Circle - darker green border */}
                    <div className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center shadow-sm">
                        <Check className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                </div>
            </div>

            {/* Success Text */}
            <h2 className="text-3xl font-bold text-[#10b981] mb-3 text-center">
                Excursion Request Submitted
            </h2>

            <div className="text-center font-medium text-gray-500 text-lg">
                <p>You can view request status</p>
                <Link
                    href="/teacher/excursion"
                    className="text-[#4338ca] font-bold underline hover:text-[#3730a3] transition-colors"
                >
                    Excursion
                </Link>
            </div>
        </div>
    );
}
