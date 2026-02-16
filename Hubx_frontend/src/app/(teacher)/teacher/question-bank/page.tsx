"use client";

import React from "react";
import { QuestionBankClient } from "@/components/teacher/question-bank/QuestionBankClient";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";

/**
 * QUESTION BANK PAGE
 * Now a Client Component to ensure authentication headers are sent correctly
 */
export default function QuestionBankPage({
    searchParams,
}: {
    searchParams: { draftId?: string };
}) {
    // We pass null for initial data and let QuestionBankClient fetch it on mount
    // This solves the issue where server-side fetching lacked the auth token
    return (
        <ErrorBoundary fallback={<ErrorFallback message="Failed to load question bank" />}>
            <QuestionBankClient initialConfig={null} initialQuestions={[]} />
        </ErrorBoundary>
    );
}
