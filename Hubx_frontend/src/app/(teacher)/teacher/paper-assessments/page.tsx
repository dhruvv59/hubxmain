
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getPrivatePapers } from "@/services/private-paper-service";
import { PrivatePapersClient } from "@/components/teacher/private-papers/PrivatePapersClient";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * ASYNC CONTENT WRAPPER
 */
async function PrivatePapersContainer() {
    // Initial fetch with default filters
    const data = await getPrivatePapers({
        subject: "All",
        std: "All",
        difficulty: "All",
        search: "",
        sortBy: "Most Recent",
        page: 1,
        limit: 9
    });

    return <PrivatePapersClient initialPapers={data.papers} initialTotal={data.total} />;
}

/**
 * PRIVATE PAPERS SERVER PAGE
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
                <PrivatePapersContainer />
            </Suspense>
        </ErrorBoundary>
    );
}
