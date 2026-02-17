"use client";

import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

interface QuestionFormProps {
  paperId: string;
  onQuestionAdded: () => void;
  onClose: () => void;
}

export function QuestionForm({ paperId, onQuestionAdded, onClose }: QuestionFormProps) {
  const [type, setType] = useState<"MCQ" | "TEXT" | "FILL_IN_THE_BLANKS">("MCQ");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [marks, setMarks] = useState("1");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [solutionText, setSolutionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddQuestion = async () => {
    if (!questionText.trim()) {
      alert("Question text is required");
      return;
    }

    if (type === "MCQ" && options.some(o => !o.trim())) {
      alert("All options are required for MCQ");
      return;
    }

    if (type === "MCQ" && !solutionText.trim()) {
      alert("Solution is required");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("questionText", questionText);
      formData.append("difficulty", difficulty);
      formData.append("marks", marks);
      formData.append("solutionText", solutionText);

      if (type === "MCQ") {
        formData.append("options", JSON.stringify(options));
        formData.append("correctOption", correctOption.toString());
      }

      const token = localStorage.getItem("hubx_access_token");
      const response = await fetch(
        `${API_BASE_URL}/teacher/papers/${paperId}/questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      alert("Question added successfully!");
      onQuestionAdded();
      onClose();
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Question</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Question Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Question Type</label>
          <div className="flex gap-3">
            {["MCQ", "TEXT", "FILL_IN_THE_BLANKS"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${type === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {t === "MCQ" ? "MCQ" : t === "TEXT" ? "Text" : "Fill in Blanks"}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Question Text *</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* MCQ Options */}
        {type === "MCQ" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Options *</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOption === idx}
                    onChange={() => setCorrectOption(idx)}
                    className="mt-3"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty & Marks */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="EASY">Easy</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Marks</label>
            <input
              type="number"
              min="1"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Solution */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Solution/Answer *</label>
          <textarea
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            placeholder="Enter solution or correct answer..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddQuestion}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
