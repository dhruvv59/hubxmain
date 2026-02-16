import Link from "next/link";
import { ChevronRight, Zap, Brain, Timer } from "lucide-react";

import { cn } from "@/lib/utils";
import { HubXTestRecommendation } from "@/types/dashboard";

interface HubXSmartTestsWidgetProps {
    tests: HubXTestRecommendation[];
}

export function HubXSmartTestsWidget({ tests }: HubXSmartTestsWidgetProps) {
    if (!tests || tests.length === 0) return null;

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col w-full">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Brain className="h-5 w-5" />
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-800">HubX Smart Assessment</h3>
                </div>
                <Link href="/assessments">
                    <button className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
                        View All Tests <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test) => (
                    <Link href={`/assessments/${test.id}`} key={test.id} className="block group">
                        <div className="relative bg-gray-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer h-full">
                            {/* Upper Details */}
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide",
                                    test.subject === 'Physics' ? "bg-red-100 text-red-700" :
                                        test.subject === 'Mathematics' ? "bg-blue-100 text-blue-700" :
                                            "bg-green-100 text-green-700"
                                )}>
                                    {test.subject}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    test.difficulty === 'Hard' ? "border-red-200 text-red-600 bg-red-50" :
                                        test.difficulty === 'Medium' ? "border-orange-200 text-orange-600 bg-orange-50" :
                                            "border-green-200 text-green-600 bg-green-50"
                                )}>
                                    {test.difficulty}
                                </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-[14px] font-bold text-gray-900 leading-snug mb-4 group-hover:text-indigo-700 transition-colors">
                                {test.title}
                            </h4>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 pt-3 border-t border-gray-200 group-hover:border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center"><Timer className="h-3 w-3 mr-1" /> {test.time}</span>
                                    <span className="flex items-center">Q: {test.questions}</span>
                                </div>

                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <ChevronRight className="h-3 w-3" />
                                </div>
                            </div>

                            {/* Tag for Type */}
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Zap className="h-3 w-3 fill-white" />
                                    {test.type}
                                </span>
                            </div>
                        </div>
                    </Link>

                ))}
            </div>
        </div>
    );
}
