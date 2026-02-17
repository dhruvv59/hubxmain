"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, FileText, CheckCircle, Clock, Award, BookOpen, AlertCircle } from "lucide-react";
import { QuestionForm } from "@/components/teacher/questions/QuestionForm";
import { QuestionBankModal } from "@/components/teacher/questions/QuestionBankModal";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  questionText: string;
  questionImage?: string;
  difficulty: string;
  marks: number;
  solutionText: string;
  solutionImage?: string;
  options?: string[];
}

interface Paper {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: string;
  subject?: { name: string };
  difficulty: string;
  duration?: number;
}

export default function PaperQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const loadPaper = async () => {
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/teacher/papers/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPaper(data.data);
      }
    } catch (error) {
      console.error("Error loading paper:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaper();
  }, [paperId]);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem("hubx_access_token");
      await fetch(`${API_BASE_URL}/teacher/papers/${paperId}/questions/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      loadPaper();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this paper? Students will be able to attempt it.")) return;

    setIsPublishing(true);
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/teacher/papers/${paperId}/publish`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Optimistically update status
        setPaper(prev => prev ? { ...prev, status: "PUBLISHED" } : null);
        alert("Paper published successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
      alert("Error publishing paper");
    } finally {
      setIsPublishing(false);
    }
  };

  // Stats Calculation
  const totalQuestions = paper?.questions.length || 0;
  const totalMarks = paper?.questions.reduce((sum, q) => sum + q.marks, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#5b5bd6]" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Paper Not Found</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#5b5bd6] hover:underline font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isPublished = paper.status === "PUBLISHED";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none truncate max-w-[150px] sm:max-w-none">{paper.title}</h1>
              {paper.subject && <span className="text-xs font-medium text-gray-500">{paper.subject.name} • {paper.difficulty}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPublished ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Published</span>
              </span>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-[#5b5bd6] text-[#5b5bd6] rounded-xl hover:bg-[#5b5bd6]/5 font-bold text-xs transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Question</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button
                  onClick={handlePublish}
                  disabled={totalQuestions === 0 || isPublishing}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-5 py-2 bg-[#5b5bd6] text-white rounded-xl hover:bg-[#4f46e5] font-bold text-xs transition-all shadow-sm hover:shadow-md",
                    (totalQuestions === 0 || isPublishing) && "opacity-50 cursor-not-allowed shadow-none"
                  )}
                >
                  {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Publish Paper</span>
                  <span className="sm:hidden">Publish</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">Questions</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{totalQuestions}</p>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">Total Marks</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{Number(totalMarks).toLocaleString('en-US', { maximumFractionDigits: 1 })}</p>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">Duration</p>
              <p className="text-base sm:text-lg font-black text-gray-900">{paper.duration ? `${paper.duration} m` : "No Limit"}</p>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">Difficulty</p>
              <p className="text-base sm:text-lg font-black text-gray-900 capitalize truncate">{paper.difficulty?.toLowerCase() || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {totalQuestions === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 px-4 py-8 sm:p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No questions added yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
              Start building your assessment by adding questions. You need at least one question to publish the paper.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 bg-[#5b5bd6] text-white rounded-xl hover:bg-[#4f46e5] font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paper.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
                        Q{idx + 1}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap",
                        q.type === "MCQ" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {q.type === "MCQ" ? "MCQ" : q.type === "TEXT" ? "Text" : "Blanks"}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                        {q.marks} Marks
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-800 leading-relaxed mb-4">
                      {q.questionText}
                    </h3>

                    {q.questionImage && (
                      <div className="mb-4">
                        <img
                          src={q.questionImage}
                          alt="Question"
                          className="max-h-60 rounded-lg border border-gray-200 object-contain bg-gray-50"
                        />
                      </div>
                    )}

                    {q.type === "MCQ" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {(() => {
                          const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                          return Array.isArray(options) ? options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                            </div>
                          )) : null;
                        })()}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 font-medium">
                      <div className="flex gap-2">
                        <span className="text-gray-900 font-bold">Solution:</span>
                        <span>{q.solutionText || "No solution provided"}</span>
                      </div>

                      {q.solutionImage && (
                        <div className="mt-2">
                          <img
                            src={q.solutionImage}
                            alt="Solution"
                            className="max-h-40 rounded-lg border border-gray-200 object-contain bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {!isPublished && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm
          paperId={paperId}
          onQuestionAdded={loadPaper}
          onClose={() => setShowForm(false)}
          questionNumber={totalQuestions + 1}
          onOpenQuestionBank={() => {
            setShowForm(false);
            setShowQuestionBank(true);
          }}
        />
      )}

      {/* Question Bank Modal */}
      {showQuestionBank && (
        <QuestionBankModal
          paperId={paperId}
          onQuestionAdded={loadPaper}
          onClose={() => setShowQuestionBank(false)}
        />
      )}
    </div>
  );
}
