"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

interface ResultData {
  attemptId: string;
  paperTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  answers: Array<{
    questionNumber: number;
    questionText: string;
    isCorrect: boolean;
    marksObtained: number;
    marks: number;
  }>;
  statistics: {
    byDifficulty: Record<string, { total: number; correct: number }>;
  };
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const token = localStorage.getItem("hubx_access_token");
        const response = await fetch(`${API_BASE_URL}/exam/${attemptId}/result`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data.data);
        }
      } catch (error) {
        console.error("Error loading result:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!result) {
    return <div className="p-6">Error loading results</div>;
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "text-green-600" };
    if (percentage >= 80) return { grade: "B", color: "text-blue-600" };
    if (percentage >= 70) return { grade: "C", color: "text-orange-600" };
    return { grade: "D", color: "text-red-600" };
  };

  const gradeInfo = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Score Card */}
        <div className="bg-white rounded-3xl p-12 shadow-xl mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.paperTitle}</h1>
          <p className="text-gray-500 mb-8">Exam Completed</p>

          <div className={`text-7xl font-bold ${gradeInfo.color} mb-4`}>
            {gradeInfo.grade}
          </div>

          <div className="text-5xl font-bold text-gray-900 mb-2">
            {result.score}/{result.totalMarks}
          </div>

          <div className="text-xl text-gray-600 mb-8">
            {result.percentage.toFixed(1)}% · {result.correctAnswers}/{result.totalQuestions} Correct
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(result.statistics.byDifficulty).map(([difficulty, stats]) => (
            <div key={difficulty} className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-2">{difficulty}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.correct}/{stats.total}
              </p>
            </div>
          ))}
        </div>

        {/* Answers Review */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Answer Review</h2>

          <div className="space-y-4">
            {result.answers.map((answer, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all ${answer.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-bold text-gray-900">
                        Q{answer.questionNumber}: {answer.questionText.substring(0, 60)}...
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {answer.marksObtained}/{answer.marks}
                    </p>
                    <p className="text-xs text-gray-500">marks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push("/practice-papers")}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Attempt Another Paper
          </button>
        </div>
      </div>
    </div>
  );
}
