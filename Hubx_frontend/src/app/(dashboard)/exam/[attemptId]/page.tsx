"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, HelpCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { DoubtSubmitModal } from "@/components/exam/DoubtSubmitModal";
import { useToast } from "@/components/ui/ToastContainer";

interface Question {
  id: string;
  questionText: string;
  type: string;
  marks: number;
  difficulty: string;
  options?: string[];
  questionNumber: number;
  totalQuestions: number;
  questionImage?: string;
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
  timeRemaining?: number | null;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const { addToast } = useToast();

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const hasAutoSubmitted = useRef(false);

  const loadExamData = async () => {
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/exam/${attemptId}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const d = data.data;
        setExamData(d);
        const remaining = d.timeRemaining ?? (d.paper?.duration ? d.paper.duration * 60 : null);
        setTimeLeft(remaining);
        loadQuestion(0);
      }
    } catch (error) {
      console.error("Error loading exam:", error);
      addToast("Failed to load exam. Please try again.", "error");
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
        const q = data.data;
        const saved = q.studentAnswer;
        const initial = saved?.selectedOption ?? saved?.answerText ?? answers[q.id] ?? null;
        setCurrentQuestion(q);
        setQuestionIndex(index);
        setSelectedAnswer(initial);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading question:", error);
      setIsLoading(false);
    }
  };

  const saveAnswer = async () => {
    if (selectedAnswer === null || selectedAnswer === "") {
      addToast("Please select or enter an answer", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("hubx_access_token");

      // For FILL_IN_THE_BLANKS, check if it has options
      let isFillInWithOptions = false;
      if (currentQuestion?.type === "FILL_IN_THE_BLANKS") {
        const options = typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options;
        isFillInWithOptions = Array.isArray(options) && options.length > 0;
      }

      // Prepare answer payload
      const answerPayload = {
        selectedOption: (currentQuestion?.type === "MCQ" || isFillInWithOptions) ? selectedAnswer : undefined,
        answerText: (currentQuestion?.type === "TEXT" || (currentQuestion?.type === "FILL_IN_THE_BLANKS" && !isFillInWithOptions)) ? selectedAnswer : undefined,
      };

      // Debug logging
      console.log("📝 Saving Answer", {
        questionType: currentQuestion?.type,
        selectedAnswer: selectedAnswer,
        isFillInWithOptions: isFillInWithOptions,
        payload: answerPayload,
        questionId: currentQuestion?.id,
      });

      const response = await fetch(
        `${API_BASE_URL}/exam/${attemptId}/answer/${currentQuestion?.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answerPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Answer saved successfully:", data);
        setAnswers({ ...answers, [currentQuestion?.id || ""]: selectedAnswer });
      } else {
        const error = await response.json();
        console.error("❌ Error saving answer:", error);
        addToast("Failed to save answer: " + (error.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("❌ Error saving answer:", error);
      addToast("Failed to save answer", "error");
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

  const doSubmit = async (skipConfirm = false) => {
    if (!skipConfirm && !confirm("Submit exam? You cannot change answers after submission.")) return;

    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/exam/${attemptId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        addToast(skipConfirm ? "Time's up! Exam auto-submitted." : "Exam submitted successfully!", "success");
        router.push(`/exam/${attemptId}/result`);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      addToast("Failed to submit exam", "error");
    }
  };

  const handleSubmit = () => doSubmit(false);

  useEffect(() => {
    loadExamData();
  }, [attemptId]);

  // Timer countdown and auto-submit when time expires
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev === null || prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && examData && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      doSubmit(true);
    }
  }, [timeLeft, examData]);

  if (isLoading || !examData || !examData.paper || !currentQuestion) {
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
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                <Clock className={`h-4 w-4 ${timeLeft < 300 ? "animate-pulse" : ""}`} />
                <span className="font-mono font-bold">
                  {Math.floor(timeLeft / 3600)}:{(Math.floor(timeLeft / 60) % 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 pb-32">
        {/* Question */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          {currentQuestion.questionImage && (
            <div className="mb-6">
              <img
                src={currentQuestion.questionImage}
                alt="Question Image"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex-1">{currentQuestion.questionText}</h2>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setIsDoubtModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Ask Teacher
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                {currentQuestion.marks} marks
              </span>
            </div>
          </div>

          {/* Answer Section */}
          <div className="mt-8">
            {/* Debug: Log question type with detailed info */}
            {typeof window !== 'undefined' && (() => {
              const typeStr = String(currentQuestion.type).trim();
              const isMCQ = typeStr === "MCQ";
              const isFITB = typeStr === "FILL_IN_THE_BLANKS";
              const isTEXT = typeStr === "TEXT";
              console.log("📋 Question Type Debug:", {
                raw: currentQuestion.type,
                trimmed: typeStr,
                length: typeStr.length,
                isMCQ,
                isFITB,
                isTEXT,
                hasOptions: !!currentQuestion.options,
                questionId: currentQuestion.id
              });
              return null;
            })()}

            {currentQuestion.type === "MCQ" && (
              <div className="space-y-3">
                {(() => {
                  const options = typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options;
                  return Array.isArray(options) ? options.map((option, idx) => (
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
                  )) : null;
                })()}
              </div>
            )}

            {currentQuestion.type === "FILL_IN_THE_BLANKS" && (
              <>
                {(() => {
                  const options = typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options;
                  const hasOptions = Array.isArray(options) && options.length > 0;

                  if (hasOptions) {
                    return (
                      <div className="space-y-3">
                        {options.map((option, idx) => (
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
                    );
                  } else {
                    return (
                      <input
                        type="text"
                        value={selectedAnswer as string || ""}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    );
                  }
                })()}
              </>
            )}

            {String(currentQuestion.type).trim() === "TEXT" && (
              <textarea
                value={selectedAnswer as string || ""}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            )}

            {/* Fallback for unknown question types - shows textarea */}
            {String(currentQuestion.type).trim() !== "MCQ" && String(currentQuestion.type).trim() !== "FILL_IN_THE_BLANKS" && String(currentQuestion.type).trim() !== "TEXT" && (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  Question Type: <strong>{currentQuestion.type}</strong> (Free text entry)
                </p>
                <textarea
                  value={selectedAnswer as string || ""}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
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

      {/* Doubt Modal */}
      {currentQuestion && (
        <DoubtSubmitModal
          isOpen={isDoubtModalOpen}
          onClose={() => setIsDoubtModalOpen(false)}
          attemptId={attemptId}
          questionId={currentQuestion.id}
          questionNumber={currentQuestion.questionNumber || questionIndex + 1}
        />
      )}
    </div>
  );
}
