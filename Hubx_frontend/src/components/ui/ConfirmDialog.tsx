"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantStyles = {
        danger: {
            icon: "text-red-600 bg-red-50",
            button: "bg-red-600 hover:bg-red-700 text-white",
        },
        warning: {
            icon: "text-amber-600 bg-amber-50",
            button: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        info: {
            icon: "text-blue-600 bg-blue-50",
            button: "bg-indigo-600 hover:bg-indigo-700 text-white",
        },
    };

    const styles = variantStyles[variant];

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-2xl p-6 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 focus:outline-none">
                    <div className="flex items-start gap-4">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${styles.icon}`}
                        >
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
                                {title}
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-600 leading-relaxed">
                                {message}
                            </Dialog.Description>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${styles.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
