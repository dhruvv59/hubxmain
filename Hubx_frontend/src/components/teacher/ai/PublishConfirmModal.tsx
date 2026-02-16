"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface PublishConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPublishing?: boolean;
}

export function PublishConfirmModal({ isOpen, onClose, onConfirm, isPublishing }: PublishConfirmModalProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                {/* Backdrop */}
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />

                {/* Content */}
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-white rounded-2xl p-8 shadow-xl z-50 animate-scale-in focus:outline-none">
                    <DialogPrimitive.Title className="text-2xl font-bold text-gray-900 mb-6">
                        Confirm Publication !
                    </DialogPrimitive.Title>

                    <div className="border-t border-gray-100 pt-6 mb-8">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-[#ef4444] shrink-0 fill-red-50" />
                            <p className="text-[#ef4444] text-base leading-relaxed">
                                Once published, this question paper cannot be edited or undone. Are you sure you want to continue?
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={onClose}
                            disabled={isPublishing}
                            className="w-[180px] h-11 rounded-lg border border-[#4f46e5] text-[#4f46e5] font-bold text-sm hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPublishing}
                            className="w-[180px] h-11 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isPublishing ? "Publishing..." : "Confirm & Publish"}
                        </button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
