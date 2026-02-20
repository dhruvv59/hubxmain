"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Paperclip, FileText, Camera, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { TEACHER_QUESTION_BANK_ENDPOINTS } from "@/lib/api-config";
import { MathSymbolsToolbar } from "@/components/teacher/question-bank/MathSymbolsToolbar";
import { MathPreviewModal } from "@/components/teacher/questions/MathPreviewModal";
import { teacherContentService, type Standard, type Subject, type Chapter } from "@/services/teacher-content";
import type { QuestionBankQuestion, CreateBankQuestionsResponse } from "@/types/question-bank";
import { ocrService } from "@/services/ocr";

export default function CreateQuestionBankPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [question, setQuestion] = useState<QuestionBankQuestion>({
    id: 1,
    type: "TEXT",
    difficulty: "INTERMEDIATE",
    text: "",
    marks: 1,
    explanation: "",
    solutionText: "",
    questionImage: null,
    solutionImage: null,
  });
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
    if (question.questionImage instanceof File) {
      const url = URL.createObjectURL(question.questionImage);
      setQuestionPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setQuestionPreviewUrl(typeof question.questionImage === "string" ? question.questionImage : null);
    return () => {};
  }, [question.questionImage]);

  useEffect(() => {
    if (question.solutionImage instanceof File) {
      const url = URL.createObjectURL(question.solutionImage);
      setSolutionPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setSolutionPreviewUrl(typeof question.solutionImage === "string" ? question.solutionImage : null);
    return () => {};
  }, [question.solutionImage]);

  // Fetch standards on mount
  useEffect(() => {
    const fetchStandards = async () => {
      setIsLoadingContent(true);
      try {
        const data = await teacherContentService.getStandards();
        setStandards(data);
      } catch (err) {
        console.error("Failed to fetch standards:", err);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchStandards();
  }, []);

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
    setQuestion(prev => ({ ...prev, subjectId: undefined, chapterIds: [] }));
    setChapters([]);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setQuestion(prev => ({ ...prev, subjectId: subjectId || undefined, chapterIds: [] }));
  };

  const handleChapterToggle = (chapterId: string) => {
    setQuestion(prev => {
      const current = prev.chapterIds || [];
      const updated = current.includes(chapterId)
        ? current.filter(id => id !== chapterId)
        : [...current, chapterId];
      return { ...prev, chapterIds: updated };
    });
  };

  const handleFieldChange = (field: keyof QuestionBankQuestion, value: any) => {
    setQuestion({ ...question, [field]: value });
  };

  // When type changes to MCQ, init options; when changing away, clear
  const handleTypeChange = (newType: string) => {
    if (newType === "MCQ") {
      setQuestion(prev => ({
        ...prev,
        type: newType as any,
        options: prev.options && prev.options.length >= 2 ? prev.options : ["", "", "", ""],
        correctOption: prev.correctOption ?? 0,
      }));
    } else if (newType === "FILL_IN_THE_BLANKS") {
      setQuestion(prev => ({
        ...prev,
        type: newType as any,
        options: undefined,
        correctOption: undefined,
        correctAnswers: prev.correctAnswers && prev.correctAnswers.length > 0 ? prev.correctAnswers : [[""]],
        caseSensitive: prev.caseSensitive ?? false,
      }));
    } else {
      setQuestion(prev => ({
        ...prev,
        type: newType as any,
        options: undefined,
        correctOption: undefined,
        correctAnswers: undefined,
        caseSensitive: undefined,
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const opts = [...(question.options || ["", "", "", ""])];
    opts[index] = value;
    setQuestion(prev => ({ ...prev, options: opts }));
  };

  const handleCorrectOptionChange = (index: number) => {
    setQuestion(prev => ({ ...prev, correctOption: index }));
  };

  const handleBlankChange = (index: number, value: string) => {
    setQuestion(prev => {
      const arr = [...(prev.correctAnswers || [[""]])];
      arr[index] = [value];
      return { ...prev, correctAnswers: arr };
    });
  };

  const handleAddBlank = () => {
    setQuestion(prev => ({
      ...prev,
      correctAnswers: [...(prev.correctAnswers || [[""]]), [""]],
    }));
  };

  const handleRemoveBlank = (index: number) => {
    setQuestion(prev => {
      const arr = [...(prev.correctAnswers || [[""]])];
      if (arr.length <= 1) return prev;
      arr.splice(index, 1);
      return { ...prev, correctAnswers: arr };
    });
  };

  const insertSymbolIntoField = (symbol: string, field: "text" | "solutionText") => {
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
    if (e.target.files && e.target.files[0]) {
      handleFieldChange(field, e.target.files[0]);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate question
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

    if (question.type === "MCQ") {
      const opts = question.options || [];
      const nonEmptyOpts = opts.filter(o => o?.trim());
      if (nonEmptyOpts.length < 2) {
        setError("MCQ must have at least 2 options with text");
        return;
      }
      const correctIdx = question.correctOption ?? 0;
      const selectedOpt = opts[correctIdx]?.trim();
      if (!selectedOpt) {
        setError("Please select the correct answer for MCQ");
        return;
      }
      if (!nonEmptyOpts.includes(selectedOpt)) {
        setError("Selected correct option must have text");
        return;
      }
    }

    if (question.type === "FILL_IN_THE_BLANKS") {
      const blanks = question.correctAnswers || [];
      if (blanks.length === 0) {
        setError("Fill in the blanks must have at least one blank");
        return;
      }
      const hasEmpty = blanks.some(b => !Array.isArray(b) || !b[0]?.trim());
      if (hasEmpty) {
        setError("Each blank must have a correct answer");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Build FormData
      const formData = new FormData();

      let questionData: Record<string, any> = {
        text: question.text,
        questionText: question.text,
        type: question.type,
        difficulty: question.difficulty,
        marks: question.marks,
        explanation: question.explanation || "",
        solutionText: question.solutionText || "",
        subjectId: selectedSubjectId || question.subjectId || undefined,
        chapterIds: question.chapterIds && question.chapterIds.length > 0 ? question.chapterIds : undefined,
        correctAnswers: question.type === "FILL_IN_THE_BLANKS"
          ? (question.correctAnswers || [])
              .filter(b => Array.isArray(b) && b[0]?.trim())
              .map(b => [b[0].trim()])
          : undefined,
        caseSensitive: question.type === "FILL_IN_THE_BLANKS" ? question.caseSensitive : undefined,
      };
      if (question.type === "MCQ" && question.options) {
        const nonEmptyOpts = question.options.map(o => o?.trim() || "").filter(Boolean);
        const correctText = question.options[question.correctOption ?? 0]?.trim();
        questionData.options = nonEmptyOpts;
        questionData.correctOption = correctText ? nonEmptyOpts.indexOf(correctText) : 0;
      }

      // Backend expects questions as JSON string in FormData
      formData.append("questions", JSON.stringify([questionData]));

      // Add image files with proper naming convention
      if (question.questionImage instanceof File) {
        formData.append("questionImage_0", question.questionImage);
      }
      if (question.solutionImage instanceof File) {
        formData.append("solutionImage_0", question.solutionImage);
      }

      // Call batch create API (don't set Content-Type - browser sets it with boundary for FormData)
      const response = await http.post<{ success: boolean; message: string; data: CreateBankQuestionsResponse }>(
        TEACHER_QUESTION_BANK_ENDPOINTS.batchCreate(),
        formData
      );

      if (response.data.successful > 0) {
        setSuccessMessage(`Question created successfully!`);
        
        // Redirect after short delay to question bank page
        setTimeout(() => {
          router.push("/teacher/question-bank");
        }, 1000);
      } else {
        setError("Failed to create question. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to create question:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create question. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const QUESTION_TYPES = [
    { value: "TEXT", label: "Text" },
    { value: "MCQ", label: "MCQ" },
    { value: "FILL_IN_THE_BLANKS", label: "Fill in the Blanks" },
  ];

  const DIFFICULTY_LEVELS = [
    { value: "EASY", label: "Easy" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
  ];

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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Create Question</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add a question to your question bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Top Configuration Bar - ek line ma, proper spacing */}
          <div className="flex flex-nowrap items-center gap-x-8 sm:gap-x-10 mb-6 pb-6 border-b border-gray-200 overflow-x-auto">
            {/* Question 1 */}
            {/* <span className="text-sm font-bold text-gray-700 shrink-0">Question 1</span> */}

            {/* Question Type */}
            <div className="flex items-center gap-x-4 shrink-0">
              {QUESTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="questionType"
                    value={type.value}
                    checked={question.type === type.value}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                  />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-x-4 shrink-0">
              <span className="text-xs font-medium text-gray-600">Difficulty:</span>
              {DIFFICULTY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
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

            {/* Marks */}
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

          {/* Add Question Manually Heading */}
          <h3 className="text-lg font-bold text-gray-900 mb-6">Add Question Manually</h3>

          {/* Standard, Subject, Chapter Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Categorize Question (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Standard */}
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

              {/* Subject */}
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

              {/* Chapter - Multi-select */}
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

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* QUESTION Section */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
              QUESTION
              {question.type === "FILL_IN_THE_BLANKS" && (
                <span className="ml-2 font-normal text-[#6366f1]">
                  (Use _____ or [blank] to indicate blank spaces)
                </span>
              )}
            </label>
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
            {/* MCQ Options - shown when type is MCQ */}
            {question.type === "MCQ" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">MCQ Options (min 2 required)</h4>
                <p className="text-xs text-gray-500 mb-3">Add at least 2 options and select the correct answer</p>
                <div className="space-y-3">
                  {((question.options || ["", "", "", ""]).slice(0, 6)).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={question.correctOption === idx}
                        onChange={() => handleCorrectOptionChange(idx)}
                        className="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                        title="Correct answer"
                      />
                      <span className="text-sm font-medium text-gray-600 w-6">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the Blanks - shown when type is FILL_IN_THE_BLANKS */}
            {question.type === "FILL_IN_THE_BLANKS" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Correct Answers for Blanks</h4>
                  <button
                    type="button"
                    onClick={handleAddBlank}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6366f1] hover:text-[#4f46e5]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Blank
                  </button>
                </div>
                <div className="space-y-3">
                  {((question.correctAnswers || [[""]]).map((blank, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700 w-20 shrink-0">Blank {idx + 1}:</span>
                      <input
                        type="text"
                        value={Array.isArray(blank) ? blank[0] || "" : ""}
                        onChange={(e) => handleBlankChange(idx, e.target.value)}
                        placeholder={`Correct answer for blank ${idx + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                      />
                      {((question.correctAnswers || []).length > 1) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlank(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove blank"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )))}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">Provide correct answers in the order they appear in the question</p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.caseSensitive ?? false}
                    onChange={(e) => handleFieldChange("caseSensitive", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]"
                  />
                  <span className="text-sm text-gray-700">Case sensitive (e.g. Paris ≠ paris)</span>
                </label>
              </div>
            )}

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

          {/* SOLUTION Section */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
              SOLUTION
            </label>
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

          {/* Bottom Action Buttons */}
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
              Add Question
            </button>
          </div>
        </form>
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
