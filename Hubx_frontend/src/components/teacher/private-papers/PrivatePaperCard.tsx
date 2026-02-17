
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, User, Calendar, Tag, MoreVertical, Edit, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivatePaper } from "@/types/private-paper";
import * as Dialog from "@radix-ui/react-dialog";
import { deletePrivatePaper, updatePrivatePaper } from "@/services/private-paper-service";
import { useRouter } from "next/navigation";

interface PrivatePaperCardProps {
    paper: PrivatePaper;
    onUpdate?: () => void;
}

export function PrivatePaperCard({ paper, onUpdate }: PrivatePaperCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    // Edit State
    const [editForm, setEditForm] = useState({
        title: paper.title,
        description: "", // Description not in PrivatePaper type? Let's check or assume empty
        // Update: PrivatePaper type has 'subject', 'std' as strings.
        // Usually edit needs IDs or select options. For simplicity, we just allow Title edit for now + specific fields if they exist.
        // Or we assume paper object has what we need.
        // Since we don't have full edit page, let's keep it simple: Title only or maybe simple metadata.
        // Actually the backend update accepts: title, description, standard, difficulty, type, duration, isPublic, price.
        isPublic: false,
        price: 0
    });

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deletePrivatePaper(paper.id);
            setIsDeleteOpen(false);
            if (onUpdate) onUpdate();
            else window.location.reload();
        } catch (error) {
            console.error("Failed to delete paper", error);
            alert("Failed to delete paper");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updatePrivatePaper(paper.id, {
                title: editForm.title,
                // Add other fields if needed, for now just title as MVP edit
            });
            setIsEditOpen(false);
            if (onUpdate) onUpdate();
            else window.location.reload();
        } catch (error) {
            console.error("Failed to update paper", error);
            alert("Failed to update paper");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{paper.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border",
                            paper.difficulty === "Beginner" ? "bg-green-50 text-green-700 border-green-200" :
                                paper.difficulty === "Intermediate" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                    "bg-red-50 text-red-700 border-red-200"
                        )}>
                            {paper.difficulty}
                        </span>
                        {paper.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 bg-gray-50">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 relative" ref={menuRef}>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">
                        {paper.std}
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-32 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => { setIsEditOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 font-medium"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={() => { setIsDeleteOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5 ">
                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span className="font-bold text-gray-700">{paper.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-700">{paper.questionsCount}</span> Questions
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.duration} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.attempts} Attempts</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-bold text-gray-700">{paper.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-700">{paper.plays}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <Image
                            src={paper.teacher.avatar}
                            alt={paper.teacher.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{paper.teacher.name}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/teacher/papers/${paper.id}/questions`)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                        Questions
                    </button>
                    <button
                        onClick={() => router.push(`/teacher/paper-assessments/${paper.id}`)}
                        className="px-6 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Manage
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl p-6 shadow-xl w-[90vw] max-w-md z-50 animate-in fade-in zoom-in-95 duration-200 focus:outline-none">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                                Delete Paper?
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-gray-900">"{paper.title}"</span>? This action cannot be undone.
                            </Dialog.Description>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Edit Dialog */}
            <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl p-6 shadow-xl w-[90vw] max-w-md z-50 animate-in fade-in zoom-in-95 duration-200 focus:outline-none">
                        <div className="flex justify-between items-center mb-6">
                            <Dialog.Title className="text-xl font-bold text-gray-900">
                                Edit Paper
                            </Dialog.Title>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Paper Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter paper title"
                                />
                            </div>

                            {/* Placeholder for other fields if we had them or full edit page logic */}
                            <p className="text-xs text-gray-500 italic">
                                * To change subject, standard or difficulty, please create a new paper or use the full editor.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
