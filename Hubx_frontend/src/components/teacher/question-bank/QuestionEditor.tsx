"use client";

import React, { useRef, useState } from "react";
import { Eye, Link as LinkIcon, Camera, Loader2, Minus, Plus } from "lucide-react";
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
      if (field === "text") handleFieldChange("text", newValue);
      else handleFieldChange("solutionText", newValue);
      setTimeout(() => {
        if (ref.current) {
          ref.current.selectionStart = ref.current.selectionEnd = start + symbol.length;
          ref.current.focus();
        }
      }, 0);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "questionImage" | "solutionImage") => {
    if (e.target.files && e.target.files[0]) handleFieldChange(field, e.target.files[0]);
  };

  const handleOcrImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: "text" | "solutionText") => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const isQuestion = field === "text";
    if (isQuestion) setIsOcrLoadingQuestion(true);
    else setIsOcrLoadingSolution(true);
    try {
      const result = await ocrService.extractText(file);
      const currentValue = isQuestion ? question.text : (question.solutionText || "");
      const separator = currentValue.trim() ? " " : "";
      handleFieldChange(field, currentValue + separator + result.text);
    } catch {
      alert("Failed to extract text from image.");
    } finally {
      if (isQuestion) {
        setIsOcrLoadingQuestion(false);
        if (ocrQuestionInputRef.current) ocrQuestionInputRef.current.value = "";
      } else {
        setIsOcrLoadingSolution(false);
        if (ocrSolutionInputRef.current) ocrSolutionInputRef.current.value = "";
      }
    }
  };

  const QUESTION_TYPES = [
    { value: "TEXT", label: "Text" },
    { value: "MCQ", label: "MCQ" },
    { value: "FILL_IN_THE_BLANKS", label: "Fill in Blanks" },
  ];

  const DIFFICULTY_LEVELS = [
    { value: "EASY", label: "Easy", color: "text-green-700 bg-green-50 border-green-200", activeColor: "bg-green-600 text-white border-green-600" },
    { value: "INTERMEDIATE", label: "Intermediate", color: "text-orange-700 bg-orange-50 border-orange-200", activeColor: "bg-orange-500 text-white border-orange-500" },
    { value: "ADVANCED", label: "Advanced", color: "text-red-700 bg-red-50 border-red-200", activeColor: "bg-red-600 text-white border-red-600" },
  ];

  return (
    <div className="space-y-6">

      {/* Top config row */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">

        {/* Question Type */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Question Type</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleFieldChange("type", type.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold border transition-all",
                  question.type === type.value
                    ? "bg-[#6366f1] text-white border-[#6366f1] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#6366f1] hover:text-[#6366f1]"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Difficulty */}
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleFieldChange("difficulty", level.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold border transition-all",
                    question.difficulty === level.value
                      ? level.activeColor + " shadow-sm"
                      : level.color + " hover:opacity-80"
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Marks */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Marks</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFieldChange("marks", Math.max(1, question.marks - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={question.marks}
                onChange={(e) => handleFieldChange("marks", Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-8 text-center border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#6366f1]"
              />
              <button
                type="button"
                onClick={() => handleFieldChange("marks", Math.min(100, question.marks + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-400 font-medium">per question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Question <span className="text-red-500">*</span></p>
        <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "text")} />
        <textarea
          ref={questionTextRef}
          value={question.text}
          onChange={(e) => handleFieldChange("text", e.target.value)}
          placeholder="Write your question here..."
          rows={4}
          className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400"
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button type="button" onClick={() => setShowQuestionPreview(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" /> Math Preview
          </button>
          <button type="button" onClick={() => ocrQuestionInputRef.current?.click()} disabled={isOcrLoadingQuestion}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {isOcrLoadingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {isOcrLoadingQuestion ? "Scanning..." : "Scan from Image"}
          </button>
          <button type="button" onClick={() => questionImageInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <LinkIcon className="w-3.5 h-3.5" /> Attach Image
          </button>
        </div>
        <input type="file" ref={questionImageInputRef} onChange={(e) => handleImageSelect(e, "questionImage")} className="hidden" accept="image/*" />
        <input type="file" ref={ocrQuestionInputRef} onChange={(e) => handleOcrImageSelect(e, "text")} className="hidden" accept="image/*" />
      </div>

      {/* Solution */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Solution <span className="text-gray-400 font-normal normal-case">(optional)</span></p>
        <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "solution")} />
        <textarea
          ref={solutionTextRef}
          value={question.solutionText || ""}
          onChange={(e) => handleFieldChange("solutionText", e.target.value)}
          placeholder="Write the solution or explanation here..."
          rows={4}
          className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400"
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button type="button" onClick={() => setShowSolutionPreview(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" /> Math Preview
          </button>
          <button type="button" onClick={() => ocrSolutionInputRef.current?.click()} disabled={isOcrLoadingSolution}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {isOcrLoadingSolution ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {isOcrLoadingSolution ? "Scanning..." : "Scan from Image"}
          </button>
          <button type="button" onClick={() => solutionImageInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <LinkIcon className="w-3.5 h-3.5" /> Attach Image
          </button>
        </div>
        <input type="file" ref={solutionImageInputRef} onChange={(e) => handleImageSelect(e, "solutionImage")} className="hidden" accept="image/*" />
        <input type="file" ref={ocrSolutionInputRef} onChange={(e) => handleOcrImageSelect(e, "solutionText")} className="hidden" accept="image/*" />
      </div>

      {/* Math Preview Modals */}
      {showQuestionPreview && (
        <MathPreviewModal text={question.text} title="Question Preview" onClose={() => setShowQuestionPreview(false)} />
      )}
      {showSolutionPreview && (
        <MathPreviewModal text={question.solutionText || ""} title="Solution Preview" onClose={() => setShowSolutionPreview(false)} />
      )}
    </div>
  );
}
