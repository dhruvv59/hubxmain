"use client";

import React, { useState, useEffect } from "react";
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
            alert("Standard name is required");
            return;
        }

        try {
            if (form.id) {
                // Send name and description for update
                await teacherContentService.updateStandard(form.id, { name: form.name, description: form.description });
                alert("Standard updated successfully!");
            } else {
                // Send name and description for create
                await teacherContentService.createStandard({ name: form.name, description: form.description });
                alert("Standard created successfully!");
            }
            setIsCreating(false);
            setForm({});
            loadData();
        } catch (error) {
            console.error("Failed to save standard", error);
            alert("Failed to save. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this standard? This action cannot be undone.")) return;
        try {
            console.log("Deleting standard:", id);
            await teacherContentService.deleteStandard(id);
            console.log("Standard deleted successfully");
            loadData();
            alert("Standard deleted successfully!");
        } catch (error: any) {
            console.error("Failed to delete standard:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete standard";
            alert(`Error: ${errorMessage}`);
        }
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
                <div className="text-center py-10 text-gray-500">No standards found.</div>
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
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

    // Load standards on component mount
    useEffect(() => {
        teacherContentService.getStandards().then(res => setStandards(res || []));
    }, []);

    // Load subjects when standard is selected
    useEffect(() => {
        setLoading(true);
        if (filterStandard) {
            teacherContentService.getSubjects(filterStandard)
                .then(res => setSubjects(res || []))
                .catch(err => console.error("Failed to load subjects:", err))
                .finally(() => setLoading(false));
        } else {
            setSubjects([]);
            setLoading(false);
        }
    }, [filterStandard]);

    const handleSave = async () => {
        if (!form.standardId) {
            alert("Please select a standard");
            return;
        }

        if (!form.name?.trim()) {
            alert("Subject name is required");
            return;
        }

        try {
            if (form.id) {
                // Only send name for update
                await teacherContentService.updateSubject(form.standardId, form.id, { name: form.name });
                alert("Subject updated successfully!");
            } else {
                // For create, send name and optional code
                await teacherContentService.createSubject(form.standardId, { name: form.name, code: form.code });
                alert("Subject created successfully!");
            }
            setIsCreating(false);
            setForm({});
            // Reload subjects for the selected standard
            if (filterStandard) {
                const res = await teacherContentService.getSubjects(filterStandard);
                setSubjects(res || []);
            }
        } catch (error) {
            console.error("Failed to save subject", error);
            alert("Failed to save. Please ensure all fields are filled.");
        }
    };

    const handleDelete = async (subject: Subject) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        try {
            console.log("Deleting subject:", subject.id, "from standard:", subject.standardId);
            await teacherContentService.deleteSubject(subject.standardId, subject.id);
            console.log("Subject deleted successfully");
            // Reload subjects
            if (filterStandard) {
                const res = await teacherContentService.getSubjects(filterStandard);
                setSubjects(res || []);
            }
            alert("Subject deleted successfully!");
        } catch (error: any) {
            console.error("Failed to delete subject:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete subject";
            alert(`Error: ${errorMessage}`);
        }
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
                <div className="text-center py-10 text-gray-500">No subjects found.</div>
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

    useEffect(() => {
        // Load standards first
        teacherContentService.getStandards().then(res => setStandards(res || []));
    }, []);

    // Load subjects when standard is selected
    useEffect(() => {
        if (selectedStandardForSubjects) {
            teacherContentService.getSubjects(selectedStandardForSubjects)
                .then(res => setSubjects(res || []))
                .catch(err => console.error("Failed to load subjects:", err));
        } else {
            setSubjects([]);
        }
    }, [selectedStandardForSubjects]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Only fetch chapters if both standard and subject are selected
            if (selectedStandardForSubjects && filterSubject) {
                const res = await teacherContentService.getChapters(selectedStandardForSubjects, filterSubject);
                setChapters(res || []);
            } else {
                setChapters([]);
            }
        } catch (error) {
            console.error("Failed to load chapters", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedStandardForSubjects, filterSubject]);

    const handleSave = async () => {
        if (!form.subjectId || !form.standardId) {
            alert("Please select both standard and subject");
            return;
        }

        if (!form.name?.trim()) {
            alert("Chapter name is required");
            return;
        }

        try {
            if (form.id) {
                // Send name, description, and sequence for update
                await teacherContentService.updateChapter(form.standardId, form.subjectId, form.id, { name: form.name, description: form.description, sequence: form.sequence });
                alert("Chapter updated successfully!");
            } else {
                // Send name, description, and sequence for create
                await teacherContentService.createChapter(form.standardId, form.subjectId, { name: form.name, description: form.description, sequence: form.sequence });
                alert("Chapter created successfully!");
            }
            setIsCreating(false);
            setForm({});
            // Reload chapters for the selected standard and subject
            if (selectedStandardForSubjects && filterSubject) {
                const res = await teacherContentService.getChapters(selectedStandardForSubjects, filterSubject);
                setChapters(res || []);
            }
        } catch (error) {
            console.error("Failed to save chapter", error);
            alert("Failed to save. Please check inputs.");
        }
    };

    const handleDelete = async (chapter: Chapter) => {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        try {
            console.log("Deleting chapter:", chapter.id, "from subject:", chapter.subjectId, "standard:", selectedStandardForSubjects);
            // Use selectedStandardForSubjects from state since chapter object doesn't have it
            await teacherContentService.deleteChapter(selectedStandardForSubjects, chapter.subjectId, chapter.id);
            console.log("Chapter deleted successfully");
            // Reload chapters
            if (selectedStandardForSubjects && filterSubject) {
                const res = await teacherContentService.getChapters(selectedStandardForSubjects, filterSubject);
                setChapters(res || []);
            }
            alert("Chapter deleted successfully!");
        } catch (error: any) {
            console.error("Failed to delete chapter:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete chapter";
            alert(`Error: ${errorMessage}`);
        }
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
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <div className="text-center py-10 text-gray-500">No chapters found.</div>
            ) : (
                <div className="grid gap-3">
                    {chapters.map(item => {
                        const subName = subjects.find(s => s.id === item.subjectId)?.name || 'Unknown Subject';
                        return (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{subName}</span>
                                        {item.sequence && <span className="text-xs text-gray-400">Seq: {item.sequence}</span>}
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
        </div>
    );
}
