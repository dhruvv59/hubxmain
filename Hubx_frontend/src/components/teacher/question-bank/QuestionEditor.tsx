"use client";

import React, { useRef, useState } from "react";
import { Upload, Eye, Link as LinkIcon, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionBankQuestion } from "@/types/question-bank";
import { MathSymbolsToolbar } from "./MathSymbolsToolbar";
import { MathPreviewModal } from "../questions/MathPreviewModal";
import { ocrService } from "@/services/ocr";

interface QuestionEditorProps {
  question: QuestionBankQuestion;
  onUpdate: (question: QuestionBankQuestion) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const [showQuestionPreview, setShowQuestionPreview] = React.useState(false);
  const [showSolutionPreview, setShowSolutionPreview] = React.useState(false);
  const [isOcrLoadingQuestion, setIsOcrLoadingQuestion] = useState(false);
  const [isOcrLoadingSolution, setIsOcrLoadingSolution] = useState(false);
  const questionTextRef = useRef<HTMLTextAreaElement>(null);
  const solutionTextRef = useRef<HTMLTextAreaElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const solutionImageInputRef = useRef<HTMLInputElement>(null);
  const ocrQuestionInputRef = useRef<HTMLInputElement>(null);
  const ocrSolutionInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof QuestionBankQuestion, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const insertSymbolIntoField = (symbol: string, field: "text" | "solution") => {
    const ref = field === "text" ? questionTextRef : solutionTextRef;
    const currentValue = field === "text" ? question.text : question.solutionText || "";

    if (ref.current) {
      const start = ref.current.selectionStart;
      const end = ref.current.selectionEnd;
      const newValue = currentValue.slice(0, start) + symbol + currentValue.slice(end);

      if (field === "text") {
        handleFieldChange("text", newValue);
      } else {
        handleFieldChange("solutionText", newValue);
      }

      setTimeout(() => {
        if (ref.current) {
          ref.current.selectionStart = ref.current.selectionEnd = start + symbol.length;
          ref.current.focus();
        }
      }, 0);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "questionImage" | "solutionImage") => {
    if (e.target.files && e.target.files[0]) {
      handleFieldChange(field, e.target.files[0]);
    }
  };

  const handleOcrImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "text" | "solutionText"
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const isQuestion = field === "text";

    if (isQuestion) {
      setIsOcrLoadingQuestion(true);
    } else {
      setIsOcrLoadingSolution(true);
    }

    try {
      const result = await ocrService.extractText(file);
      const currentValue = isQuestion ? question.text : (question.solutionText || "");
      const separator = currentValue.trim() ? " " : "";
      const newValue = currentValue + separator + result.text;

      handleFieldChange(field, newValue);
    } catch (error) {
      console.error("OCR extraction failed:", error);
      alert("Failed to extract text from image. Please try another image or enter the text manually.");
    } finally {
      if (isQuestion) {
        setIsOcrLoadingQuestion(false);
        if (ocrQuestionInputRef.current) {
          ocrQuestionInputRef.current.value = "";
        }
      } else {
        setIsOcrLoadingSolution(false);
        if (ocrSolutionInputRef.current) {
          ocrSolutionInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Type & Difficulty */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Question Type</label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "TEXT", label: "Text Question" },
              { value: "MCQ", label: "MCQ" },
              { value: "FILL_IN_THE_BLANKS", label: "Fill in the Blanks" },
            ].map((type) => (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="questionType"
                  checked={question.type === type.value}
                  onChange={() => handleFieldChange("type", type.value)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Difficulty Level</label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "EASY", label: "Easy" },
              { value: "INTERMEDIATE", label: "Intermediate" },
              { value: "ADVANCED", label: "Advanced" },
            ].map((level) => (
              <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  checked={question.difficulty === level.value}
                  onChange={() => handleFieldChange("difficulty", level.value)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Question</label>
        <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "text")} />
        <textarea
          ref={questionTextRef}
          value={question.text}
          onChange={(e) => handleFieldChange("text", e.target.value)}
          placeholder="Distinguish between boiling and evaporation."
          rows={5}
          className="w-full mt-2 p-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
        />
        <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
          <button
            type="button"
            onClick={() => setShowQuestionPreview(true)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Question (Math Preview)
          </button>
          <button
            type="button"
            onClick={() => ocrQuestionInputRef.current?.click()}
            disabled={isOcrLoadingQuestion}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
          >
            {isOcrLoadingQuestion ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isOcrLoadingQuestion ? "Scanning..." : "Scan from Image"}
          </button>
          <button
            type="button"
            onClick={() => questionImageInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <LinkIcon className="w-4 h-4" />
            Attach Image for question
          </button>
        </div>
        <input
          type="file"
          ref={questionImageInputRef}
          onChange={(e) => handleImageSelect(e, "questionImage")}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={ocrQuestionInputRef}
          onChange={(e) => handleOcrImageSelect(e, "text")}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Solution Section */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Solution</label>
        <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "solution")} />
        <textarea
          ref={solutionTextRef}
          value={question.solutionText || ""}
          onChange={(e) => handleFieldChange("solutionText", e.target.value)}
          placeholder="Occurs throughout the liquid. Occurs only at the surface..."
          rows={5}
          className="w-full mt-2 p-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
        />
        <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
          <button
            type="button"
            onClick={() => setShowSolutionPreview(true)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Solution (Math Preview)
          </button>
          <button
            type="button"
            onClick={() => ocrSolutionInputRef.current?.click()}
            disabled={isOcrLoadingSolution}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
          >
            {isOcrLoadingSolution ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isOcrLoadingSolution ? "Scanning..." : "Scan from Image"}
          </button>
          <button
            type="button"
            onClick={() => solutionImageInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <LinkIcon className="w-4 h-4" />
            Attach Image for solution
          </button>
        </div>
        <input
          type="file"
          ref={solutionImageInputRef}
          onChange={(e) => handleImageSelect(e, "solutionImage")}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={ocrSolutionInputRef}
          onChange={(e) => handleOcrImageSelect(e, "solutionText")}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Math Preview Modals */}
      {showQuestionPreview && (
        <MathPreviewModal
          text={question.text}
          title="Question Preview"
          onClose={() => setShowQuestionPreview(false)}
        />
      )}
      {showSolutionPreview && (
        <MathPreviewModal
          text={question.solutionText || ""}
          title="Solution Preview"
          onClose={() => setShowSolutionPreview(false)}
        />
      )}
    </div>
  );
}
