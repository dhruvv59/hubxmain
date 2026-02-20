"use client";

import React, { useCallback, useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface BulkUploadFormProps {
    onUpload: (file: File) => void;
    onCancel: () => void;
    isUploading?: boolean;
}

export function BulkUploadForm({ onUpload, onCancel, isUploading }: BulkUploadFormProps) {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    const handleUpload = () => {
        if (file) {
            onUpload(file);
        }
    };

    const handleDownloadTemplate = () => {
        // Create template data with example rows
        const templateData = [
            {
                Question: "Example: What is the capital of India?",
                Solution: "New Delhi",
                Marks: 1,
                Difficulty: "easy"
            },
            {
                Question: "Example: Explain the process of photosynthesis.",
                Solution: "Photosynthesis is the process by which plants use sunlight to synthesize foods from CO2 and water.",
                Marks: 3,
                Difficulty: "medium"
            },
            {
                Question: "Example: Describe the impact of industrialization on society.",
                Solution: "Industrialization led to economic growth, urbanization, and social changes...",
                Marks: 5,
                Difficulty: "hard"
            }
        ];

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");

        // Set column widths for better readability
        ws['!cols'] = [
            { wch: 50 }, // Question
            { wch: 40 }, // Solution
            { wch: 8 },  // Marks
            { wch: 12 }  // Difficulty
        ];

        // Download the file
        XLSX.writeFile(wb, "Question_Bank_Template.xlsx");
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-8 border-b border-gray-100 bg-white">
                <h3 className="text-sm font-bold text-gray-900">Question 0</h3>
            </div>

            <div className="p-8 bg-[#fdfcff] flex-1">
                <div className="bg-[#f5f3ff] rounded-xl p-8 border border-[#ebe5ff] h-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-6">Bulk Upload Questions</h3>

                    <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-[#ef4444]">File Format Requirements:</p>
                        <p className="text-xs font-medium text-gray-500">Columns: Question, Solution, Marks, Difficulty</p>
                        <p className="text-xs font-medium text-gray-500">Difficulty values: easy, medium, or hard</p>
                        <p className="text-xs font-medium text-gray-500">Supported formats: .xlsx, .xls, .csv</p>
                    </div>

                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 text-xs font-bold text-[#5b5bd6] hover:underline mb-8 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Template
                    </button>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer bg-white min-h-[200px]",
                            isDragActive ? "border-[#5b5bd6] bg-[#f5f3ff]" : "border-[#d1d5db] hover:border-[#a5b4fc]",
                            file ? "border-[#10b981] bg-green-50" : ""
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <FileUp className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm font-bold text-green-700 mb-1">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                <p className="text-xs text-gray-400 mt-2">Click to replace file</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                                    <FileUp className="w-6 h-6 text-[#5b5bd6]" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Drop your files here or <span className="text-[#5b5bd6] font-bold underline">Click to browse</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 py-8 bg-white border-t border-gray-100">
                <button
                    onClick={onCancel}
                    disabled={isUploading}
                    className="w-[180px] h-11 rounded-lg border border-[#5b5bd6] text-[#5b5bd6] text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-[180px] h-11 rounded-lg bg-[#4338ca] text-white text-sm font-bold hover:bg-[#3730a3] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upload & Import
                </button>
            </div>
        </div>
    );
}
