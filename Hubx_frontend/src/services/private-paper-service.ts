import { PrivatePaper, PrivatePaperFilters } from "@/types/private-paper";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

export const getPrivatePapers = async (filters: PrivatePaperFilters): Promise<{ papers: PrivatePaper[], total: number, filters?: { subjects: string[], standards: string[] } }> => {
    try {
        // Construct query params
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append("page", filters.page.toString());
        if (filters.limit) queryParams.append("limit", filters.limit.toString());
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.subject && filters.subject !== "All") queryParams.append("subject", filters.subject);
        if (filters.difficulty && filters.difficulty !== "All") queryParams.append("difficulty", filters.difficulty);
        if (filters.std && filters.std !== "All") queryParams.append("std", filters.std);
        if (filters.sortBy) queryParams.append("sort", filters.sortBy);

        // Call the API
        // Using the endpoint from api-config, allowing generic string for the URL to accept query params
        const url = `${TEACHER_ENDPOINTS.getPapers(filters.page || 1, filters.limit || 10).split('?')[0]}?${queryParams.toString()}`;

        const response = await http.get<any>(url);

        if (!response.data || !response.data.papers) {
            return { papers: [], total: 0 };
        }

        const backendPapers = response.data.papers;
        const total = response.data.pagination?.total || backendPapers.length;

        // Map backend response to PrivatePaper type
        const papers: PrivatePaper[] = backendPapers.map((p: any) => ({
            id: p.id,
            title: p.title,
            std: p.standard ? `${p.standard}th` : "N/A", // Basic mapping
            subject: p.subject?.name || "Unknown",
            tags: p.chapters ? p.chapters.map((c: any) => c.chapter.name) : [],
            difficulty: mapDifficulty(p.difficulty),
            rating: p.rating || 0,
            questionsCount: p.questions ? p.questions.length : 0,
            duration: p.duration || 0,
            attempts: p.totalAttempts || 0,
            date: new Date(p.createdAt).toLocaleDateString("en-GB", {
                day: '2-digit', month: 'short', year: 'numeric'
            }),
            plays: p.totalAttempts || 0,
            teacher: {
                name: "You", // Since it's private papers of the logged in teacher
                avatar: "/assets/images/avatar-placeholder.png"
            }
        }));

        return {
            papers,
            total,
            filters: response.data.filters
        };
    } catch (error) {
        console.error("Failed to fetch private papers:", error);
        // Fallback to empty state instead of mock data to reflect real system state
        return { papers: [], total: 0 };
    }
};


export const deletePrivatePaper = async (paperId: string): Promise<void> => {
    try {
        await http.delete(TEACHER_ENDPOINTS.deletePaper(paperId));
    } catch (error) {
        console.error("Failed to delete paper:", error);
        throw error;
    }
};

export const updatePrivatePaper = async (paperId: string, data: Partial<any>): Promise<PrivatePaper> => {
    try {
        const response = await http.put<any>(TEACHER_ENDPOINTS.updatePaper(paperId), data);
        const p = response.data;
        // Map response back to PrivatePaper if needed, or just return the raw updated data if component handles it
        // Re-using the mapping logic would be best but for now let's minimal map
        return {
            id: p.id,
            title: p.title,
            std: p.standard ? `${p.standard}th` : "N/A",
            subject: p.subject?.name || "Unknown",
            tags: p.chapters ? p.chapters.map((c: any) => c.chapter.name) : [],
            difficulty: mapDifficulty(p.difficulty),
            rating: p.rating || 0,
            questionsCount: p.questions ? p.questions.length : 0,
            duration: p.duration || 0,
            attempts: p.totalAttempts || 0,
            date: new Date(p.createdAt).toLocaleDateString("en-GB", {}),
            plays: p.totalAttempts || 0,
            teacher: {
                name: "You",
                avatar: "/assets/images/avatar-placeholder.png"
            }
        };
    } catch (error) {
        console.error("Failed to update paper:", error);
        throw error;
    }
};

function mapDifficulty(diff: string): "Beginner" | "Intermediate" | "Advanced" {
    const map: Record<string, "Beginner" | "Intermediate" | "Advanced"> = {
        "EASY": "Beginner",
        "MEDIUM": "Intermediate",
        "INTERMEDIATE": "Intermediate",
        "HARD": "Advanced",
        "ADVANCED": "Advanced"
    };
    return map[diff?.toUpperCase()] || "Intermediate";
}

