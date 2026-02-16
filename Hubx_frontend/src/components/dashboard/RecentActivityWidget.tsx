import Link from "next/link";
import { ChevronRight, Clock, Award, FileText, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { RecentActivityItem } from "@/types/dashboard";

interface RecentActivityWidgetProps {
    activities: RecentActivityItem[];
}

export function RecentActivityWidget({ activities = [] }: RecentActivityWidgetProps) {

    const getIcon = (action: string) => {
        if (!action) return <FileText className="h-4 w-4 text-blue-600" />;
        if (action.includes("Test") || action.includes("Quiz")) return <Award className="h-4 w-4 text-purple-600" />;
        if (action.includes("Practice")) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        return <FileText className="h-4 w-4 text-blue-600" />;
    };


    const getBgColor = (action: string) => {
        if (action.includes("Test") || action.includes("Quiz")) return "bg-purple-50";
        if (action.includes("Practice")) return "bg-green-50";
        return "bg-blue-50";
    };

    return (
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[14px] font-bold text-gray-800">Recent History</h3>
                <Link href="/papers">
                    <button className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 flex items-center">
                        View All <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                </Link>

            </div>

            <div className="space-y-4">
                {activities?.map((item) => (

                    <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", getBgColor(item.action))}>
                            {getIcon(item.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-[13px] font-bold text-gray-900 truncate pr-2">{item.target}</p>
                                {item.score && (
                                    <span className={cn(
                                        "text-[11px] font-bold px-1.5 py-0.5 rounded",
                                        item.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {item.score}%
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium mb-1">{item.action} • {item.subject}</p>
                            <p className="text-[10px] text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {item.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/papers" className="block w-full">
                <button className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-xl text-[12px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors flex items-center justify-center">
                    + Start New Practice
                </button>
            </Link>

        </div>
    );
}
