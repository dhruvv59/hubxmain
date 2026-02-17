"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PrivatePapersClient } from "@/components/teacher/private-papers/PrivatePapersClient";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * PRIVATE PAPERS CLIENT PAGE
 * Made client component so API calls have access to token in localStorage
 */
export default function PrivatePapersPage() {
    return (
        <ErrorBoundary fallback={<ErrorFallback message="Failed to load private papers" />}>
            <Suspense
                fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#5b5bd6] animate-spin" />
                    </div>
                }
            >
                <PrivatePapersClient initialPapers={[]} initialTotal={0} />
            </Suspense>
        </ErrorBoundary>
    );
}
