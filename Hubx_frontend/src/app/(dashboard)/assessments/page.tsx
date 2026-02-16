
import React, { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
// ... imports
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * SERVER COMPONENT PAGE
 */
export default function SmartAssessmentPage() {
    return (
        <div className="min-h-screen bg-[#fafbfc] p-3 md:p-6 lg:p-8 space-y-5 md:space-y-8 font-sans">
            {/* Header - Renders Immediately */}
            <div className="flex items-center space-x-3 md:space-x-4 mb-2">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">AI Smart Assessment</h1>
            </div>

            <ErrorBoundary fallback={<ErrorFallback message="Failed to load assessment configuration" />}>
                <AssessmentForm />
            </ErrorBoundary>
        </div>
    );
}
