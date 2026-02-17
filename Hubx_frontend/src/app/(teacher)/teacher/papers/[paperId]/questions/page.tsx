"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { QuestionForm } from "@/components/teacher/questions/QuestionForm";
import { API_BASE_URL } from "@/lib/api-config";

interface Question {
  id: string;
  type: string;
  questionText: string;
  difficulty: string;
  marks: number;
  solutionText: string;
}

interface Paper {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function PaperQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    if (!confirm("Delete this question?")) return;

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
    try {
      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(`${API_BASE_URL}/teacher/papers/${paperId}/publish`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        alert("Paper published successfully!");
        router.back();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
      alert("Error publishing paper");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-6">
        <p className="text-red-600">Paper not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{paper.title}</h1>
            <p className="text-gray-500 mt-1">{paper.questions.length} questions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
          <button
            onClick={handlePublish}
            disabled={paper.questions.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish Paper
          </button>
        </div>
      </div>

      {/* Questions List */}
      {paper.questions.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <p className="text-gray-600 font-medium mb-3">No questions added yet</p>
          <p className="text-gray-500 text-sm mb-6">Add at least 1 question to publish this paper</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paper.questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    Q{idx + 1}: {q.questionText.substring(0, 100)}
                    {q.questionText.length > 100 ? "..." : ""}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                  {q.type === "MCQ" ? "MCQ" : q.type === "TEXT" ? "Text" : "Fill in Blanks"}
                </span>
                <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-700 font-medium">
                  {q.difficulty}
                </span>
                <span className="px-3 py-1 bg-green-100 rounded-full text-green-700 font-medium">
                  {q.marks} marks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm
          paperId={paperId}
          onQuestionAdded={loadPaper}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
