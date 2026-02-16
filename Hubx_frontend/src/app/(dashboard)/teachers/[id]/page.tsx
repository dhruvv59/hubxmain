"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Star,
    Bell,
    Search,
    Filter,
    ChevronDown,
    MapPin,
    Users,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeacherProfile, PublicPaper } from "@/types/assessment";
import { getTeacherById, getTeacherPapers } from "@/services/teacher";
import { PaperCard } from "@/components/assessment/PaperCard";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { TestSettingsModal } from "@/components/assessment/TestSettingsModal";

export default function TeacherProfilePage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id as string;

    const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
    const [papers, setPapers] = useState<PublicPaper[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [activeSubject, setActiveSubject] = useState("Mathematics");
    const [difficulty, setDifficulty] = useState("Advanced"); // Default as per image
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Most Recent");

    // Modal States
    const [selectedPaper, setSelectedPaper] = useState<PublicPaper | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchInitial = async () => {
            setIsLoading(true);
            try {
                const tData = await getTeacherById(teacherId);
                setTeacher(tData);

                // Fetch papers initial (real app would use filters in API)
                const pData = await getTeacherPapers(teacherId);
                setPapers(pData);
            } catch (error) {
                console.error("Failed to fetch teacher data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (teacherId) {
            fetchInitial();
        }
    }, [teacherId]);

    // Handle Interactions
    const handlePurchaseClick = (paper: PublicPaper) => {
        setSelectedPaper(paper);
        setIsPaymentOpen(true);
    };

    const handlePreviewClick = (paper: PublicPaper) => {
        // Maybe check ownership? For now, just show settings for demo
        setSelectedPaper(paper);
        setIsSettingsOpen(true);
    };

    const handlePaymentSuccess = () => {
        // Update local state to show as purchased
        if (selectedPaper) {
            setPapers(prev => prev.map(p =>
                p.id === selectedPaper.id ? { ...p, purchased: true, price: 0 } : p
            ));
        }
        setIsPaymentOpen(false); // Modal shows success validation internally first? 
        // Actually PaymentModal shows success view, then calls onSuccess when closed/proceeded.
        // We'll let the modal handle the success view display, then close.
    };

    const handleTestStart = (settings: any) => {
        setIsSettingsOpen(false);
        if (selectedPaper) {
            router.push(`/papers/${selectedPaper.id}/take`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-[#fafbfc] p-8 text-center">
                <h2 className="text-xl font-bold">Teacher not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-[#5b5bd6] font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] p-6 font-sans">
            {/* Header */}
            <div className="max-w-[1200px] mx-auto mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors mb-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="text-xl font-bold text-gray-900">{teacher.name}</span>
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100">
                        <Star className="h-3 w-3 text-orange-500 fill-current" />
                        <span className="text-xs font-bold text-orange-600">{teacher.rating}</span>
                    </div>
                </button>
                <p className="text-sm text-gray-500 ml-8 pl-1">{teacher.subjects.join(", ")}</p>
            </div>

            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar - Profile Card */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm sticky top-6">
                        <div className="relative h-[300px] w-full">
                            <Image
                                src={teacher.avatarUrl}
                                alt={teacher.name}
                                fill
                                className="object-cover"
                            />
                            {/* Overlay Gradient or details if needed */}
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PUBLIC PAPERS</p>
                                    <p className="text-3xl font-black text-gray-900 italic">{teacher.stats.publicPapers}</p>
                                </div>
                                {/* Bell Icon absolute positioned? No, distinct layout in design */}
                            </div>

                            <div className="mb-6">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">NOTIFIED STUDENTS</p>
                                <p className="text-3xl font-black text-gray-900 italic">{teacher.stats.notifiedStudents}</p>
                            </div>

                            <div className="flex justify-center -mb-10 relative z-10">
                                <button className="h-14 w-14 rounded-full bg-[#a855f7] border-[4px] border-white shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform">
                                    <Bell className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        {/* Purple curved bottom decoration */}
                        <div className="h-12 bg-white relative overflow-hidden">
                            {/* Styling hack to simulate the circle cut or just standard spacing */}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Paper by Subject Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6366f1] shadow-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Sort By</span>
                            <button className="px-4 py-2 bg-[#eaeaff] text-[#5b5bd6] font-bold rounded-lg text-sm flex items-center space-x-2">
                                <span>{sortBy}</span>
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Subject Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                            {[
                                { name: "Mathematics", count: 11 },
                                { name: "Science", count: 8 },
                                { name: "Social Science", count: 4 }
                            ].map((subject) => (
                                <button
                                    key={subject.name}
                                    onClick={() => setActiveSubject(subject.name)}
                                    className={cn(
                                        "pb-4 text-sm font-bold whitespace-nowrap relative transition-colors",
                                        activeSubject === subject.name ? "text-[#5b5bd6]" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    {subject.name} ({subject.count})
                                    {activeSubject === subject.name && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b5bd6]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center space-x-6">
                        <span className="text-sm font-bold text-gray-900">Difficulty Level:</span>
                        {["Easy", "Intermediate", "Advanced"].map((level) => (
                            <label key={level} className="flex items-center space-x-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        checked={difficulty === level}
                                        onChange={() => setDifficulty(level)}
                                        className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1] transition-colors"
                                    />
                                    <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100 transition-transform input:checked~&" />
                                    <style jsx>{`
                                        input:checked + div { opacity: 1; transform: scale(1); }
                                    `}</style>
                                </div>
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    difficulty === level ? "text-[#6366f1]" : "text-gray-500 group-hover:text-gray-700"
                                )}>{level}</span>
                            </label>
                        ))}
                    </div>

                    {/* Papers List */}
                    <div className="space-y-4">
                        {papers.map(paper => (
                            <PaperCard
                                key={paper.id}
                                data={paper}
                                onPurchase={() => handlePurchaseClick(paper)}
                                onPreview={() => handlePreviewClick(paper)} // This opens settings -> test currently
                                onStartTest={() => handlePreviewClick(paper)} // Reuse logic: Start Test -> Settings -> Test
                                onTeacherClick={() => { }} // Already on teacher page
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                paperTitle={selectedPaper?.title || ""}
                paperId={selectedPaper?.id || ""}
                amount={selectedPaper?.price || 0}
                onSuccess={handlePaymentSuccess}
            />

            <TestSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onStart={handleTestStart}
            />
        </div>
    );
}
