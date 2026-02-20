"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Book,
    Layers,
    Bookmark,
    Plus,
    Edit,
    Trash2,
    Loader2,
    Search,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { teacherContentService, Standard, Subject, Chapter } from "@/services/teacher-content";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AppToast } from "@/components/ui/AppToast";
import { useToast } from "@/hooks/useToast";

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState<"standards" | "subjects" | "chapters">("standards");

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Curriculum Management</h1>
                    <p className="text-gray-500 text-sm">Manage standards, subjects, and chapters</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: "standards", label: "Standards", icon: Bookmark },
                    { id: "subjects", label: "Subjects", icon: Book },
                    { id: "chapters", label: "Chapters", icon: Layers },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === tab.id
                                ? "bg-white text-[#6366f1] shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[500px] p-6">
                {activeTab === "standards" && <StandardsManager />}
                {activeTab === "subjects" && <SubjectsManager />}
                {activeTab === "chapters" && <ChaptersManager />}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StandardsManager() {
    const [standards, setStandards] = useState<Standard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<Partial<Standard>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const { toast, success, error } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await teacherContentService.getStandards();
            setStandards(res || []);
        } catch (error) {
            console.error("Failed to load standards", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!form.name?.trim()) {
            error("Standard name is required");
            return;
        }

        try {
            if (form.id) {
                // Send name and description for update
                await teacherContentService.updateStandard(form.id, { name: form.name, description: form.description });
                success("Standard updated successfully!");
            } else {
                // Send name and description for create
                await teacherContentService.createStandard({ name: form.name, description: form.description });
                success("Standard created successfully!");
            }
            setIsCreating(false);
            setForm({});
            loadData();
        } catch (err) {
            console.error("Failed to save standard", err);
            error("Failed to save. Please try again.");
        }
    };

    const handleDelete = (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            console.log("Deleting standard:", deleteConfirm.id);
            await teacherContentService.deleteStandard(deleteConfirm.id);
            console.log("Standard deleted successfully");
            loadData();
            success("Standard deleted successfully!");
        } catch (err: any) {
            console.error("Failed to delete standard:", err);
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete standard";
            error(`Error: ${errorMessage}`);
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">All Standards</h2>
                <button
                    onClick={() => { setForm({}); setIsCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Standard
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-sm mb-3">{form.id ? "Edit Standard" : "New Standard"}</h3>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <input
                            placeholder="Standard Name (e.g. 10th Grade)"
                            value={form.name || ""}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                        <input
                            placeholder="Description (Optional)"
                            value={form.description || ""}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-gray-600 text-sm">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 bg-[#6366f1] text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : standards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <Bookmark className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No standards yet</h3>
                    <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                        Add your first standard (e.g. 10th Grade) to organize subjects and chapters.
                    </p>
                    <button
                        onClick={() => { setForm({}); setIsCreating(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Standard
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {standards.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.description || "No description"}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setForm(item); setIsCreating(true); }} className="p-2 text-gray-400 hover:text-[#6366f1] rounded-lg hover:bg-indigo-50">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Standard"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Toast Notification */}
            <AppToast
                message={toast.message}
                variant={toast.variant}
                isVisible={toast.isVisible}
                onClose={() => {}}
            />
        </div>
    );
}

function SubjectsManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [standards, setStandards] = useState<Standard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<Partial<Subject>>({});
    const [filterStandard, setFilterStandard] = useState<string>("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ subject: Subject } | null>(null);
    const { toast, success, error } = useToast();

    // Load standards on component mount
    useEffect(() => {
        teacherContentService.getStandards().then(res => setStandards(res || []));
    }, []);

    // Load subjects: when "All Standards" → fetch from all; when one selected → fetch for that only
    const loadSubjects = useCallback(async () => {
        setLoading(true);
        try {
            if (filterStandard) {
                const res = await teacherContentService.getSubjects(filterStandard);
                setSubjects(res || []);
            } else if (standards.length > 0) {
                const results = await Promise.all(standards.map(s => teacherContentService.getSubjects(s.id)));
                setSubjects(results.flat());
            } else {
                setSubjects([]);
            }
        } catch (err) {
            console.error("Failed to load subjects:", err);
        } finally {
            setLoading(false);
        }
    }, [filterStandard, standards]);

    useEffect(() => {
        loadSubjects();
    }, [loadSubjects]);

    const handleSave = async () => {
        if (!form.standardId) {
            error("Please select a standard");
            return;
        }

        if (!form.name?.trim()) {
            error("Subject name is required");
            return;
        }

        try {
            if (form.id) {
                // Only send name for update
                await teacherContentService.updateSubject(form.standardId, form.id, { name: form.name });
                success("Subject updated successfully!");
            } else {
                // For create, send name and optional code
                await teacherContentService.createSubject(form.standardId, { name: form.name, code: form.code });
                success("Subject created successfully!");
            }
            setIsCreating(false);
            setForm({});
            // Reload subjects for the selected standard
            if (filterStandard) {
                const res = await teacherContentService.getSubjects(filterStandard);
                setSubjects(res || []);
            }
        } catch (err) {
            console.error("Failed to save subject", err);
            error("Failed to save. Please ensure all fields are filled.");
        }
    };

    const handleDelete = (subject: Subject) => {
        setDeleteConfirm({ subject });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { subject } = deleteConfirm;
        try {
            console.log("Deleting subject:", subject.id, "from standard:", subject.standardId);
            await teacherContentService.deleteSubject(subject.standardId, subject.id);
            console.log("Subject deleted successfully");
            loadSubjects();
            success("Subject deleted successfully!");
        } catch (err: any) {
            console.error("Failed to delete subject:", err);
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete subject";
            error(`Error: ${errorMessage}`);
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-900">All Subjects</h2>
                    <select
                        value={filterStandard}
                        onChange={e => setFilterStandard(e.target.value)}
                        className="p-2 border rounded-lg text-sm bg-gray-50"
                    >
                        <option value="">All Standards</option>
                        {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => { setForm({}); setIsCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-sm mb-3">{form.id ? "Edit Subject" : "New Subject"}</h3>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <select
                            value={form.standardId || ""}
                            onChange={e => setForm({ ...form, standardId: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        >
                            <option value="">Select Standard</option>
                            {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input
                            placeholder="Subject Name (e.g. Mathematics)"
                            value={form.name || ""}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                        <input
                            placeholder="Subject Code (Optional)"
                            value={form.code || ""}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-gray-600 text-sm">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 bg-[#6366f1] text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <Book className="w-8 h-8 text-indigo-500" />
                    </div>
                    {standards.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No standards yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                                Add standards first from the Standards tab, then you can add subjects.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No subjects yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                                {filterStandard ? "This standard has no subjects." : "No subjects in any standard yet."} Add your first subject to get started.
                            </p>
                            <button
                                onClick={() => { setForm({ standardId: filterStandard || undefined }); setIsCreating(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Subject
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-3">
                    {subjects.map(item => {
                        const stdName = standards.find(s => s.id === item.standardId)?.name || 'Unknown Standard';
                        return (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{stdName}</span>
                                        {item.code && <span className="text-xs text-gray-400 font-mono">{item.code}</span>}
                                    </div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setForm(item); setIsCreating(true); }} className="p-2 text-gray-400 hover:text-[#6366f1] rounded-lg hover:bg-indigo-50">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Subject"
                message={`Are you sure you want to delete "${deleteConfirm?.subject.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Toast Notification */}
            <AppToast
                message={toast.message}
                variant={toast.variant}
                isVisible={toast.isVisible}
                onClose={() => {}}
            />
        </div>
    );
}

function ChaptersManager() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [standards, setStandards] = useState<Standard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<Partial<Chapter>>({});
    const [filterSubject, setFilterSubject] = useState<string>("");
    const [selectedStandardForSubjects, setSelectedStandardForSubjects] = useState<string>("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ chapter: Chapter } | null>(null);
    const { toast, success, error } = useToast();

    useEffect(() => {
        teacherContentService.getStandards().then(res => setStandards(res || []));
    }, []);

    // Load subjects: when "All Standards" → all subjects; when one standard → subjects for that
    const loadSubjects = useCallback(async () => {
        if (selectedStandardForSubjects) {
            const res = await teacherContentService.getSubjects(selectedStandardForSubjects);
            setSubjects(res || []);
        } else if (standards.length > 0) {
            const results = await Promise.all(standards.map(s => teacherContentService.getSubjects(s.id)));
            setSubjects(results.flat());
        } else {
            setSubjects([]);
        }
    }, [selectedStandardForSubjects, standards]);

    useEffect(() => {
        loadSubjects();
    }, [loadSubjects]);

    // Load chapters: when both empty → all; when standard only → all in that standard; when both → one subject
    const loadChapters = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedStandardForSubjects && filterSubject) {
                const res = await teacherContentService.getChapters(selectedStandardForSubjects, filterSubject);
                setChapters(res || []);
            } else if (selectedStandardForSubjects) {
                const subs = await teacherContentService.getSubjects(selectedStandardForSubjects);
                const results = await Promise.all(subs.map(s => teacherContentService.getChapters(selectedStandardForSubjects, s.id)));
                setChapters(results.flat());
            } else if (standards.length > 0) {
                const allChapters: Chapter[] = [];
                for (const std of standards) {
                    const subs = await teacherContentService.getSubjects(std.id);
                    for (const sub of subs) {
                        const chaps = await teacherContentService.getChapters(std.id, sub.id);
                        allChapters.push(...chaps);
                    }
                }
                setChapters(allChapters);
            } else {
                setChapters([]);
            }
        } catch (err) {
            console.error("Failed to load chapters", err);
        } finally {
            setLoading(false);
        }
    }, [selectedStandardForSubjects, filterSubject, standards]);

    useEffect(() => {
        loadChapters();
    }, [loadChapters]);

    const handleSave = async () => {
        if (!form.subjectId || !form.standardId) {
            error("Please select both standard and subject");
            return;
        }

        if (!form.name?.trim()) {
            error("Chapter name is required");
            return;
        }

        try {
            if (form.id) {
                // Send name, description, and sequence for update
                await teacherContentService.updateChapter(form.standardId, form.subjectId, form.id, { name: form.name, description: form.description, sequence: form.sequence });
                success("Chapter updated successfully!");
            } else {
                // Send name, description, and sequence for create
                await teacherContentService.createChapter(form.standardId, form.subjectId, { name: form.name, description: form.description, sequence: form.sequence });
                success("Chapter created successfully!");
            }
            setIsCreating(false);
            setForm({});
            // Reload chapters for the selected standard and subject
            if (selectedStandardForSubjects && filterSubject) {
                const res = await teacherContentService.getChapters(selectedStandardForSubjects, filterSubject);
                setChapters(res || []);
            }
        } catch (err) {
            console.error("Failed to save chapter", err);
            error("Failed to save. Please check inputs.");
        }
    };

    const handleDelete = (chapter: Chapter) => {
        setDeleteConfirm({ chapter });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { chapter } = deleteConfirm;
        try {
            const stdId = chapter.standardId || selectedStandardForSubjects;
            await teacherContentService.deleteChapter(stdId, chapter.subjectId, chapter.id);
            loadChapters();
            success("Chapter deleted successfully!");
        } catch (err: any) {
            console.error("Failed to delete chapter:", err);
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete chapter";
            error(`Error: ${errorMessage}`);
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">All Chapters</h2>
                    <select
                        value={selectedStandardForSubjects}
                        onChange={e => {
                            setSelectedStandardForSubjects(e.target.value);
                            setFilterSubject(""); // Reset subject filter
                        }}
                        className="p-2 border rounded-lg text-sm bg-gray-50"
                    >
                        <option value="">Select Standard</option>
                        {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {selectedStandardForSubjects && (
                        <select
                            value={filterSubject}
                            onChange={e => setFilterSubject(e.target.value)}
                            className="p-2 border rounded-lg text-sm bg-gray-50"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    )}
                </div>
                <button
                    onClick={() => {
                        setForm({
                            standardId: selectedStandardForSubjects,
                            subjectId: filterSubject
                        });
                        setIsCreating(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Chapter
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-sm mb-3">{form.id ? "Edit Chapter" : "New Chapter"}</h3>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <select
                            value={form.standardId || selectedStandardForSubjects}
                            onChange={e => setForm({ ...form, standardId: e.target.value, subjectId: "" })}
                            className="p-2 border rounded-lg text-sm"
                        >
                            <option value="">Select Standard</option>
                            {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select
                            value={form.subjectId || ""}
                            onChange={e => setForm({ ...form, subjectId: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                            disabled={!form.standardId && !selectedStandardForSubjects}
                        >
                            <option value="">Select Subject</option>
                            {subjects
                                .filter(s => s.standardId === (form.standardId || selectedStandardForSubjects))
                                .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input
                            placeholder="Chapter Name"
                            value={form.name || ""}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                        <input
                            placeholder="Description (Optional)"
                            value={form.description || ""}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="p-2 border rounded-lg text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Sequence No."
                            value={form.sequence || ""}
                            onChange={e => setForm({ ...form, sequence: parseInt(e.target.value) })}
                            className="p-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-gray-600 text-sm">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 bg-[#6366f1] text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <Layers className="w-8 h-8 text-indigo-500" />
                    </div>
                    {standards.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No standards yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                                Add standards and subjects first, then you can add chapters.
                            </p>
                        </>
                    ) : subjects.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No subjects yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                                Add subjects in the Subjects tab first, then you can add chapters.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No chapters yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
                                {selectedStandardForSubjects || filterSubject
                                    ? "No chapters in this selection."
                                    : "No chapters in any subject yet."} Add your first chapter to get started.
                            </p>
                            <button
                                onClick={() => {
                                    setForm({
                                        standardId: selectedStandardForSubjects || undefined,
                                        subjectId: filterSubject || undefined
                                    });
                                    setIsCreating(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Chapter
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid gap-3">
                    {chapters.map(item => {
                        const subName = subjects.find(s => s.id === item.subjectId)?.name || 'Unknown Subject';
                        const stdName = standards.find(s => s.id === item.standardId)?.name || 'Unknown Standard';
                        return (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{stdName}</span>
                                        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{subName}</span>
                                        {item.sequence != null && <span className="text-xs text-gray-400">Seq: {item.sequence}</span>}
                                    </div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setForm(item); setIsCreating(true); }} className="p-2 text-gray-400 hover:text-[#6366f1] rounded-lg hover:bg-indigo-50">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Chapter"
                message={`Are you sure you want to delete "${deleteConfirm?.chapter.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Toast Notification */}
            <AppToast
                message={toast.message}
                variant={toast.variant}
                isVisible={toast.isVisible}
                onClose={() => {}}
            />
        </div>
    );
}
