"use client";

import React, { useState } from "react";
import { HelpCircle, X, Loader2, Check } from "lucide-react";
import { http } from "@/lib/http-client";
import { EXAM_ENDPOINTS } from "@/lib/api-config";

interface DoubtSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    attemptId: string;
    questionId: string;
    questionNumber: number;
}

export function DoubtSubmitModal({
    isOpen,
    onClose,
    attemptId,
    questionId,
    questionNumber,
}: DoubtSubmitModalProps) {
    const [doubtText, setDoubtText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!doubtText.trim()) {
            alert("Please describe your doubt");
            return;
        }

        setIsSubmitting(true);
        try {
            // Call backend API to submit doubt
            await http.post(
                EXAM_ENDPOINTS.raiseDoubt(attemptId, questionId),
                {
                    doubtText: doubtText.trim(),
                }
            );

            setIsSuccess(true);
            setDoubtText("");

            // Close modal after 2 seconds
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Failed to submit doubt:", error);
            alert(error?.message || "Failed to submit doubt. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Ask Teacher</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                {!isSuccess ? (
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-600">
                            Question {questionNumber}
                        </p>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Describe your doubt or question
                            </label>
                            <textarea
                                value={doubtText}
                                onChange={(e) => setDoubtText(e.target.value)}
                                placeholder="I'm confused about... Please explain..."
                                disabled={isSubmitting}
                                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <p className="text-xs text-gray-500">
                            Your teacher will review this and provide clarification. You can check their response in your doubts section.
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !doubtText.trim()}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Submit Doubt
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Success State */
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                            Doubt Submitted!
                        </h4>
                        <p className="text-sm text-gray-600">
                            Your teacher will review and respond soon. Continue with your exam.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
