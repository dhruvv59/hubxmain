import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";


export function AIAssessmentBanner() {
    return (
        <Link href="/assessments">
            <div className="bg-white rounded-[24px] p-4 lg:p-5 flex flex-col justify-center relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors border-[2px] border-[#d8b4fe] shadow-[0_4px_20px_-10px_rgba(168,85,247,0.3)] h-[100px]">
                <div className="flex justify-between items-start mb-1 h-full">
                    <div className="flex flex-col justify-center">
                        <h3 className="text-base lg:text-lg font-black italic text-[#1f2937] leading-none">
                            AI SMART <Sparkles className="inline h-3 w-3 lg:h-4 lg:w-4 text-purple-500 mb-1 fill-purple-500" />
                        </h3>
                        <h3 className="text-base lg:text-lg font-black italic text-[#1f2937] leading-none">ASSESSMENT</h3>
                    </div>
                    <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center -mt-1 -mr-1 lg:-mr-2">
                        <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                    </div>
                </div>
            </div>
        </Link>
    );

}
