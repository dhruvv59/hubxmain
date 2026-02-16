import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusArea } from "@/types/dashboard";

interface FocusAreaWidgetProps {
    focusAreas: FocusArea[];
}

export function FocusAreaWidget({ focusAreas }: FocusAreaWidgetProps) {
    return (
        <div className="bg-[#f3f4f6] rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 bg-[#eef2ff] py-2 px-3 rounded-lg">
                <h3 className="text-[13px] font-bold text-[#1f2937]">AI Recommended Focus Area</h3>
                <ChevronRight className="h-4 w-4 text-gray-500" />
            </div>

            <div className="space-y-4">
                {focusAreas.map((area) => (
                    <div key={area.id}>
                        <p className="text-[11px] text-gray-500 mb-0.5">{area.subject}</p>
                        <p className="text-[12px] font-bold text-gray-900 leading-tight">
                            {area.topic} <span className={cn("font-normal text-[11px]", area.scoreColorClass)}>- Last Score {area.score}</span>
                        </p>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-[11px] font-bold text-[#1f2937] border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                View All
            </button>
        </div>
    );
}
