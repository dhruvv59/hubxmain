"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http-client";
import { TEACHER_QUESTION_BANK_ENDPOINTS } from "@/lib/api-config";

export default function CreateQuestionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [questionImage, setQuestionImage] = useState<File | null>(null);
    const [solutionImage, setSolutionImage] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        text: "",
        type: "MCQ",
        difficulty: "INTERMEDIATE",
        marks: 1,
        correctAnswer: "",
        explanation: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "marks" ? parseInt(value) : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "question" | "solution") => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === "question") {
                setQuestionImage(file);
            } else {
                setSolutionImage(file);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.text.trim()) {
            alert("Please enter a question");
            return;
        }

        if (!formData.correctAnswer.trim()) {
            alert("Please enter the correct answer");
            return;
        }

        setIsLoading(true);
        try {
            const form = new FormData();
            form.append("text", formData.text);
            form.append("type", formData.type);
            form.append("difficulty", formData.difficulty);
            form.append("marks", formData.marks.toString());
            form.append("correctAnswer", formData.correctAnswer);
            form.append("explanation", formData.explanation);

            if (questionImage) {
                form.append("questionImage", questionImage);
            }
            if (solutionImage) {
                form.append("solutionImage", solutionImage);
            }

            await http.post(TEACHER_QUESTION_BANK_ENDPOINTS.create(), form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Question created successfully!");
            router.push("/teacher/question-bank");
        } catch (error: any) {
            console.error("Failed to create question:", error);
            alert(error.response?.data?.message || "Failed to create question. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Question</h1>
                    <p className="text-gray-500 mt-1">Add a new question to your question bank</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Text */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Question Text *</label>
                    <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        placeholder="Enter the question text..."
                        rows={4}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                        required
                    />
                </div>

                {/* Question Image */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Question Image (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "question")}
                            className="hidden"
                            id="question-image-input"
                        />
                        <label htmlFor="question-image-input" className="flex flex-col items-center gap-2 cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                                {questionImage ? questionImage.name : "Click to upload question image"}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Question Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Type */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Question Type *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                        >
                            <option value="MCQ">MCQ</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="LONG_ANSWER">Long Answer</option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="FILL_BLANK">Fill Blank</option>
                        </select>
                    </div>

                    {/* Difficulty */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Difficulty *</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                        >
                            <option value="EASY">Easy</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>
                    </div>

                    {/* Marks */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Marks *</label>
                        <input
                            type="number"
                            name="marks"
                            value={formData.marks}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                        />
                    </div>
                </div>

                {/* Correct Answer */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Correct Answer *</label>
                    <input
                        type="text"
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        placeholder="Enter the correct answer..."
                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                        required
                    />
                </div>

                {/* Explanation */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Explanation (Optional)</label>
                    <textarea
                        name="explanation"
                        value={formData.explanation}
                        onChange={handleInputChange}
                        placeholder="Provide a detailed explanation for the answer..."
                        rows={4}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                    />
                </div>

                {/* Solution Image */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Solution Image (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "solution")}
                            className="hidden"
                            id="solution-image-input"
                        />
                        <label htmlFor="solution-image-input" className="flex flex-col items-center gap-2 cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                                {solutionImage ? solutionImage.name : "Click to upload solution image"}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors text-white",
                            isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#6366f1] hover:bg-[#4f4fbe]"
                        )}
                    >
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isLoading ? "Creating..." : "Create Question"}
                    </button>
                </div>
            </form>
        </div>
    );
}
