"use client";

import React, { useEffect } from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: Check,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        textColor: "text-green-900",
        title: "Success"
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: X,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        textColor: "text-red-900",
        title: "Error"
    },
    warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: AlertCircle,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-900",
        title: "Warning"
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: Info,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-900",
        title: "Information"
    }
};

export function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const config = toastConfig[type];
    const IconComponent = config.icon;

    return (
        <div className="animate-slide-in-right">
            <div className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg",
                config.bg,
                config.border
            )}>
                <div className={cn("flex-shrink-0 w-5 h-5 mt-0.5", config.iconColor)}>
                    <IconComponent className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={cn("text-sm font-semibold", config.textColor)}>
                        {config.title}
                    </h4>
                    <p className={cn("text-sm mt-0.5 opacity-90", config.textColor)}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => onClose(id)}
                    className={cn(
                        "flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity",
                        config.textColor
                    )}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
