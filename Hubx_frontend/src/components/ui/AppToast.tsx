"use client";

import React, { useEffect } from "react";
import { Check, XCircle, Info, AlertTriangle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface AppToastProps {
    message: string;
    variant?: ToastVariant;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const variants = {
    success: {
        bg: "bg-[#064e3b]",
        border: "border-[#059669]",
        iconBg: "bg-[#34d399]",
        iconColor: "text-[#064e3b]",
        title: "Success",
        Icon: Check,
    },
    error: {
        bg: "bg-[#7f1d1d]",
        border: "border-[#dc2626]",
        iconBg: "bg-[#fca5a5]",
        iconColor: "text-[#7f1d1d]",
        title: "Error",
        Icon: XCircle,
    },
    info: {
        bg: "bg-[#1e3a5f]",
        border: "border-[#2563eb]",
        iconBg: "bg-[#93c5fd]",
        iconColor: "text-[#1e3a5f]",
        title: "Info",
        Icon: Info,
    },
    warning: {
        bg: "bg-[#78350f]",
        border: "border-[#d97706]",
        iconBg: "bg-[#fcd34d]",
        iconColor: "text-[#78350f]",
        title: "Warning",
        Icon: AlertTriangle,
    },
};

export function AppToast({
    message,
    variant = "success",
    isVisible,
    onClose,
    duration = 3000,
}: AppToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    if (!isVisible) return null;

    const config = variants[variant];
    const Icon = config.Icon;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in duration-300">
            <div
                className={`${config.bg} text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-4 border ${config.border} min-w-[280px] max-w-[400px]`}
            >
                <div
                    className={`w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
                >
                    <Icon className={`w-5 h-5 ${config.iconColor} stroke-[2.5]`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">{config.title}</h4>
                    <p className="text-sm text-white/90 font-medium mt-0.5 break-words">{message}</p>
                </div>
            </div>
        </div>
    );
}
