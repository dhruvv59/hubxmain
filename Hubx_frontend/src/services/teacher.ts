import { TeacherProfile, PublicPaper } from "@/types/assessment";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

/**
 * Backend Response Types
 * Matches GET /api/teacher/papers
 */
interface BackendTeacherPapersResponse {
    success: boolean;
    message: string;
    data: {
        papers: Array<{
            id: string;
            title: string;
            description: string;
            standard: number;
            teacherId: string;
            subjectId: string;
            difficulty: string;
            type: string;
            duration: number | null;
            status: string;
            isPublic: boolean;
            price: number;
            totalAttempts: number;
            averageScore: number;
            createdAt: string;
            questions: Array<any>;
            subject: {
                id: string;
                name: string;
            } | null;
            chapters: Array<{
                chapter: {
                    id: string;
                    name: string;
                };
            }>;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

/**
 * Adapter: transforms backend teacher paper to UI PublicPaper
 */
function transformTeacherPaper(
    paper: BackendTeacherPapersResponse['data']['papers'][0]
): PublicPaper {
    const levelMap: Record<string, "Advanced" | "Beginner" | "Intermediate"> = {
        "ADVANCED": "Advanced",
        "EASY": "Beginner",
        "INTERMEDIATE": "Intermediate"
    };

    return {
        id: paper.id,
        title: paper.title,
        badges: paper.status === "PUBLISHED" ? ["PUBLISHED"] : ["DRAFT"],
        price: paper.price || 0,
        level: levelMap[paper.difficulty] || "Intermediate",
        tags: paper.chapters.map(c => c.chapter.name),
        rating: 0,
        questionCount: paper.questions?.length || 0,
        durationMinutes: paper.duration || 0,
        attempts: paper.totalAttempts,
        date: new Date(paper.createdAt).toLocaleDateString("en-GB", {
            day: '2-digit', month: 'short', year: 'numeric'
        }),
        subject: paper.subject?.name || "",
        teacher: {
            id: paper.teacherId,
            name: "",
            avatarUrl: ""
        },
    };
}

/**
 * Get teacher profile by ID.
 * NOTE: Backend doesn't have a public teacher profile endpoint yet.
 * Returns null until implemented.
 */
export async function getTeacherById(_id: string): Promise<TeacherProfile | null> {
    return null;
}

/**
 * Get papers created by a teacher.
 * Uses GET /api/teacher/papers (auth required, returns own papers).
 */
export async function getTeacherPapers(
    _teacherId: string,
    subjectFilter?: string,
    difficultyFilter?: string,
    searchQuery?: string
): Promise<PublicPaper[]> {
    try {
        const response = await http.get<BackendTeacherPapersResponse>(
            TEACHER_ENDPOINTS.getPapers(1, 50)
        );

        let papers = response.data.papers.map(transformTeacherPaper);

        // Client-side filtering
        if (subjectFilter && subjectFilter !== "All") {
            papers = papers.filter(p => p.subject === subjectFilter);
        }

        if (difficultyFilter && difficultyFilter !== "All") {
            papers = papers.filter(p => p.level === difficultyFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            papers = papers.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.subject.toLowerCase().includes(q)
            );
        }

        return papers;
    } catch (error) {
        console.error('[Teacher] Failed to fetch teacher papers:', error);
        throw error;
    }
}
