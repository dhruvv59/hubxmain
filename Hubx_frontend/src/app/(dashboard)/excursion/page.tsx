
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { excursionService } from "@/services/excursionService";
import { ExcursionClient } from "@/components/excursion/ExcursionClient";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * ASYNC CONTENT WRAPPER
 */
async function ExcursionContainer() {
    // Fetch data on the server
    const excursions = await excursionService.getAll();
    return <ExcursionClient initialExcursions={excursions} />;
}

/**
 * EXCURSION SERVER PAGE
 */
export default function ExcursionPage() {
    return (
        <ErrorBoundary fallback={<ErrorFallback message="Failed to load excursions" />}>
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-gray-500 font-medium animate-pulse">Loading Excursions...</p>
                    </div>
                }
            >
                <ExcursionContainer />
            </Suspense>
        </ErrorBoundary>
    );
}
