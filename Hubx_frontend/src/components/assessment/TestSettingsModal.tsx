"use client";

import React, { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (settings: any) => void;
}

export function TestSettingsModal({ isOpen, onClose, onStart }: TestSettingsModalProps) {
    const [settings, setSettings] = useState({
        noTimeLimit: false,
        showAnswers: true,
        solutionView: true
    });

    if (!isOpen) return null;

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[600px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Test Setting</h2>

                <div className="space-y-6">
                    {/* Option 1 */}
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => toggle('noTimeLimit')}>
                        <div className={cn(
                            "h-6 w-6 rounded border flex items-center justify-center transition-colors",
                            settings.noTimeLimit ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-200"
                        )}>
                            {settings.noTimeLimit && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Enable No time limit for test</span>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Option 2 */}
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => toggle('showAnswers')}>
                        <div className={cn(
                            "h-6 w-6 rounded border flex items-center justify-center transition-colors",
                            settings.showAnswers ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-200"
                        )}>
                            {settings.showAnswers && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Show the correct answer & explanation after a wrong answer</span>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Option 3 */}
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => toggle('solutionView')}>
                        <div className={cn(
                            "h-6 w-6 rounded border flex items-center justify-center transition-colors",
                            settings.solutionView ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-200"
                        )}>
                            {settings.solutionView && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Enable in-test solution view</span>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Warning */}
                    <div className="flex items-center space-x-2 text-[#ff5757] mt-4">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">You won’t be able to modify settings during the test.</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => onStart(settings)}
                        className="px-10 py-3 rounded-xl bg-[#5b5bd6] text-white font-bold text-lg hover:bg-[#4f4fbe] transition-colors shadow-lg shadow-indigo-200"
                    >
                        Confirm & Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}
