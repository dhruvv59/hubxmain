"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

export default function StartExamPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;
    startExam();
  }, [paperId]);

  const startExam = async () => {
    try {
      // Get test settings from sessionStorage
      const settingsKey = `testSettings:${paperId}`;
      const settingsJson = sessionStorage.getItem(settingsKey);
      const testSettings = settingsJson ? JSON.parse(settingsJson) : {};

      // Remove settings from session storage after retrieval
      sessionStorage.removeItem(settingsKey);

      const token = localStorage.getItem("hubx_access_token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      // Call the startExam endpoint with test settings
      const response = await fetch(`${API_BASE_URL}/exam/start/${paperId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noTimeLimit: testSettings.noTimeLimit ?? false,
          showAnswerAfterWrong: testSettings.showAnswerAfterWrong ?? false,
          enableSolutionView: testSettings.enableSolutionView ?? false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start exam");
      }

      const data = await response.json();
      const attemptId = data.data?.attemptId;

      if (!attemptId) {
        throw new Error("No attempt ID returned from server");
      }

      // Navigate to the exam page
      router.push(`/exam/${attemptId}`);
    } catch (err: any) {
      console.error("Error starting exam:", err);
      setError(err.message || "Failed to start exam. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Start Exam</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/papers")}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Papers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Starting Exam...</h2>
        <p className="text-gray-600">Please wait while we prepare your exam.</p>
      </div>
    </div>
  );
}
