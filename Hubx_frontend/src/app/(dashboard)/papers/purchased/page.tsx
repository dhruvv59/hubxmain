"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { PublicPaper } from "@/types/assessment";
import { getPurchasedPapers } from "@/services/paper"; // Updated import
import { PaperCard } from "@/components/assessment/PaperCard";
import { TestSettingsModal } from "@/components/assessment/TestSettingsModal";

export default function PurchasedPapersPage() {
    const router = useRouter();
    const [papers, setPapers] = useState<PublicPaper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal Interaction
    const [selectedPaper, setSelectedPaper] = useState<PublicPaper | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const loadPurchased = async () => {
            setIsLoading(true);
            try {
                // Fetch purchased papers using the service
                const purchased = await getPurchasedPapers();
                setPapers(purchased);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadPurchased();
    }, []);

    const handleStartTest = (paper: PublicPaper) => {
        setSelectedPaper(paper);
        setIsSettingsOpen(true);
    };

    const handleViewQuestions = (paper: PublicPaper) => {
        // As per flow, maybe this also goes to test or a different view?
        // User said "View Questions" link style.
        // Assuming it goes to invalid/preview or same test view for now.
        // Let's use the test view properly.
        router.push(`/papers/${paper.id}/take`);
    };

    const handleTestStartConfirm = (settings: any) => {
        setIsSettingsOpen(false);
        if (selectedPaper) {
            router.push(`/papers/${selectedPaper.id}/take`);
        }
    };

    const filteredPapers = papers.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.teacher.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fafbfc] p-6 font-sans">
            {/* Header */}
            <div className="mb-8 max-w-[1600px] mx-auto">
                <div className="flex items-center space-x-4 mb-2">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-1">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Purchased Papers ({papers.length})
                    </h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-11">
                    Previously purchased papers
                </p>
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
                {/* Optional: Sidebar could be here or just full width. Image 3 shows just a search bar and list. Not full sidebar visible. 
                   Actually image 3 shows a sidebar on left "Subjects", "Difficulty Level".
                   So it reuses the filter sidebar structure.
                */}
                <div className="w-full lg:w-[280px] shrink-0 space-y-6 hidden lg:block">
                    {/* Simplified Filter Sidebar for Purchased - reusing structure matches Image 3 */}
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Subjects</h3>
                        <div className="space-y-3">
                            {["All", "Science", "Mathematics", "Geography"].map((subject) => (
                                <label key={subject} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <input type="radio" name="p_subject" checked={subject === "All"} readOnly className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:border-[#6366f1]" />
                                        <div className="absolute h-2.5 w-2.5 bg-[#6366f1] rounded-full opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100 input:checked~&" />
                                    </div>
                                    <span className="text-[14px] text-gray-500 font-medium">{subject}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    {/* Search Bar */}
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Paper by Subject or Teacher Name"
                                className="w-full pl-11 pr-4 py-2 text-sm focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center px-4 border-l border-gray-100 space-x-2">
                            <span className="text-xs font-bold text-gray-500">Sort By</span>
                            <button className="text-[#5b5bd6] text-xs font-bold bg-[#eaeaff] px-3 py-1.5 rounded-lg flex items-center gap-1">
                                Most Recent <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="p-10 text-center text-gray-500">Loading...</div>
                        ) : filteredPapers.map(paper => (
                            <PaperCard
                                key={paper.id}
                                data={paper}
                                onTeacherClick={() => router.push(`/teachers/${paper.teacher.id}`)}
                                onPreview={() => handleViewQuestions(paper)} // "View Questions"
                                onStartTest={() => handleStartTest(paper)} // "Start Test" or "Retest"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <TestSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onStart={handleTestStartConfirm}
            />
        </div>
    );
}

