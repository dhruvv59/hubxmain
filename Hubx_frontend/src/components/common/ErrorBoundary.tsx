"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Isolates component failures to prevent full page crashes
 * Senior-level error handling pattern
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to monitoring service (e.g., Sentry)
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI (maintains design consistency)
            // Check for Auth Expired specifically
            if (this.state.error instanceof Error) {
                if ((this.state.error as any).code === 'AUTH_EXPIRED' || (this.state.error as any).statusCode === 401) {
                    // Force redirect
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return <div className="text-center p-4">Redirecting to login...</div>;
                }
            }
            return (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                        {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            if (typeof window !== 'undefined') {
                                window.location.reload();
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Lightweight Error Fallback for smaller components
 * Use this when you want a minimal error state
 */
export function ErrorFallback({
    message = "Failed to load",
    onRetry
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
