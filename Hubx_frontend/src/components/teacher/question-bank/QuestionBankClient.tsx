"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, HelpCircle, Filter, Search, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionBankFilters } from "@/components/teacher/question-bank/QuestionBankFilters";
import { QuestionBankList } from "@/components/teacher/question-bank/QuestionBankList";
import { SuccessToast } from "@/components/ui/SuccessToast";
import { addQuestionToDraft } from "@/services/draft-service";
import { getBankQuestions } from "@/services/question-bank-service";
import { teacherContentService, type Subject, type Standard, type Chapter } from "@/services/teacher-content";
import { PaperConfig, Question } from "@/types/generate-paper";

interface QuestionBankClientProps {
    initialConfig: PaperConfig | null;
    initialQuestions: Question[];
}

export function QuestionBankClient({ initialConfig, initialQuestions }: QuestionBankClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");

    const [config, setConfig] = useState<PaperConfig | null>(initialConfig);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Content State - User's Standards, Subjects, Chapters
    const [standards, setStandards] = useState<Standard[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        standardId: "",
        subjectId: "",
        chapterIds: [] as string[],
        difficulty: "Intermediate",
        rating: "4star",
        addedTime: "Latest",
        search: ""
    });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Selection State - persisted so selection survives navigation (back/forward)
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Restore selection from sessionStorage when draftId is available
    useEffect(() => {
        if (!draftId || typeof window === "undefined") return;
        try {
            const key = `hubx_bank_selected_${draftId}`;
            const stored = sessionStorage.getItem(key);
            if (stored) setSelectedIds(JSON.parse(stored));
        } catch {
            // Ignore parse errors
        }
    }, [draftId]);

    // Persist selection when it changes
    useEffect(() => {
        if (!draftId || typeof window === "undefined") return;
        try {
            sessionStorage.setItem(`hubx_bank_selected_${draftId}`, JSON.stringify(selectedIds));
        } catch {
            // Ignore storage errors
        }
    }, [selectedIds, draftId]);

    // Initial Load - Fetch User's Standards
    useEffect(() => {
        const fetchUserContent = async () => {
            setIsLoadingContent(true);
            try {
                // Fetch all standards for the user
                const fetchedStandards = await teacherContentService.getStandards();
                setStandards(fetchedStandards);

                // Set first standard as default and fetch its subjects
                if (fetchedStandards.length > 0 && !filters.standardId) {
                    const firstStandardId = fetchedStandards[0].id;
                    setFilters(prev => ({ ...prev, standardId: firstStandardId }));

                    try {
                        const stdSubjects = await teacherContentService.getSubjects(firstStandardId);
                        setSubjects(stdSubjects);
                        // Default to "All Subjects" (empty) so newly created questions (no subject) show up
                        // User can filter by specific subject if needed
                    } catch (error) {
                        console.error(`Failed to fetch subjects for standard ${firstStandardId}:`, error);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user standards:", error);
            } finally {
                setIsLoadingContent(false);
            }
        };

        fetchUserContent();
    }, []);

    // When standard changes, fetch its subjects
    useEffect(() => {
        if (filters.standardId) {
            const fetchSubjects = async () => {
                try {
                    const stdSubjects = await teacherContentService.getSubjects(filters.standardId);
                    setSubjects(stdSubjects);

                    // Default to "All Subjects" and clear chapters when standard changes
                    setFilters(prev => ({ ...prev, subjectId: "", chapterIds: [] }));
                    setChapters([]);
                } catch (error) {
                    console.error(`Failed to fetch subjects for standard ${filters.standardId}:`, error);
                }
            };

            fetchSubjects();
        }
    }, [filters.standardId]);

    // Fetch chapters when subject changes
    useEffect(() => {
        if (filters.subjectId && filters.standardId) {
            teacherContentService.getChapters(filters.standardId, filters.subjectId)
                .then(setChapters)
                .catch(() => setChapters([]));
        } else {
            setChapters([]);
        }
    }, [filters.subjectId, filters.standardId]);

    // Fetch Questions when filters change
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Draft Config if draftId exists and config is missing
                if (draftId && !config) {
                    const draftData = await import("@/services/draft-service").then(m => m.getDraft(draftId));
                    setConfig(draftData);
                }

                // Fetch Questions
                const bankQuestions = await getBankQuestions({
                    subject: filters.subjectId ? filters.subjectId : undefined,
                    chapterIds: filters.chapterIds?.length ? filters.chapterIds : undefined,
                    difficulty: filters.difficulty === "All" ? [] : [filters.difficulty],
                    search: filters.search
                });
                setQuestions(bankQuestions);
            } catch (error) {
                console.error("Failed to fetch question bank data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch when: subjectId is set (including "" for All Subjects), OR we have standards but no subjects
        if (filters.subjectId !== undefined || (standards.length > 0 && subjects.length === 0)) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.subjectId, filters.standardId, filters.chapterIds, filters.difficulty, filters.search, draftId, standards.length, subjects.length]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleChapterToggle = (chapterId: string) => {
        setFilters(prev => {
            const current = prev.chapterIds || [];
            const updated = current.includes(chapterId)
                ? current.filter(id => id !== chapterId)
                : [...current, chapterId];
            return { ...prev, chapterIds: updated };
        });
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleEditQuestion = (id: string) => {
        router.push(`/teacher/question-bank/${id}/edit`);
    };

    const handleQuestionDeleted = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleAddQuestions = async () => {
        if (!draftId) {
            alert("No active draft to add questions to.");
            return;
        }

        setIsAdding(true);
        try {
            const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
            // Simulate adding questions with a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            for (const q of selectedQuestions) {
                await addQuestionToDraft(draftId, q as Question & { questionImage?: File; solutionImage?: File });
            }

            setToastMessage(`Added ${selectedQuestions.length} questions to draft!`);
            setShowToast(true);
            setSelectedIds([]); // Clear selection (also clears sessionStorage via persist effect)

            // Redirect back to manual creation page with showDone flag
            setTimeout(() => {
                router.push(`/teacher/x-factor/create/manual?draftId=${draftId}&showDone=true`);
            }, 1000);
        } catch (error) {
            console.error(error);
            alert("Failed to add questions. Please try again.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="max-w-[1300px] mx-auto pb-20 pt-10 px-6">
            <SuccessToast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        {draftId && (
                            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        {!draftId && (
                            <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-[#9333ea]" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">
                            {config?.title || "Question Bank"}
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9 font-medium">Discover and add questions from the question bank</p>
                </div>
                <button
                    onClick={() => router.push("/teacher/question-bank/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white font-medium rounded-lg hover:bg-[#4f4fbe] transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">Create Question</span>
                    <span className="sm:hidden">Create</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <QuestionBankFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onChapterToggle={handleChapterToggle}
                    standards={standards}
                    subjects={subjects}
                    chapters={chapters}
                    isOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    isLoadingContent={isLoadingContent}
                />

                <div className="flex-1 w-full space-y-6">
                    {/* Search and Filter Mobile */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] shadow-sm transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
                        </div>
                    ) : (
                        <QuestionBankList
                            questions={questions}
                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                            onAddQuestions={handleAddQuestions}
                            isAdding={isAdding}
                            showAddBar={!!draftId}
                            onEdit={handleEditQuestion}
                            onDelete={handleQuestionDeleted}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
