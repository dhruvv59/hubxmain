import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StatCardData } from "@/types/dashboard";

interface StatCardProps {
    data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
    const { title, value, subtext, trend, gradient, isCustomGradient } = data;

    return (
        <div
            className={cn("rounded-[24px] p-4 md:p-6 relative min-h-[140px] md:h-[180px] flex flex-col justify-between shadow-sm transition-transform hover:scale-[1.02]", !isCustomGradient && gradient)}
            style={isCustomGradient ? { background: gradient } : {}}
        >
            <div className="flex justify-between items-start">
                <p className="text-[9px] md:text-[11px] font-semibold tracking-widest text-[#6b7280] uppercase opacity-90">{title}</p>
            </div>

            <div>
                <h3 className="text-[28px] md:text-[52px] font-medium text-[#111827] leading-none tracking-tight break-words">
                    {value}<span className="text-[16px] md:text-[28px] ml-1 align-top font-medium">{subtext}</span>
                </h3>

                <div className="flex items-center space-x-2 mt-2">
                    {trend && (
                        <span className="text-xs md:text-sm font-semibold flex items-center">
                            <span className={cn("mr-1", trend.color ? trend.color : (trend.isUp ? "text-green-600" : "text-red-500"))}>
                                {trend.isUp ? "▲" : "▼"}
                            </span>
                            <span className="text-black">
                                {trend.value.replace(/^[▲▼]/, '')}
                            </span>
                        </span>
                    )}
                </div>
            </div>

            <div className="absolute right-3 bottom-3 md:right-5 md:bottom-5">
                <div role="button" aria-label="View Details" className="h-7 w-7 md:h-10 md:w-10 rounded-full border border-black/5 bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors backdrop-blur-sm">
                    <ChevronRight className="h-3 w-3 md:h-5 md:w-5 text-gray-700" />
                </div>
            </div>
        </div>
    );
}
