"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

interface Question {
  id: string;
  questionText: string;
  type: string;
  marks: number;
  difficulty: string;
  options?: string[];
  questionNumber: number;
  totalQuestions: number;
}

interface ExamData {
  attempt: {
    id: string;
    paperId: string;
    status: string;
    startedAt: string;
  };
  paper: {
    title: string;
    duration: number;
  };
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const loadExamData = async () => {
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/exam/${attemptId}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExamData(data.data);
        loadQuestion(0);
      }
    } catch (error) {
      console.error("Error loading exam:", error);
      alert("Error loading exam");
    }
  };

  const loadQuestion = async (index: number) => {
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(
        `${API_BASE_URL}/exam/${attemptId}/question?questionIndex=${index}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion(data.data);
        setQuestionIndex(index);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error("Error loading question:", error);
    }
  };

  const saveAnswer = async () => {
    if (selectedAnswer === null) {
      alert("Please select or enter an answer");
      return;
    }

    try {
      const token = localStorage.getItem("hubx_access_token");
      await fetch(
        `${API_BASE_URL}/exam/${attemptId}/answer/${currentQuestion?.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedOptionIndex: currentQuestion?.type === "MCQ" ? selectedAnswer : undefined,
            answerText: currentQuestion?.type !== "MCQ" ? selectedAnswer : undefined,
          }),
        }
      );

      setAnswers({ ...answers, [currentQuestion?.id || ""]: selectedAnswer });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleNext = async () => {
    if (currentQuestion && questionIndex < currentQuestion.totalQuestions - 1) {
      await saveAnswer();
      await loadQuestion(questionIndex + 1);
    }
  };

  const handlePrevious = async () => {
    if (questionIndex > 0) {
      await saveAnswer();
      await loadQuestion(questionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Submit exam? You cannot change answers after submission.")) return;

    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/exam/${attemptId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        alert("Exam submitted successfully!");
        router.push(`/exam/${attemptId}/result`);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Error submitting exam");
    }
  };

  useEffect(() => {
    loadExamData();
  }, [attemptId]);

  if (isLoading || !examData || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{examData.paper.title}</h1>
            <p className="text-sm text-gray-500">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 pb-32">
        {/* Question */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex-1">{currentQuestion.questionText}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 ml-4">
              {currentQuestion.marks} marks
            </span>
          </div>

          {/* Answer Section */}
          <div className="mt-8">
            {currentQuestion.type === "MCQ" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name="option"
                      value={idx}
                      checked={selectedAnswer === idx}
                      onChange={() => setSelectedAnswer(idx)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "TEXT" && (
              <textarea
                value={selectedAnswer as string || ""}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handlePrevious}
            disabled={questionIndex === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            onClick={saveAnswer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Answer
          </button>

          <button
            onClick={handleNext}
            disabled={questionIndex === currentQuestion.totalQuestions - 1}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
