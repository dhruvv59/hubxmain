"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { TEACHER_QUESTION_BANK_ENDPOINTS } from "@/lib/api-config";
import { QuestionTabs } from "@/components/teacher/question-bank/QuestionTabs";
import { QuestionEditor } from "@/components/teacher/question-bank/QuestionEditor";
import type { QuestionBankQuestion, CreateBankQuestionsResponse } from "@/types/question-bank";

export default function CreateQuestionBankPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>([
    {
      id: 1,
      type: "TEXT",
      difficulty: "INTERMEDIATE",
      text: "",
      marks: 1,
      explanation: "",
      solutionText: "",
      questionImage: null,
      solutionImage: null,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeQuestion = questions[activeTabIndex];

  const handleAddQuestion = () => {
    const newQuestion: QuestionBankQuestion = {
      id: Math.random(), // Temporary ID
      type: "TEXT",
      difficulty: "INTERMEDIATE",
      text: "",
      marks: 1,
      explanation: "",
      solutionText: "",
      questionImage: null,
      solutionImage: null,
    };
    setQuestions([...questions, newQuestion]);
    setActiveTabIndex(questions.length);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError("You must have at least one question");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setActiveTabIndex(Math.max(0, activeTabIndex - 1));
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionBankQuestion) => {
    const newQuestions = [...questions];
    newQuestions[activeTabIndex] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const validateQuestions = (): string[] => {
    const errors: string[] = [];

    questions.forEach((q, index) => {
      if (!q.text?.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (!q.type) {
        errors.push(`Question ${index + 1}: Question type is required`);
      }

      if (!q.difficulty) {
        errors.push(`Question ${index + 1}: Difficulty is required`);
      }

      if (q.marks <= 0) {
        errors.push(`Question ${index + 1}: Marks must be greater than 0`);
      }

      if (q.type === "MCQ") {
        const options = q.options || [];
        if (options.length < 2) {
          errors.push(`Question ${index + 1}: MCQ must have at least 2 options`);
        }
        if (q.correctOption === undefined || q.correctOption >= options.length) {
          errors.push(`Question ${index + 1}: Please select a correct option for MCQ`);
        }
        if (options.some((opt) => !opt?.trim())) {
          errors.push(`Question ${index + 1}: All MCQ options must be filled`);
        }
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate questions
    const validationErrors = validateQuestions();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    setIsLoading(true);

    try {
      // Build FormData for batch create
      const formData = new FormData();

      // Add questions array as JSON
      const questionsData = questions.map((q) => ({
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: q.marks,
        explanation: q.explanation,
        solutionText: q.solutionText,
        options: q.type === "MCQ" ? q.options : undefined,
        correctOption: q.type === "MCQ" ? q.correctOption : undefined,
        correctAnswers: q.type === "FILL_IN_THE_BLANKS" ? q.correctAnswers : undefined,
        caseSensitive: q.type === "FILL_IN_THE_BLANKS" ? q.caseSensitive : undefined,
      }));

      formData.append("questions", JSON.stringify(questionsData));

      // Add image files
      questions.forEach((q, index) => {
        if (q.questionImage instanceof File) {
          formData.append(`questionImage_${index}`, q.questionImage);
        }
        if (q.solutionImage instanceof File) {
          formData.append(`solutionImage_${index}`, q.solutionImage);
        }
      });

      // Call batch create API
      const response = await http.post<{ success: boolean; message: string; data: CreateBankQuestionsResponse }>(
        TEACHER_QUESTION_BANK_ENDPOINTS.batchCreate(),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccessMessage(
        `Successfully created ${response.data.successful} question${response.data.successful !== 1 ? "s" : ""}!`
      );

      // Redirect after short delay
      setTimeout(() => {
        router.push("/teacher/question-bank");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create questions:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create questions. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Create Questions</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add multiple questions to your question bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {/* Tabs */}
        <QuestionTabs
          questions={questions}
          activeIndex={activeTabIndex}
          onTabClick={setActiveTabIndex}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
        />

        {/* Error Alert */}
        {error && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 text-sm mb-2">Validation Error</h3>
              <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeQuestion && <QuestionEditor question={activeQuestion} onUpdate={handleUpdateQuestion} />}
        </div>

        {/* Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors text-white",
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6366f1] hover:bg-[#4f4fbe]"
              )}
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {isLoading ? "Creating..." : `Add ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
