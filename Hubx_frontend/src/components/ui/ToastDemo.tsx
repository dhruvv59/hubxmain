"use client";

import React from "react";
import { useToast } from "./ToastContainer";

/**
 * Demo component to showcase all toast notification types
 * Remove this file in production - it's only for demonstration
 */
export function ToastDemo() {
    const { addToast } = useToast();

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Toast Notifications Demo</h2>
                <p className="text-gray-600 mb-6">Click buttons below to see toast notifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Success Toast */}
                <button
                    onClick={() => addToast("Profile updated successfully!", "success")}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                    Show Success Toast
                </button>

                {/* Error Toast */}
                <button
                    onClick={() => addToast("Failed to save profile. Please try again.", "error")}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                    Show Error Toast
                </button>

                {/* Warning Toast */}
                <button
                    onClick={() => addToast("This paper is already published!", "warning")}
                    className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
                >
                    Show Warning Toast
                </button>

                {/* Info Toast */}
                <button
                    onClick={() => addToast("Please select or enter an answer", "info")}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Show Info Toast
                </button>
            </div>

            {/* Multiple Toasts */}
            <button
                onClick={() => {
                    addToast("First toast", "success");
                    setTimeout(() => addToast("Second toast", "info"), 200);
                    setTimeout(() => addToast("Third toast", "warning"), 400);
                }}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
                Show Multiple Toasts
            </button>
        </div>
    );
}
