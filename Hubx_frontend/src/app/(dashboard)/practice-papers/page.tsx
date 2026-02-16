
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { practicePaperService } from "@/services/practice-paper";
import { PracticePapersClient } from "@/components/practice-paper/PracticePapersClient";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * ASYNC CONTENT WRAPPER
 */
export default function PracticePapersPage() {
    return (
        <PracticePapersClient />
    );
}
