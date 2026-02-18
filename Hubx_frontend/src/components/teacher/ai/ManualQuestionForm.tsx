"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Paperclip, HelpCircle, Loader2, Plus, X, Wand2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionType, Difficulty, Question, MCQOption, FillInTheBlank } from "@/types/generate-paper";
import { ocrService } from "@/services/ocr";
import katex from "katex";

interface ManualQuestionFormProps {
    questionNumber: number;
    onAdd: (question: Question) => void;
    onCancel: () => void;
    onOpenBank?: () => void;
    onDone?: () => void;
    isSubmitting?: boolean;
    showDoneButton?: boolean;
}

export interface ManualQuestionFormRef {
    resetForm: () => void;
}

export const ManualQuestionForm = forwardRef<ManualQuestionFormRef, ManualQuestionFormProps>(
    function ManualQuestionFormComponent({ questionNumber, onAdd, onCancel, onOpenBank, onDone, isSubmitting, showDoneButton }, ref) {
        const [type, setType] = useState<QuestionType>("Text");
        const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
        const [content, setContent] = useState("");
        const [solution, setSolution] = useState("");
        const [showQuestionPreview, setShowQuestionPreview] = useState(false);
        const [showSolutionPreview, setShowSolutionPreview] = useState(false);

        // Image state
        const [questionImage, setQuestionImage] = useState<File | null>(null);
        const [solutionImage, setSolutionImage] = useState<File | null>(null);
        const [questionImagePreview, setQuestionImagePreview] = useState<string>("");
        const [solutionImagePreview, setSolutionImagePreview] = useState<string>("");

        // OCR state
        const [isOcrProcessing, setIsOcrProcessing] = useState<"question" | "solution" | null>(null);
        const [ocrError, setOcrError] = useState<string>("");

        // Refs for inserting symbols at cursor position
        const questionRef = useRef<HTMLTextAreaElement | null>(null);
        const solutionRef = useRef<HTMLTextAreaElement | null>(null);
        const questionImageInputRef = useRef<HTMLInputElement | null>(null);
        const solutionImageInputRef = useRef<HTMLInputElement | null>(null);

        const MATH_SYMBOLS = ["²", "³", "±", "×", "÷", "≤", "≥", "√", "π"];

        // MCQ specific state
        const [options, setOptions] = useState<MCQOption[]>([
            { id: "opt-1", text: "", isCorrect: false },
            { id: "opt-2", text: "", isCorrect: false },
            { id: "opt-3", text: "", isCorrect: false },
            { id: "opt-4", text: "", isCorrect: false },
        ]);

        // Fill in the Blanks specific state
        const [blanks, setBlanks] = useState<FillInTheBlank[]>([
            { id: "blank-1", position: 0, correctAnswer: "", placeholder: "Answer 1" }
        ]);

        // Reset type-specific fields when type changes
        useEffect(() => {
            if (type === "MCQ") {
                // Reset MCQ options
                setOptions([
                    { id: "opt-1", text: "", isCorrect: false },
                    { id: "opt-2", text: "", isCorrect: false },
                    { id: "opt-3", text: "", isCorrect: false },
                    { id: "opt-4", text: "", isCorrect: false },
                ]);
            } else if (type === "Fill in the Blanks") {
                // Reset blanks
                setBlanks([
                    { id: "blank-1", position: 0, correctAnswer: "", placeholder: "Answer 1" }
                ]);
            }
        }, [type]);

        // Expose reset function to parent component
        useImperativeHandle(ref, () => ({
            resetForm: () => {
                setType("Text");
                setDifficulty("Intermediate");
                setContent("");
                setSolution("");
                setShowQuestionPreview(false);
                setShowSolutionPreview(false);
                setQuestionImage(null);
                setSolutionImage(null);
                setQuestionImagePreview("");
                setSolutionImagePreview("");
                setIsOcrProcessing(null);
                setOcrError("");
                setOptions([
                    { id: "opt-1", text: "", isCorrect: false },
                    { id: "opt-2", text: "", isCorrect: false },
                    { id: "opt-3", text: "", isCorrect: false },
                    { id: "opt-4", text: "", isCorrect: false },
                ]);
                setBlanks([
                    { id: "blank-1", position: 0, correctAnswer: "", placeholder: "Answer 1" }
                ]);
            }
        }), []);

        const handleTypeChange = (newType: QuestionType) => {
            setType(newType);
            // Clear content when switching types to avoid confusion
            setContent("");
            setSolution("");
        };

        const handleAddOption = () => {
            const newOption: MCQOption = {
                id: `opt-${Date.now()}`,
                text: "",
                isCorrect: false
            };
            setOptions([...options, newOption]);
        };

        const handleRemoveOption = (id: string) => {
            if (options.length <= 2) return; // Minimum 2 options required
            setOptions(options.filter(opt => opt.id !== id));
        };

        const handleOptionChange = (id: string, text: string) => {
            setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
        };

        const handleCorrectAnswerChange = (id: string) => {
            // Only one correct answer for MCQ
            setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id })));
        };

        const handleAddBlank = () => {
            const newBlank: FillInTheBlank = {
                id: `blank-${Date.now()}`,
                position: blanks.length,
                correctAnswer: "",
                placeholder: `Answer ${blanks.length + 1}`
            };
            setBlanks([...blanks, newBlank]);
        };

        const handleRemoveBlank = (id: string) => {
            if (blanks.length <= 1) return; // Minimum 1 blank required
            setBlanks(blanks.filter(blank => blank.id !== id));
        };

        const handleBlankChange = (id: string, correctAnswer: string) => {
            setBlanks(blanks.map(blank => blank.id === id ? { ...blank, correctAnswer } : blank));
        };

        const insertSymbol = (target: "question" | "solution", symbol: string) => {
            const textarea = target === "question" ? questionRef.current : solutionRef.current;
            if (!textarea) return;

            const currentValue = target === "question" ? content : solution;
            const start = textarea.selectionStart ?? currentValue.length;
            const end = textarea.selectionEnd ?? currentValue.length;

            const newValue = currentValue.slice(0, start) + symbol + currentValue.slice(end);

            if (target === "question") {
                setContent(newValue);
            } else {
                setSolution(newValue);
            }

            // Restore cursor position after the inserted symbol
            requestAnimationFrame(() => {
                const pos = start + symbol.length;
                textarea.selectionStart = textarea.selectionEnd = pos;
                textarea.focus();
            });
        };

        const renderMath = (value: string) => {
            if (!value.trim()) return null;
            try {
                const html = katex.renderToString(value, {
                    throwOnError: false,
                    displayMode: true,
                });
                return (
                    <div
                        className="p-4 rounded-lg bg-white border border-dashed border-gray-300 mt-3 overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            } catch (e) {
                return (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 mt-3">
                        Could not render math. Please check your LaTeX syntax.
                    </div>
                );
            }
        };

        const handleQuestionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validate file type (image, PDF, or ODF)
                const isImage = file.type.startsWith('image/');
                const isPdf = file.type === 'application/pdf';
                const isOdf = file.type.startsWith('application/vnd.oasis.opendocument');

                if (!isImage && !isPdf && !isOdf) {
                    alert('Please select a valid image, PDF, or ODF file');
                    return;
                }
                // Validate file size (10MB max for docs, 5MB for images)
                const maxSize = (isPdf || isOdf) ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert(`File size must be less than ${(isPdf || isOdf) ? '10MB' : '5MB'}`);
                    return;
                }
                setQuestionImage(file);

                // For images, show preview; for PDFs/ODF, show file info
                if (isImage) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setQuestionImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                } else if (isPdf) {
                    // For PDFs, show a placeholder preview
                    setQuestionImagePreview(`pdf:${file.name}`);
                } else if (isOdf) {
                    // For ODF files, show a placeholder preview
                    setQuestionImagePreview(`odf:${file.name}`);
                }
            }
        };

        const handleSolutionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                // Validate file type (image, PDF, or ODF)
                const isImage = file.type.startsWith('image/');
                const isPdf = file.type === 'application/pdf';
                const isOdf = file.type.startsWith('application/vnd.oasis.opendocument');

                if (!isImage && !isPdf && !isOdf) {
                    alert('Please select a valid image, PDF, or ODF file');
                    return;
                }
                // Validate file size (10MB max for docs, 5MB for images)
                const maxSize = (isPdf || isOdf) ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert(`File size must be less than ${(isPdf || isOdf) ? '10MB' : '5MB'}`);
                    return;
                }
                setSolutionImage(file);

                // For images, show preview; for PDFs/ODF, show file info
                if (isImage) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setSolutionImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                } else if (isPdf) {
                    // For PDFs, show a placeholder preview
                    setSolutionImagePreview(`pdf:${file.name}`);
                } else if (isOdf) {
                    // For ODF files, show a placeholder preview
                    setSolutionImagePreview(`odf:${file.name}`);
                }
            }
        };

        const removeQuestionImage = () => {
            setQuestionImage(null);
            setQuestionImagePreview("");
            if (questionImageInputRef.current) {
                questionImageInputRef.current.value = "";
            }
        };

        const removeSolutionImage = () => {
            setSolutionImage(null);
            setSolutionImagePreview("");
            if (solutionImageInputRef.current) {
                solutionImageInputRef.current.value = "";
            }
        };

        const extractTextFromQuestionImage = async () => {
            if (!questionImage) return;

            setIsOcrProcessing("question");
            setOcrError("");
            try {
                const result = await ocrService.extractText(questionImage);
                if (result.text) {
                    // Replace content with extracted text (can be modified by user)
                    setContent(result.text);
                } else {
                    setOcrError("No text could be extracted from the image");
                }
            } catch (error: any) {
                console.error("OCR failed:", error);
                setOcrError(error.message || "Failed to extract text from image");
            } finally {
                setIsOcrProcessing(null);
            }
        };

        const extractTextFromSolutionImage = async () => {
            if (!solutionImage) return;

            setIsOcrProcessing("solution");
            setOcrError("");
            try {
                const result = await ocrService.extractText(solutionImage);
                if (result.text) {
                    // Replace solution with extracted text (can be modified by user)
                    setSolution(result.text);
                } else {
                    setOcrError("No text could be extracted from the image");
                }
            } catch (error: any) {
                console.error("OCR failed:", error);
                setOcrError(error.message || "Failed to extract text from image");
            } finally {
                setIsOcrProcessing(null);
            }
        };

        const validateForm = (): boolean => {
            if (!content.trim()) return false;

            if (type === "MCQ") {
                // Count non-empty options
                const nonEmptyOptions = options.filter(opt => opt.text.trim());

                // Check if at least 2-6 options have text
                if (nonEmptyOptions.length < 2) return false;
                if (nonEmptyOptions.length > 6) return false;

                // Check if at least one option is marked as correct
                if (!options.some(opt => opt.isCorrect)) return false;
            }

            if (type === "Fill in the Blanks") {
                // Check if all blanks have correct answers
                if (blanks.some(blank => !blank.correctAnswer.trim())) return false;
            }

            return true;
        };

        const handleAdd = () => {
            const questionData: Question & { questionImage?: File; solutionImage?: File } = {
                id: `q-${Date.now()}`,
                type,
                difficulty,
                content,
                solution
            };

            // Add image files if they exist
            if (questionImage) {
                questionData.questionImage = questionImage;
            }
            if (solutionImage) {
                questionData.solutionImage = solutionImage;
            }

            // Add type-specific data
            if (type === "MCQ") {
                questionData.options = options;
            } else if (type === "Fill in the Blanks") {
                questionData.blanks = blanks;
            }

            onAdd(questionData);
        };

        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-5 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-gray-900">Question {questionNumber}</span>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="qType"
                                    checked={type === "Text"}
                                    onChange={() => handleTypeChange("Text")}
                                    className="w-4 h-4 text-[#5b5bd6] border-gray-300 focus:ring-[#5b5bd6]"
                                />
                                <span className={cn("text-xs font-bold", type === "Text" ? "text-gray-900" : "text-gray-500")}>Text Question</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="qType"
                                    checked={type === "MCQ"}
                                    onChange={() => handleTypeChange("MCQ")}
                                    className="w-4 h-4 text-[#5b5bd6] border-gray-300 focus:ring-[#5b5bd6]"
                                />
                                <span className={cn("text-xs font-bold", type === "MCQ" ? "text-gray-900" : "text-gray-500")}>MCQ</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="qType"
                                    checked={type === "Fill in the Blanks"}
                                    onChange={() => handleTypeChange("Fill in the Blanks")}
                                    className="w-4 h-4 text-[#5b5bd6] border-gray-300 focus:ring-[#5b5bd6]"
                                />
                                <span className={cn("text-xs font-bold", type === "Fill in the Blanks" ? "text-gray-900" : "text-gray-500")}>Fill in the Blanks</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500">Difficulty Level</span>
                        <div className="flex items-center gap-4">
                            {(["Easy", "Intermediate", "Advanced"] as Difficulty[]).map((level) => (
                                <label key={level} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        checked={difficulty === level}
                                        onChange={() => setDifficulty(level)}
                                        className="w-4 h-4 text-[#5b5bd6] border-gray-300 focus:ring-[#5b5bd6]"
                                    />
                                    <span className={cn("text-xs font-bold", difficulty === level ? "text-gray-900" : "text-gray-500")}>{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8 bg-[#fdfcff]/50">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Add Question Manually</h3>

                    {/* Question Section */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 mb-2">
                            Question
                            {type === "Fill in the Blanks" && (
                                <span className="ml-2 text-[#5b5bd6] font-normal">
                                    (Use _____ or [blank] to indicate blank spaces in your question)
                                </span>
                            )}
                        </label>
                        {/* Simple math symbol palette for question */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[11px] font-semibold text-gray-500">Math symbols:</span>
                            {MATH_SYMBOLS.map((symbol) => (
                                <button
                                    key={symbol}
                                    type="button"
                                    onClick={() => insertSymbol("question", symbol)}
                                    className="px-2 py-1 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                        <textarea
                            ref={questionRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 resize-none bg-white placeholder:text-gray-400"
                            placeholder={
                                type === "Text" ? "Distinguish between boiling and evaporation." :
                                    type === "MCQ" ? "What is the capital of France?" :
                                        "The capital of France is _____ and it is located on the _____ river."
                            }
                        />
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                className="text-xs font-bold text-[#5b5bd6] hover:underline"
                                onClick={() => setShowQuestionPreview(prev => !prev)}
                            >
                                {showQuestionPreview ? "Hide Question Preview" : "View Question (Math Preview)"}
                            </button>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => questionImageInputRef.current?.click()}
                                    className="flex items-center gap-1.5 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5]"
                                >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    {questionImage ? "Change Image" : "Attach Image for question"}
                                </button>
                                <input
                                    ref={questionImageInputRef}
                                    type="file"
                                    accept="image/*,.pdf,.odt,.ods,.odp,.odg"
                                    onChange={handleQuestionImageSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={onOpenBank}
                                    className="flex items-center gap-1.5 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5]"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    Add from Question Bank
                                </button>
                            </div>
                        </div>
                        {questionImagePreview && (
                            <div className="mt-3">
                                <div className="relative inline-block">
                                    {questionImagePreview.startsWith('pdf:') || questionImagePreview.startsWith('odf:') ? (
                                        <div className="max-w-xs px-6 py-8 rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center gap-2">
                                            <div className="text-3xl">📄</div>
                                            <p className="text-xs font-bold text-gray-700 text-center break-words">
                                                {questionImagePreview.replace('pdf:', '').replace('odf:', '')}
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                {questionImagePreview.startsWith('pdf:') ? 'PDF' : 'ODF'} uploaded
                                            </p>
                                        </div>
                                    ) : (
                                        <img
                                            src={questionImagePreview}
                                            alt="Question preview"
                                            className="max-w-xs max-h-64 rounded-lg border border-gray-200"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeQuestionImage}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        title="Remove image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={extractTextFromQuestionImage}
                                    disabled={isOcrProcessing === "question"}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-xs font-bold text-[#5b5bd6] hover:from-purple-100 hover:to-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isOcrProcessing === "question" ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Extracting text...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-3.5 h-3.5" />
                                            Extract Text with AI (OCR)
                                        </>
                                    )}
                                </button>
                                {ocrError && isOcrProcessing === "question" && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                                        {ocrError}
                                    </div>
                                )}
                            </div>
                        )}
                        {showQuestionPreview && (
                            <div className="mt-3">
                                <p className="text-[11px] text-gray-500 mb-1">
                                    Write LaTeX for maths (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">\frac{"{a}"}{"{b}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">x^2</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">\sqrt{"{x}"}</code>)
                                </p>
                                {renderMath(content)}
                            </div>
                        )}
                    </div>

                    {/* MCQ Options Section */}
                    {type === "MCQ" && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-xs font-bold text-gray-500">Options</label>
                                <button
                                    onClick={handleAddOption}
                                    className="flex items-center gap-1.5 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5]"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Option
                                </button>
                            </div>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={option.isCorrect}
                                            onChange={() => handleCorrectAnswerChange(option.id)}
                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 flex-shrink-0"
                                            title="Mark as correct answer"
                                        />
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 bg-white placeholder:text-gray-400"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        {options.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveOption(option.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                title="Remove option"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Select the radio button next to the correct option
                            </p>
                        </div>
                    )}

                    {/* Fill in the Blanks Section */}
                    {type === "Fill in the Blanks" && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-xs font-bold text-gray-500">Correct Answers for Blanks</label>
                                <button
                                    onClick={handleAddBlank}
                                    className="flex items-center gap-1.5 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5]"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Blank
                                </button>
                            </div>
                            <div className="space-y-3">
                                {blanks.map((blank, index) => (
                                    <div key={blank.id} className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-700 w-20 flex-shrink-0">
                                            Blank {index + 1}:
                                        </span>
                                        <input
                                            type="text"
                                            value={blank.correctAnswer}
                                            onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 bg-white placeholder:text-gray-400"
                                            placeholder={`Correct answer for blank ${index + 1}`}
                                        />
                                        {blanks.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveBlank(blank.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                title="Remove blank"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Provide correct answers in the order they appear in the question
                            </p>
                        </div>
                    )}

                    {/* Solution Section */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 mb-2">
                            Solution {type !== "Text" && <span className="font-normal">(Optional for {type})</span>}
                        </label>
                        {/* Simple math symbol palette for solution */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[11px] font-semibold text-gray-500">Math symbols:</span>
                            {MATH_SYMBOLS.map((symbol) => (
                                <button
                                    key={symbol}
                                    type="button"
                                    onClick={() => insertSymbol("solution", symbol)}
                                    className="px-2 py-1 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                        <textarea
                            ref={solutionRef}
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 resize-none bg-white placeholder:text-gray-400"
                            placeholder={
                                type === "Text" ? "Occurs throughout the liquid. Occurs only at the surface..." :
                                    type === "MCQ" ? "Explanation: Paris is the capital and largest city of France..." :
                                        "Explanation: Paris is the capital of France, situated on the Seine river..."
                            }
                        />
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                className="text-xs font-bold text-[#5b5bd6] hover:underline"
                                onClick={() => setShowSolutionPreview(prev => !prev)}
                            >
                                {showSolutionPreview ? "Hide Solution Preview" : "View Solution (Math Preview)"}
                            </button>
                            <button
                                type="button"
                                onClick={() => solutionImageInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#5b5bd6] hover:text-[#4f46e5]"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                                {solutionImage ? "Change Image" : "Attach Image for solution"}
                            </button>
                            <input
                                ref={solutionImageInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleSolutionImageSelect}
                                className="hidden"
                            />
                        </div>
                        {solutionImagePreview && (
                            <div className="mt-3">
                                <div className="relative inline-block">
                                    {solutionImagePreview.startsWith('pdf:') || solutionImagePreview.startsWith('odf:') ? (
                                        <div className="max-w-xs px-6 py-8 rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center gap-2">
                                            <div className="text-3xl">📄</div>
                                            <p className="text-xs font-bold text-gray-700 text-center break-words">
                                                {solutionImagePreview.replace('pdf:', '').replace('odf:', '')}
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                {solutionImagePreview.startsWith('pdf:') ? 'PDF' : 'ODF'} uploaded
                                            </p>
                                        </div>
                                    ) : (
                                        <img
                                            src={solutionImagePreview}
                                            alt="Solution preview"
                                            className="max-w-xs max-h-64 rounded-lg border border-gray-200"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeSolutionImage}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        title="Remove image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={extractTextFromSolutionImage}
                                    disabled={isOcrProcessing === "solution"}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-xs font-bold text-[#5b5bd6] hover:from-purple-100 hover:to-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isOcrProcessing === "solution" ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Extracting text...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-3.5 h-3.5" />
                                            Extract Text with AI (OCR)
                                        </>
                                    )}
                                </button>
                                {ocrError && isOcrProcessing === "solution" && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                                        {ocrError}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="h-10 px-8 rounded-lg border border-[#5b5bd6] text-[#5b5bd6] text-xs font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        {showDoneButton ? (
                            <button
                                onClick={onDone}
                                disabled={isSubmitting}
                                className="h-10 px-8 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                <Check className="w-4 h-4" />
                                Done
                            </button>
                        ) : (
                            <button
                                onClick={handleAdd}
                                disabled={!validateForm() || isSubmitting}
                                className="h-10 px-8 rounded-lg bg-[#5b5bd6] text-white text-xs font-bold hover:bg-[#4f46e5] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title={!validateForm() ? "Please fill all required fields" : ""}
                            >
                                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                Add Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);
