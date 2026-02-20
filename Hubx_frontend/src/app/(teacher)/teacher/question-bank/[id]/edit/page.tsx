"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Paperclip, FileText, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathSymbolsToolbar } from "@/components/teacher/question-bank/MathSymbolsToolbar";
import { MathPreviewModal } from "@/components/teacher/questions/MathPreviewModal";
import { teacherContentService, type Standard, type Subject, type Chapter } from "@/services/teacher-content";
import { getBankQuestionForEdit, updateBankQuestion } from "@/services/question-bank-service";
import type { QuestionBankQuestion } from "@/types/question-bank";
import { ocrService } from "@/services/ocr";

export default function EditQuestionBankPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [question, setQuestion] = useState<QuestionBankQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [showSolutionPreview, setShowSolutionPreview] = useState(false);
  const [isOcrLoadingQuestion, setIsOcrLoadingQuestion] = useState(false);
  const [isOcrLoadingSolution, setIsOcrLoadingSolution] = useState(false);

  const questionTextRef = useRef<HTMLTextAreaElement>(null);
  const solutionTextRef = useRef<HTMLTextAreaElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const solutionImageInputRef = useRef<HTMLInputElement>(null);
  const ocrQuestionInputRef = useRef<HTMLInputElement>(null);
  const ocrSolutionInputRef = useRef<HTMLInputElement>(null);

  const [selectedStandardId, setSelectedStandardId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [questionPreviewUrl, setQuestionPreviewUrl] = useState<string | null>(null);
  const [solutionPreviewUrl, setSolutionPreviewUrl] = useState<string | null>(null);

  // Preview URLs for attached images (with cleanup for object URLs)
  useEffect(() => {
    if (!question) {
      setQuestionPreviewUrl(null);
      return;
    }
    if (question.questionImage instanceof File) {
      const url = URL.createObjectURL(question.questionImage);
      setQuestionPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setQuestionPreviewUrl(typeof question.questionImage === "string" ? question.questionImage : null);
    return () => {};
  }, [question?.questionImage, question]);

  useEffect(() => {
    if (!question) {
      setSolutionPreviewUrl(null);
      return;
    }
    if (question.solutionImage instanceof File) {
      const url = URL.createObjectURL(question.solutionImage);
      setSolutionPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setSolutionPreviewUrl(typeof question.solutionImage === "string" ? question.solutionImage : null);
    return () => {};
  }, [question?.solutionImage, question]);

  // Fetch question and content on mount
  useEffect(() => {
    if (!questionId) return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [questionData, standardsData] = await Promise.all([
          getBankQuestionForEdit(questionId),
          teacherContentService.getStandards(),
        ]);

        setQuestion(questionData);
        setStandards(standardsData);

        // Find standard that contains this subject and load chapters
        if (questionData.subjectId && standardsData.length > 0) {
          for (const std of standardsData) {
            try {
              const stdSubjects = await teacherContentService.getSubjects(std.id);
              const hasSubject = stdSubjects.some((s) => s.id === questionData.subjectId);
              if (hasSubject) {
                setSelectedStandardId(std.id);
                setSelectedSubjectId(questionData.subjectId);
                setSubjects(stdSubjects);
                const chs = await teacherContentService.getChapters(std.id, questionData.subjectId);
                setChapters(chs);
                break;
              }
            } catch {
              // continue to next standard
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch question:", err);
        setError("Failed to load question. It may have been deleted.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [questionId]);

  // Fetch subjects when standard changes
  useEffect(() => {
    if (!selectedStandardId) {
      setSubjects([]);
      return;
    }
    teacherContentService.getSubjects(selectedStandardId).then(setSubjects).catch(console.error);
  }, [selectedStandardId]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!selectedSubjectId || !selectedStandardId) {
      setChapters([]);
      return;
    }
    teacherContentService.getChapters(selectedStandardId, selectedSubjectId).then(setChapters).catch(console.error);
  }, [selectedSubjectId, selectedStandardId]);

  const handleStandardChange = (standardId: string) => {
    setSelectedStandardId(standardId);
    setSelectedSubjectId("");
    if (question) setQuestion((prev) => (prev ? { ...prev, subjectId: undefined, chapterIds: [] } : prev));
    setChapters([]);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (question) setQuestion((prev) => (prev ? { ...prev, subjectId: subjectId || undefined, chapterIds: [] } : prev));
  };

  const handleChapterToggle = (chapterId: string) => {
    if (!question) return;
    setQuestion((prev) => {
      if (!prev) return prev;
      const current = prev.chapterIds || [];
      const updated = current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId];
      return { ...prev, chapterIds: updated };
    });
  };

  const handleFieldChange = (field: keyof QuestionBankQuestion, value: any) => {
    if (!question) return;
    setQuestion({ ...question, [field]: value });
  };

  const insertSymbolIntoField = (symbol: string, field: "text" | "solutionText") => {
    const ref = field === "text" ? questionTextRef : solutionTextRef;
    const currentValue = (field === "text" ? question?.text : question?.solutionText) || "";
    if (ref.current) {
      const start = ref.current.selectionStart ?? 0;
      const end = ref.current.selectionEnd ?? 0;
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
    if (e.target.files && e.target.files[0]) {
      handleFieldChange(field, e.target.files[0]);
    }
  };

  const handleOcrImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: "text" | "solutionText") => {
    if (!e.target.files || !e.target.files[0] || !question) return;
    const file = e.target.files[0];
    const isQuestion = field === "text";
    if (isQuestion) setIsOcrLoadingQuestion(true);
    else setIsOcrLoadingSolution(true);
    try {
      const result = await ocrService.extractText(file);
      const currentValue = isQuestion ? question.text : question.solutionText || "";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !questionId) return;

    setError(null);
    setSuccessMessage(null);

    if (!question.text?.trim()) {
      setError("Question text is required");
      return;
    }
    if (!question.type) {
      setError("Question type is required");
      return;
    }
    if (!question.difficulty) {
      setError("Difficulty is required");
      return;
    }
    if (question.marks <= 0) {
      setError("Marks must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", question.type);
      formData.append("difficulty", question.difficulty);
      formData.append("questionText", question.text);
      formData.append("solutionText", question.solutionText || "");
      formData.append("marks", String(question.marks));
      if (selectedSubjectId) formData.append("subjectId", selectedSubjectId);
      if (question.chapterIds && question.chapterIds.length > 0) {
        formData.append("chapterIds", JSON.stringify(question.chapterIds));
      }
      if (question.type === "MCQ" && question.options) {
        formData.append("options", JSON.stringify(question.options));
        formData.append("correctOption", String(question.correctOption ?? 0));
      }
      if (question.type === "FILL_IN_THE_BLANKS" && question.correctAnswers) {
        formData.append("correctAnswers", JSON.stringify(question.correctAnswers));
        formData.append("caseSensitive", String(question.caseSensitive ?? false));
      }
      if (question.questionImage instanceof File) {
        formData.append("questionImage", question.questionImage);
      }
      if (question.solutionImage instanceof File) {
        formData.append("solutionImage", question.solutionImage);
      }

      await updateBankQuestion(questionId, formData);
      setSuccessMessage("Question updated successfully!");

      setTimeout(() => {
        router.push("/teacher/question-bank");
      }, 1000);
    } catch (err: any) {
      console.error("Failed to update question:", err);
      setError(err?.message || "Failed to update question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const QUESTION_TYPES = [
    { value: "TEXT", label: "Text" },
    { value: "MCQ", label: "MCQ" },
    { value: "FILL_IN_THE_BLANKS", label: "FIB" },
  ];

  const DIFFICULTY_LEVELS = [
    { value: "EASY", label: "Easy" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
  ];

  if (isFetching || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Edit Question</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Update your question in the bank</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex flex-nowrap items-center gap-x-8 sm:gap-x-10 mb-6 pb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex items-center gap-x-4 shrink-0">
              {QUESTION_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="questionType"
                    value={type.value}
                    checked={question.type === type.value}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                  />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-x-4 shrink-0">
              <span className="text-xs font-medium text-gray-600">Difficulty:</span>
              {DIFFICULTY_LEVELS.map((level) => (
                <label key={level.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level.value}
                    checked={question.difficulty === level.value}
                    onChange={(e) => handleFieldChange("difficulty", e.target.value)}
                    className="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                  />
                  <span className="text-sm font-medium text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-gray-600">Marks:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={question.marks}
                onChange={(e) => handleFieldChange("marks", Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#6366f1] text-center"
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Question</h3>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Categorize Question (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Standard</label>
                <select
                  value={selectedStandardId}
                  onChange={(e) => handleStandardChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                >
                  <option value="">Select Standard</option>
                  {standards.map((std) => (
                    <option key={std.id} value={std.id}>{std.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={!selectedStandardId || isLoadingContent}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Chapter(s)</label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white p-2 space-y-2">
                  {!selectedSubjectId ? (
                    <p className="text-xs text-gray-400 py-2">Select subject first</p>
                  ) : chapters.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No chapters</p>
                  ) : (
                    chapters.map((ch) => (
                      <label key={ch.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={(question.chapterIds || []).includes(ch.id)}
                          onChange={() => handleChapterToggle(ch.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <span className="text-sm text-gray-700">{ch.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">QUESTION</label>
            <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "text")} />
            <textarea
              ref={questionTextRef}
              value={question.text}
              onChange={(e) => handleFieldChange("text", e.target.value)}
              placeholder="Distinguish between boiling and evaporation."
              rows={6}
              className="w-full mt-3 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400"
            />
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <button
                type="button"
                onClick={() => questionImageInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                {question.questionImage instanceof File ? "Image attached ✓" : "Attach Image"}
              </button>
              <button
                type="button"
                onClick={() => ocrQuestionInputRef.current?.click()}
                disabled={isOcrLoadingQuestion}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors disabled:opacity-50"
              >
                {isOcrLoadingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isOcrLoadingQuestion ? "Scanning..." : "Scan from Image (OCR)"}
              </button>
              <button
                type="button"
                onClick={() => setShowQuestionPreview(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Question (Maths)
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
            {questionPreviewUrl && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Question Image Preview</p>
                <div className="relative inline-block">
                  <img
                    src={questionPreviewUrl}
                    alt="Question"
                    className="max-h-48 rounded-lg border border-gray-200 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleFieldChange("questionImage", null)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">SOLUTION</label>
            <MathSymbolsToolbar onInsertSymbol={(symbol) => insertSymbolIntoField(symbol, "solutionText")} />
            <textarea
              ref={solutionTextRef}
              value={question.solutionText || ""}
              onChange={(e) => handleFieldChange("solutionText", e.target.value)}
              placeholder="Occurs throughout the liquid. Occurs only at the surface..."
              rows={6}
              className="w-full mt-3 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400"
            />
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => solutionImageInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                {question.solutionImage instanceof File ? "Image attached ✓" : "Attach Image"}
              </button>
              <button
                type="button"
                onClick={() => ocrSolutionInputRef.current?.click()}
                disabled={isOcrLoadingSolution}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors disabled:opacity-50"
              >
                {isOcrLoadingSolution ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isOcrLoadingSolution ? "Scanning..." : "Scan from Image (OCR)"}
              </button>
              <button
                type="button"
                onClick={() => setShowSolutionPreview(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Solution (Maths)
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
            {solutionPreviewUrl && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Solution Image Preview</p>
                <div className="relative inline-block">
                  <img
                    src={solutionPreviewUrl}
                    alt="Solution"
                    className="max-h-48 rounded-lg border border-gray-200 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleFieldChange("solutionImage", null)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white border border-purple-200 text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "px-6 py-3 bg-[#6366f1] text-white font-bold rounded-lg hover:bg-[#4f46e5] transition-colors flex items-center gap-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              Update Question
            </button>
          </div>
        </form>
      </div>

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
