"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PublishSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PublishSuccessModal({ isOpen, onClose }: PublishSuccessModalProps) {
    const router = useRouter();

    const handleViewPapers = () => {
        // Navigate to published papers list
        router.push("/teacher/published-papers");
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                {/* Backdrop */}
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />

                {/* Content */}
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-white rounded-2xl p-10 shadow-xl z-50 animate-scale-in focus:outline-none flex flex-col items-center justify-center text-center">

                    {/* Icon Circle */}
                    <div className="w-24 h-24 rounded-full bg-[#ecfdf5] border-2 border-[#10b981] flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-[#10b981] stroke-[3px]" />
                    </div>

                    <DialogPrimitive.Title className="text-2xl font-bold text-[#10b981] mb-4">
                        Published Successfully
                    </DialogPrimitive.Title>

                    <div className="text-gray-600 text-lg font-medium leading-relaxed mb-2">
                        You can view the paper in
                    </div>

                    <button
                        onClick={handleViewPapers}
                        className="text-[#4338ca] font-bold text-lg underline hover:text-[#3730a3] transition-colors decoration-2 underline-offset-4"
                    >
                        Published Papers
                    </button>

                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
