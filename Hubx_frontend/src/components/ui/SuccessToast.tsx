"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export function SuccessToast({ message, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100] animate-slide-up-fade">
            <div className="bg-[#064e3b] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-[#059669]">
                <div className="w-8 h-8 rounded-full bg-[#34d399] flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-[#064e3b] stroke-[3px]" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">Success</h4>
                    <p className="text-xs text-green-100 font-medium">{message}</p>
                </div>
            </div>
        </div>
    );
}
