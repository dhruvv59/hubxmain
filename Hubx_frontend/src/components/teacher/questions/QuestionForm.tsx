"use client";

import React, { useState } from "react";
import { X, Loader2, Image as ImageIcon, Link as LinkIcon, Eye, Plus, Camera } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { ocrService } from "@/services/ocr";

import { MathPreviewModal } from "./MathPreviewModal";

interface QuestionFormProps {
  paperId: string;
  onQuestionAdded: () => void;
  onClose: () => void;
  questionNumber?: number;
  onOpenQuestionBank?: () => void;
}

export function QuestionForm({ paperId, onQuestionAdded, onClose, questionNumber = 1, onOpenQuestionBank }: QuestionFormProps) {
  const [type, setType] = useState<"MCQ" | "TEXT" | "FILL_IN_THE_BLANKS">("TEXT");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [solutionText, setSolutionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [marks, setMarks] = useState("1"); // Default marks

  // Preview State
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("Math Preview");

  // Image states
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [solutionImage, setSolutionImage] = useState<File | null>(null);

  // OCR state
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // File input refs
  const questionImageInputRef = React.useRef<HTMLInputElement>(null);
  const solutionImageInputRef = React.useRef<HTMLInputElement>(null);
  const ocrImageInputRef = React.useRef<HTMLInputElement>(null);

  // Math symbols for the toolbar
  const mathSymbols = ["²", "³", "±", "×", "÷", "≤", "≥", "√", "π"];

  const insertSymbol = (symbol: string, field: "question" | "solution") => {
    if (field === "question") {
      setQuestionText((prev) => prev + symbol);
    } else {
      setSolutionText((prev) => prev + symbol);
    }
  };

  const handlePreview = (field: "question" | "solution") => {
    if (field === "question") {
      setPreviewContent(questionText);
      setPreviewTitle("Question Preview");
    } else {
      setPreviewContent(solutionText);
      setPreviewTitle("Solution Preview");
    }
  };

  const handleOcrImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsOcrLoading(true);

    try {
      const result = await ocrService.extractText(file);
      // Append extracted text to the question field
      setQuestionText((prev) => {
        const separator = prev.trim() ? " " : "";
        return prev + separator + result.text;
      });
    } catch (error) {
      console.error("OCR extraction failed:", error);
      alert("Failed to extract text from image. Please try another image or enter the text manually.");
    } finally {
      setIsOcrLoading(false);
      // Reset the input so the same file can be selected again
      if (ocrImageInputRef.current) {
        ocrImageInputRef.current.value = "";
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "question" | "solution") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (field === "question") {
        setQuestionImage(file);
      } else {
        setSolutionImage(file);
      }
    }
  };

  const removeImage = (field: "question" | "solution") => {
    if (field === "question") {
      setQuestionImage(null);
      if (questionImageInputRef.current) questionImageInputRef.current.value = "";
    } else {
      setSolutionImage(null);
      if (solutionImageInputRef.current) solutionImageInputRef.current.value = "";
    }
  };

  const handleAddQuestion = async () => {
    if (!questionText.trim()) {
      alert("Question text is required");
      return;
    }

    if (type === "MCQ" && options.some((o) => !o.trim())) {
      alert("All options are required for MCQ");
      return;
    }

    // For TEXT type, solution is good to have but maybe not strictly required by backend validation? 
    // But UI shows it prominently. Let's keep validation if needed or loose it.
    // The previous code had validation. Let's keep it loose for better UX or strict if critical.
    if (!solutionText.trim()) {
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

      if (questionImage) {
        formData.append("questionImage", questionImage);
      }
      if (solutionImage) {
        formData.append("solutionImage", solutionImage);
      }

      if (type === "MCQ") {
        formData.append("options", JSON.stringify(options));
        formData.append("correctOption", correctOption.toString());
      } else if (type === "FILL_IN_THE_BLANKS" && options.some((o) => o.trim())) {
        // For FILL_IN_THE_BLANKS, options are optional
        // Only send them if teacher provided at least one option
        formData.append("options", JSON.stringify(options.filter((o) => o.trim())));
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

      // alert("Question added successfully!"); // Removed alert to make it smoother
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-2xl sm:max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={questionImageInputRef}
          onChange={(e) => handleImageSelect(e, "question")}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={solutionImageInputRef}
          onChange={(e) => handleImageSelect(e, "solution")}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={ocrImageInputRef}
          onChange={handleOcrImageSelect}
          className="hidden"
          accept="image/*"
        />

        {/* Header Section */}
        <div className="px-4 py-4 sm:px-8 sm:py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <span className="text-lg font-bold text-gray-900">Question {questionNumber}</span>

            {/* Type Selector */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", type === "TEXT" ? "border-blue-600" : "border-gray-400 group-hover:border-blue-400")}>
                  {type === "TEXT" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <input type="radio" className="hidden" checked={type === "TEXT"} onChange={() => setType("TEXT")} />
                <span className={cn("text-xs sm:text-sm font-medium", type === "TEXT" ? "text-blue-700" : "text-gray-600")}>Text</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", type === "MCQ" ? "border-blue-600" : "border-gray-400 group-hover:border-blue-400")}>
                  {type === "MCQ" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <input type="radio" className="hidden" checked={type === "MCQ"} onChange={() => setType("MCQ")} />
                <span className={cn("text-xs sm:text-sm font-medium", type === "MCQ" ? "text-blue-700" : "text-gray-600")}>MCQ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", type === "FILL_IN_THE_BLANKS" ? "border-blue-600" : "border-gray-400 group-hover:border-blue-400")}>
                  {type === "FILL_IN_THE_BLANKS" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <input type="radio" className="hidden" checked={type === "FILL_IN_THE_BLANKS"} onChange={() => setType("FILL_IN_THE_BLANKS")} />
                <span className={cn("text-xs sm:text-sm font-medium", type === "FILL_IN_THE_BLANKS" ? "text-blue-700" : "text-gray-600")}>Blanks</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-sm font-bold text-gray-500">Difficulty</span>
            <div className="flex items-center gap-3">
              {["EASY", "INTERMEDIATE", "ADVANCED"].map((level) => (
                <label key={level} className="flex items-center gap-1.5 cursor-pointer group">
                  <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", difficulty === level ? "border-blue-600" : "border-gray-400 group-hover:border-blue-400")}>
                    {difficulty === level && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input type="radio" className="hidden" checked={difficulty === level} onChange={() => setDifficulty(level)} />
                  <span className={cn("text-xs sm:text-sm font-medium capitalize", difficulty === level ? "text-blue-700" : "text-gray-600")}>
                    {level === "INTERMEDIATE" ? "Med" : level.toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-4 sm:mb-6">Add Question Manually</h3>

          {/* Question Input Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2 sm:gap-0">
              <label className="text-xs font-bold text-gray-500">Question</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">Math:</span>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                  {mathSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => insertSymbol(symbol, "question")}
                      className="px-2 py-1 sm:px-2.5 sm:py-1 text-xs text-gray-600 hover:bg-gray-50 border-r border-gray-200 last:border-r-0 font-serif"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none text-sm text-gray-800 placeholder:text-gray-300 font-medium leading-relaxed"
              placeholder="Type your question here..."
            />

            {/* Question Image Preview */}
            {questionImage && (
              <div className="mt-3 relative inline-block">
                <img
                  src={URL.createObjectURL(questionImage)}
                  alt="Question attachment"
                  className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                />
                <button
                  onClick={() => removeImage("question")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="block text-xs text-gray-500 mt-1 max-w-[200px] truncate">{questionImage.name}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 gap-3">
              <button
                onClick={() => handlePreview("question")}
                className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Question (Math Preview)
              </button>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => ocrImageInputRef.current?.click()}
                  disabled={isOcrLoading}
                  className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  {isOcrLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  {isOcrLoading ? "Scanning..." : "Scan from Image"}
                </button>
                <button
                  onClick={() => questionImageInputRef.current?.click()}
                  className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Attach Image
                </button>
                <button
                  onClick={onOpenQuestionBank}
                  className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add from Question Bank
                </button>
              </div>
            </div>
          </div>

          {/* MCQ & Fill in the Blanks Options Section */}
          {(type === "MCQ" || type === "FILL_IN_THE_BLANKS") && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 mb-4 block">
                {type === "MCQ" ? "MCQ Options" : "Answer Options (Optional)"}
                {type === "FILL_IN_THE_BLANKS" && (
                  <span className="block text-xs font-normal text-gray-400 mt-1">
                    Leave blank for free text entry, or add options for multiple choice
                  </span>
                )}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOption === idx}
                      onChange={() => setCorrectOption(idx)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solution Input Section */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2 sm:gap-0">
              <label className="text-xs font-bold text-gray-500">Solution</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">Math:</span>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                  {mathSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => insertSymbol(symbol, "solution")}
                      className="px-2 py-1 sm:px-2.5 sm:py-1 text-xs text-gray-600 hover:bg-gray-50 border-r border-gray-200 last:border-r-0 font-serif"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none text-sm text-gray-800 placeholder:text-gray-300 font-medium leading-relaxed"
              placeholder="Explain the solution..."
            />

            {/* Solution Image Preview */}
            {solutionImage && (
              <div className="mt-3 relative inline-block">
                <img
                  src={URL.createObjectURL(solutionImage)}
                  alt="Solution attachment"
                  className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                />
                <button
                  onClick={() => removeImage("solution")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="block text-xs text-gray-500 mt-1 max-w-[200px] truncate">{solutionImage.name}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 gap-3">
              <button
                onClick={() => handlePreview("solution")}
                className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Solution (Math Preview)
              </button>
              <button
                onClick={() => solutionImageInputRef.current?.click()}
                className="text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Attach Image
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-6 sm:px-8 py-2.5 rounded-xl border border-blue-600 text-blue-600 text-sm font-bold hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddQuestion}
            disabled={isLoading}
            className="px-6 sm:px-8 py-2.5 rounded-xl bg-[#5b5bd6] text-white text-sm font-bold hover:bg-[#4f46e5] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Add Question
          </button>
        </div>

      </div>

      {/* Math Preview Modal */}
      {previewContent && (
        <MathPreviewModal
          text={previewContent}
          title={previewTitle}
          onClose={() => setPreviewContent(null)}
        />
      )}
    </div>
  );
}
