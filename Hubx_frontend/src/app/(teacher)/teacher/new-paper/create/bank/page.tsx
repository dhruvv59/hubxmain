"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Loader2, Search, Filter, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperSummaryCard } from "@/components/teacher/ai/PaperSummaryCard";
import { QuestionBankFilters } from "@/components/teacher/question-bank/QuestionBankFilters";
import { QuestionBankList } from "@/components/teacher/question-bank/QuestionBankList";
import { PublishConfirmModal } from "@/components/teacher/ai/PublishConfirmModal";
import { PublishSuccessModal } from "@/components/teacher/ai/PublishSuccessModal";
import { AppToast, type ToastVariant } from "@/components/ui/AppToast";
import { getDraft, removeQuestionFromDraft } from "@/services/draft-service";
import { addQuestionToPaper } from "@/services/question-bank-service";
import { getBankQuestions } from "@/services/question-bank-service";
import { teacherContentService, type Standard, type Subject, type Chapter } from "@/services/teacher-content";
import { PaperConfig, Question } from "@/types/generate-paper";
import { AddedQuestionsList } from "@/components/teacher/ai/AddedQuestionsList";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

function BankPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");

    const [config, setConfig] = useState<PaperConfig | null>(null);
    const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
    const [isLoadingDraft, setIsLoadingDraft] = useState(true);
    const [isLoadingBank, setIsLoadingBank] = useState(false);
    const [standards, setStandards] = useState<Standard[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; variant: ToastVariant; isVisible: boolean }>({
        message: "",
        variant: "success",
        isVisible: false,
    });

    const showToast = (message: string, variant: ToastVariant = "success") => {
        setToast({ message, variant, isVisible: true });
    };

    // Bank filters and selection state
    const [filters, setFilters] = useState({
        standardId: "",
        subjectId: "",
        chapterIds: [] as string[],
        difficulty: "Intermediate",
        rating: "4star",
        addedTime: "Latest",
        search: ""
    });
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

    // Load draft config
    useEffect(() => {
        const fetchDraft = async () => {
            if (!draftId) {
                router.push("/teacher/new-paper");
                return;
            }
            try {
                const data = await getDraft(draftId);
                if (data) setConfig(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingDraft(false);
            }
        };
        fetchDraft();
    }, [draftId, router]);

    // Fetch standards for filters
    useEffect(() => {
        const fetchStandards = async () => {
            setIsLoadingContent(true);
            try {
                const fetchedStandards = await teacherContentService.getStandards();
                setStandards(fetchedStandards);
            } catch (error) {
                console.error("Failed to fetch standards:", error);
            } finally {
                setIsLoadingContent(false);
            }
        };
        fetchStandards();
    }, []);

    // Sync filters from paper config when draft loads (paper's standard + subject + chapters)
    useEffect(() => {
        if (!config || standards.length === 0) return;
        const stdId = config.standardId;
        const subId = config.subjectId || "";
        const paperChapterIds = (config.chapters || []).filter(c => c.selected).map(c => c.id);
        if (stdId && standards.some(s => s.id === stdId)) {
            setFilters(prev => {
                if (prev.standardId === stdId && prev.subjectId === subId &&
                    JSON.stringify(prev.chapterIds?.sort()) === JSON.stringify(paperChapterIds.sort())) return prev;
                return {
                    ...prev,
                    standardId: stdId,
                    subjectId: subId,
                    chapterIds: paperChapterIds
                };
            });
        } else if (!filters.standardId && standards.length > 0) {
            setFilters(prev => ({ ...prev, standardId: standards[0].id }));
        }
    }, [config?.standardId, config?.subjectId, config?.chapters, config, standards.length]);

    // Fetch subjects when standard changes (and set default if no config yet)
    useEffect(() => {
        if (!filters.standardId) {
            setSubjects([]);
            return;
        }
        teacherContentService.getSubjects(filters.standardId)
            .then((subs) => {
                setSubjects(subs);
                // When syncing from config, keep subjectId and chapterIds if valid; else clear
                setFilters(prev => {
                    const validSubject = prev.subjectId && subs.some((s: Subject) => s.id === prev.subjectId);
                    return {
                        ...prev,
                        subjectId: validSubject ? prev.subjectId : "",
                        chapterIds: validSubject ? prev.chapterIds : []
                    };
                });
            })
            .catch(() => setSubjects([]));
        setChapters([]);
    }, [filters.standardId]);

    // Fetch chapters when subject changes
    useEffect(() => {
        if (!filters.subjectId || !filters.standardId) {
            setChapters([]);
            return;
        }
        teacherContentService.getChapters(filters.standardId, filters.subjectId)
            .then((chaps) => {
                setChapters(chaps);
                // Keep only chapterIds that exist in this subject's chapters
                setFilters(prev => {
                    if (!prev.chapterIds?.length) return prev;
                    const validIds = prev.chapterIds.filter(id => chaps.some((c: Chapter) => c.id === id));
                    if (validIds.length === prev.chapterIds.length) return prev;
                    return { ...prev, chapterIds: validIds };
                });
            })
            .catch(() => setChapters([]));
    }, [filters.subjectId, filters.standardId]);

    // Load bank questions
    useEffect(() => {
        const fetchBankQuestions = async () => {
            setIsLoadingBank(true);
            try {
                const questions = await getBankQuestions({
                    subject: filters.subjectId || undefined,
                    chapterIds: filters.chapterIds?.length ? filters.chapterIds : undefined,
                    difficulty: filters.difficulty === "All" ? [] : [filters.difficulty],
                    search: filters.search,
                    limit: 100
                });
                setBankQuestions(questions);
            } catch (error) {
                console.error("Failed to fetch question bank data:", error);
            } finally {
                setIsLoadingBank(false);
            }
        };

        fetchBankQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

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

    const handleAddQuestions = async () => {
        if (!draftId) {
            showToast("No active draft to add questions to.", "warning");
            return;
        }

        setIsAdding(true);
        try {
            const selectedQuestions = bankQuestions.filter(q => selectedIds.includes(q.id));

            for (const q of selectedQuestions) {
                await addQuestionToPaper(q.id, draftId);
            }

            // Reload config to update summary with new question count
            const updated = await getDraft(draftId);
            if (updated) setConfig(updated);

            // Clear selection
            setSelectedIds([]);

            showToast(`Added ${selectedQuestions.length} questions successfully!`, "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to add questions. Please try again.", "error");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveQuestion = async (id: string) => {
        if (!draftId) return;
        try {
            await removeQuestionFromDraft(draftId, id);
            const updated = await getDraft(draftId);
            if (updated) setConfig(updated);
        } catch (error) {
            console.error(error);
        }
    };

    const handleConfirmPublish = async () => {
        if (!draftId) {
            console.error("No draft ID found");
            showToast("No draft found. Please try again.", "error");
            return;
        }

        setIsPublishing(true);
        try {
            await http.patch(TEACHER_ENDPOINTS.publishPaper(draftId), {});
            setIsPublishModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (error: any) {
            console.error("Publish failed:", error);
            const errorMsg = error?.message || "Failed to publish paper. Please try again.";
            showToast(errorMsg, "error");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoadingDraft) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="max-w-[1300px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Generate Paper</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9 font-medium">Add questions from your question bank</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* <button className="h-10 px-6 rounded-lg border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">
                        Save Question Paper
                    </button> */}
                    <button
                        onClick={() => {
                            const questionCount = config?.questions?.length ?? 0;
                            if (questionCount < 1) {
                                showToast("Add at least 1 question to the paper before publishing.", "warning");
                                return;
                            }
                            setIsPublishModalOpen(true);
                        }}
                        className={`h-10 px-6 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                            (config?.questions?.length ?? 0) < 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#10b981] hover:bg-[#059669] text-white"
                        }`}
                        disabled={(config?.questions?.length ?? 0) < 1}
                    >
                        Publish Paper
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Sidebar Summary */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <PaperSummaryCard config={config} showChaptersList={true} />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {/* Title Section */}
                    <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-6">
                        <h2 className="text-lg font-bold text-[#5b5bd6]">
                            {config.title}
                        </h2>
                    </div>

                    {/* Bank Section */}
                    <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0 p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Filters Sidebar */}
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

                            {/* Questions List */}
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

                                {isLoadingBank ? (
                                    <div className="min-h-[400px] flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
                                    </div>
                                ) : (
                                    <QuestionBankList
                                        questions={bankQuestions}
                                        selectedIds={selectedIds}
                                        onToggleSelect={handleToggleSelect}
                                        onAddQuestions={handleAddQuestions}
                                        isAdding={isAdding}
                                        showAddBar={true}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Added Questions List - shown below bank, always visible */}
                    <div className="mt-8">
                        <AddedQuestionsList
                            questions={config.questions || []}
                            onRemove={handleRemoveQuestion}
                            alwaysShow={true}
                        />
                    </div>
                </div>
            </div>

            <PublishConfirmModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onConfirm={handleConfirmPublish}
                isPublishing={isPublishing}
            />

            <PublishSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
            />

            <AppToast
                message={toast.message}
                variant={toast.variant}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

export default function BankPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" /></div>}>
            <BankPageContent />
        </Suspense>
    );
}
