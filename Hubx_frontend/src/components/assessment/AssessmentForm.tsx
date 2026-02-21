"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Subject } from "@/types/assessment";
import { SubjectCheckbox, ChapterAccordion } from "@/components/assessment/AssessmentSelection";
import { getAssessmentSubjects, generateAdaptiveAssessment } from "@/services/assessment";
import { Loader2 } from "lucide-react";

interface AssessmentFormProps {
    initialSubjects?: Subject[];
}

export function AssessmentForm({ initialSubjects = [] }: AssessmentFormProps) {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [isLoading, setIsLoading] = useState(initialSubjects.length === 0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [difficulty, setDifficulty] = useState("Advanced");
    const [timeLimit, setTimeLimit] = useState("30");
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

    // Fetch subjects if not provided
    useEffect(() => {
        const fetchSubjects = async () => {
            if (subjects.length === 0) {
                try {
                    setIsLoading(true);
                    const data = await getAssessmentSubjects();
                    setSubjects(data);
                } catch (error) {
                    console.error("Failed to load subjects", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchSubjects();
    }, []); // Run once on mount

    // Initialize selection when subjects are loaded
    useEffect(() => {
        if (subjects.length > 0 && selectedSubjectIds.length === 0) {
            setSelectedSubjectIds(subjects.map(s => s.id));
            const allChapterIds = subjects.flatMap(s => (s.chapters || []).map(c => c.id));
            setSelectedChapters(allChapterIds);
        }
    }, [subjects]);

    const toggleSubject = (id: string) => {
        setSelectedSubjectIds((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const toggleAllSubjects = () => {
        if (selectedSubjectIds.length === subjects.length) {
            setSelectedSubjectIds([]);
        } else {
            setSelectedSubjectIds(subjects.map((s) => s.id));
        }
    };

    const selectedSubjects = useMemo(() =>
        subjects.filter((s) => selectedSubjectIds.includes(s.id)),
        [subjects, selectedSubjectIds]);

    const totalQuestions = useMemo(() => {
        let count = 0;
        selectedSubjects.forEach(sub => {
            (sub.chapters || []).forEach(ch => {
                if (selectedChapters.includes(ch.id)) {
                    count += ch.questionCount || 0;
                }
            });
        });
        return count;
    }, [selectedSubjects, selectedChapters]);

    const activeSelectedChapterCount = useMemo(() => {
        return subjects
            .filter(s => selectedSubjectIds.includes(s.id))
            .flatMap(s => (s.chapters || []))
            .filter(c => selectedChapters.includes(c.id))
            .length;
    }, [subjects, selectedSubjectIds, selectedChapters]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium">Loading Assessment Configuration...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
                {/* Controls Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        {/* Difficulty */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Assessment Difficulty Level:</label>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6">
                                {["Easy", "Intermediate", "Advanced"].map((level) => (
                                    <label key={level} className="flex items-center space-x-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="difficulty"
                                                value={level}
                                                checked={difficulty === level}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                                className="peer appearance-none h-5 w-5 rounded-full border-2 border-gray-300 checked:border-[#6366f1] transition-all"
                                            />
                                            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#6366f1] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className={cn("text-sm", difficulty === level ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-700")}>
                                            {level}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Time Limit */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Assessment Time Limit In Minutes:</label>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={timeLimit === "unlimited" ? "" : timeLimit}
                                        onChange={(e) => setTimeLimit(e.target.value)}
                                        placeholder="90"
                                        className="border border-gray-300 rounded px-3 py-1.5 w-16 text-center text-base md:text-sm font-medium focus:outline-none focus:border-[#6366f1]"
                                    />
                                    <span className="ml-2 text-sm text-gray-500">Mins</span>
                                </div>
                                <button
                                    onClick={() => setTimeLimit(timeLimit === "unlimited" ? "90" : "unlimited")}
                                    className={cn(
                                        "px-4 py-1.5 text-sm rounded border transition-colors",
                                        timeLimit === "unlimited" ? "bg-[#6366f1] text-white border-[#6366f1]" : "text-gray-500 border-gray-300 hover:border-gray-400"
                                    )}
                                >
                                    No Limit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Selection */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">Select Subjects</h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                                <div className="flex items-center gap-1 md:gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                    <span className="text-gray-500 whitespace-nowrap">Excellent Performance</span>
                                </div>
                                <div className="flex items-center gap-1 md:gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                                    <span className="text-gray-500 whitespace-nowrap">Average Performance</span>
                                </div>
                                <div className="flex items-center gap-1 md:gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                    <span className="text-gray-500 whitespace-nowrap">Poor Performance</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            <div
                                onClick={toggleAllSubjects}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                                <div
                                    className={cn(
                                        "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                        selectedSubjectIds.length === subjects.length ? "bg-[#6366f1] border-[#6366f1]" : "border-gray-300 bg-white"
                                    )}
                                >
                                    {selectedSubjectIds.length === subjects.length && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-sm font-medium text-gray-700">All</span>
                            </div>

                            {subjects.map((subject) => (
                                <SubjectCheckbox
                                    key={subject.id}
                                    subject={subject}
                                    isSelected={selectedSubjectIds.includes(subject.id)}
                                    onToggle={() => toggleSubject(subject.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chapters Sections */}
                <div className="space-y-4">
                    {selectedSubjects.map((subject) => (
                        <ChapterAccordion
                            key={subject.id}
                            subject={subject}
                            selectedChapters={selectedChapters}
                            onToggleChapter={(id) => {
                                setSelectedChapters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                            }}
                            onSelectAllChapters={(ids) => {
                                const otherChapters = selectedChapters.filter(id => !subject.chapters.find(c => c.id === id));
                                setSelectedChapters([...otherChapters, ...ids]);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[380px]">
                <div className="space-y-4 lg:sticky lg:top-8">
                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Assessment Summary</h3>

                        <div className="space-y-4 md:space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wide mb-1">SUBJECTS</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedSubjects.slice(0, 2).map(s => s.name).join(", ")}
                                        {selectedSubjects.length > 2 && <span className="text-[#ff5757] ml-1">+{selectedSubjects.length - 2}</span>}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <div className="border-t border-gray-50 pt-4">
                                <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wide mb-1">TOTAL NO OF QUESTIONS</p>
                                <p className="text-xl font-bold text-gray-900">{totalQuestions}</p>
                                {totalQuestions < 5 && (
                                    <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Need at least 5 questions to generate assessment</p>
                                )}
                            </div>

                            <div className="border-t border-gray-50 pt-4">
                                <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wide mb-1">DIFFICULTY LEVEL</p>
                                <p className="text-sm font-bold text-gray-900">{difficulty}</p>
                            </div>

                            <div className="border-t border-gray-50 pt-4">
                                <div className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wide mb-1">CHAPTERS</p>
                                        <p className="text-xl font-bold text-gray-900">{activeSelectedChapterCount}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (selectedSubjectIds.length === 0) {
                                        alert("Please select at least one subject");
                                        return;
                                    }

                                    if (totalQuestions < 5) {
                                        alert(`Not enough questions available (${totalQuestions} found, need at least 5). Please:\n• Select more chapters\n• Choose different subjects\n• Try a different difficulty level`);
                                        return;
                                    }

                                    try {
                                        setIsGenerating(true);
                                        const result = await generateAdaptiveAssessment({
                                            subjectIds: selectedSubjectIds,
                                            chapterIds: selectedChapters,
                                            difficulty: difficulty.toUpperCase(),
                                            duration: timeLimit ? parseInt(timeLimit) : null,
                                        });

                                        // Navigate to the generated assessment
                                        router.push(`/assessments/${result.paperId}/take`);
                                    } catch (error: any) {
                                        const errorMessage = error.message || "Failed to generate assessment";
                                        if (errorMessage.includes("Not enough questions")) {
                                            alert("Not enough questions available for your selection. Please try:\n• Adding more chapters\n• Selecting different subjects\n• Choosing a different difficulty level");
                                        } else {
                                            alert(errorMessage);
                                        }
                                        setIsGenerating(false);
                                    }
                                }}
                                disabled={isGenerating || selectedSubjectIds.length === 0 || totalQuestions < 5}
                                className="w-full py-3.5 bg-[#5b5bd6] hover:bg-[#4f4fbe] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        GENERATING ASSESSMENT...
                                    </>
                                ) : (
                                    "START ASSESSMENT"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <Link href="/assessments/results" className="block w-full">
                        <button className="w-full bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-[#6366f1] hover:shadow-md transition-all group">
                            <span className="font-bold text-gray-800 text-sm group-hover:text-[#6366f1] italic">VIEW PREVIOUS RESULTS</span>
                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#6366f1]/10">
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#6366f1]" />
                            </div>
                        </button>
                    </Link>

                    <button className="w-full bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-[#6366f1] hover:shadow-md transition-all group">
                        <span className="font-bold text-gray-800 text-sm group-hover:text-[#6366f1] italic">VIEW MARKED QUESTIONS</span>
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#6366f1]/10">
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#6366f1]" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
