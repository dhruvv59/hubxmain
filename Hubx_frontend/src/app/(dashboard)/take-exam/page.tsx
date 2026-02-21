"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-config";
import { Loader2, Play } from "lucide-react";
import { useToast } from "@/components/ui/ToastContainer";

interface Paper {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questionsCount: number;
  duration: number;
  averageScore: number;
}

export default function TakeExamPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingExam, setStartingExam] = useState<string | null>(null);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const token = localStorage.getItem("hubx_access_token");
        const response = await fetch(`${API_BASE_URL}/student/published-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPapers(data.data?.papers || []);
        }
      } catch (error) {
        console.error("Error loading papers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPapers();
  }, []);

  const handleStartExam = async (paperId: string) => {
    setStartingExam(paperId);
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/exam/start/${paperId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/exam/${data.data.attemptId}`);
      } else {
        const error = await response.json();
        addToast(`Error: ${error.message}`, "error");
        setStartingExam(null);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      addToast("Error starting exam", "error");
      setStartingExam(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Practice Papers</h1>
        <p className="text-gray-500 mt-1">Take exams and improve your skills</p>
      </div>

      {papers.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <p className="text-gray-600 font-medium">No papers available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{paper.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">Difficulty</p>
                  <p className="font-bold text-gray-900">{paper.difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-500">Questions</p>
                  <p className="font-bold text-gray-900">{paper.questionsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-bold text-gray-900">{paper.duration} mins</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Score</p>
                  <p className="font-bold text-gray-900">{paper.averageScore.toFixed(0)}%</p>
                </div>
              </div>

              <button
                onClick={() => handleStartExam(paper.id)}
                disabled={startingExam === paper.id}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {startingExam === paper.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
