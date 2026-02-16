"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Send, AlertCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AssessmentDetailPage() {
    const params = useParams();
    const isNew = params.id === "new";

    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState([
        { id: 1, text: "Explain the law of thermodynamics.", type: "Text", points: 10 },
        { id: 2, text: "What is the capital of France?", type: "Multiple Choice", points: 5 },
    ]);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/assessments"
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isNew ? "Create Assessment" : "Mathematics Final Year 2024"}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isNew ? "Draft a new assessment" : "Editing assessment details and questions"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <Send className="mr-2 h-4 w-4" />
                        Publish
                    </button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* General Info Card */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">General Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    defaultValue={!isNew ? "Mathematics Final Year 2024" : ""}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="e.g. Science Quiz"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option>Mathematics</option>
                                    <option>Science</option>
                                    <option>History</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration (minutes)</label>
                                <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue="60" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Passing Score</label>
                                <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue="40" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Enter instructions..." />
                        </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Questions</h3>
                            <button className="text-sm text-primary font-medium hover:underline flex items-center">
                                <Plus className="mr-1 h-4 w-4" /> Add Question
                            </button>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="group relative rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                                            {index + 1}
                                        </span>
                                        <div className="ml-4 flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{q.text}</p>
                                            <p className="text-xs text-muted-foreground">{q.type} • {q.points} pts</p>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuration</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Shuffle Questions</span>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Show Results Immediately</span>
                                <input type="checkbox" className="toggle" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200 flex items-start">
                                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                This assessment is currently in Draft mode. Publish to make it visible to students.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Assign To</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                <span className="text-sm">Class 10-A (Mathematics)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-sm">Class 10-B (Mathematics)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
