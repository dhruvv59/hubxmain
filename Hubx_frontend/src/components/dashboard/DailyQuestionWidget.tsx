"use client";

import React from "react";
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyQuestionData } from "@/types/dashboard";

interface DailyQuestionWidgetProps {
    data: DailyQuestionData;
}

export function DailyQuestionWidget({ data }: DailyQuestionWidgetProps) {
    const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = () => {
        if (selectedOption !== null) {
            setIsSubmitted(true);
        }
    };

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-[150px] w-[150px] bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Daily Challenge</span>
                    <h3 className="text-base font-bold text-gray-900">{data.subject}</h3>
                </div>
            </div>

            <div className="flex-1 relative z-10">
                <p className="text-sm font-semibold text-gray-800 mb-5 leading-relaxed">{data.question}</p>

                <div className="space-y-3">
                    {data.options.map((option, index) => {
                        let buttonStyle = "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700";
                        let icon = null;

                        if (isSubmitted) {
                            if (index === data.correctAnswer) {
                                buttonStyle = "bg-green-50 border-green-200 text-green-700 font-medium";
                                icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
                            } else if (selectedOption === index) {
                                buttonStyle = "bg-red-50 border-red-200 text-red-700 font-medium";
                                icon = <XCircle className="h-4 w-4 text-red-600" />;
                            } else {
                                buttonStyle = "opacity-50 border-gray-100 bg-gray-50";
                            }
                        } else if (selectedOption === index) {
                            buttonStyle = "border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-500";
                        }

                        return (
                            <button
                                key={index}
                                disabled={isSubmitted}
                                onClick={() => setSelectedOption(index)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl border text-[13px] transition-all flex justify-between items-center group/btn",
                                    buttonStyle
                                )}
                            >
                                <span className="flex items-center gap-3">
                                    <span className={cn(
                                        "h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-bold",
                                        isSubmitted && index === data.correctAnswer ? "bg-green-200 border-green-300 text-green-800" :
                                            selectedOption === index && !isSubmitted ? "bg-blue-500 border-blue-500 text-white" :
                                                "border-gray-300 text-gray-500 group-hover/btn:border-gray-400"
                                    )}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </span>
                                {icon}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!isSubmitted && (
                <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="w-full mt-6 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                >
                    Submit Answer
                </button>
            )}

            {isSubmitted && (
                <div className="mt-6 text-center animate-in fade-in zoom-in duration-300">
                    <p className={cn("text-xs font-bold", selectedOption === data.correctAnswer ? "text-green-600" : "text-gray-500")}>
                        {selectedOption === data.correctAnswer ? "🎉 Correct! Well done." : "Pass it on! The correct answer is option " + String.fromCharCode(65 + data.correctAnswer)}
                    </p>
                </div>
            )}
        </div>
    );
}
