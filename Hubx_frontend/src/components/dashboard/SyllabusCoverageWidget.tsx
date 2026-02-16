
import React from 'react';
import { SyllabusData } from '@/types/dashboard';

interface SyllabusCoverageWidgetProps {
    data: SyllabusData[];
}

export function SyllabusCoverageWidget({ data }: SyllabusCoverageWidgetProps) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm h-full flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Syllabus Coverage</h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    Track Progress
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                {data.map((item, index) => {
                    const percentage = Math.round((item.completedChapters / item.totalChapters) * 100);

                    return (
                        <div key={index} className="space-y-2 group cursor-default">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color.replace('bg-', 'bg-opacity-100 ')}`} style={{ backgroundColor: item.hexColor }}></div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                        {item.subject}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 font-medium">
                                        <span className="text-gray-900 font-bold">{item.completedChapters}</span>/{item.totalChapters} Ch
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 relative overflow-hidden"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: item.hexColor,
                                        boxShadow: `0 2px 10px ${item.hexColor}40`
                                    }}
                                >
                                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent to-white/20"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
                <button className="w-full text-sm text-center text-gray-500 hover:text-blue-600 font-medium transition-colors py-1">
                    View Full Syllabus Plan
                </button>
            </div>
        </div>
    );
}
