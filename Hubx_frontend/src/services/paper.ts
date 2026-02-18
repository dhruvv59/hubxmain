import { PublicPaper, PaperFilters } from "@/types/assessment";
import { http } from "@/lib/http-client";
import { DASHBOARD_ENDPOINTS } from "@/lib/api-config";

/**
 * Backend Response Types
 * Matches GET /api/student/public-papers
 */
interface BackendPublicPapersResponse {
    success: boolean;
    message: string;
    data: {
        papers: Array<{
            id: string;
            title: string;
            description: string;
            difficulty: string;
            price: number;
            duration: number | null;
            createdAt: string;
            subject: { id: string; name: string } | null;
            teacher: { id: string; firstName: string; lastName: string; avatar: string | null } | null;
            _count: {
                examAttempts: number;
                questions: number;
            };
            purchased: boolean;
            hasCoupon: boolean;
            couponCode: string | null;
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
 * Adapter: transforms backend paper to UI PublicPaper
 */
function transformBackendPaper(paper: BackendPublicPapersResponse['data']['papers'][0]): PublicPaper {
    const levelMap: Record<string, "Advanced" | "Beginner" | "Intermediate"> = {
        "ADVANCED": "Advanced",
        "EASY": "Beginner",
        "INTERMEDIATE": "Intermediate"
    };

    return {
        id: paper.id,
        title: paper.title,
        badges: paper.hasCoupon ? ["COUPON"] : [],
        price: paper.price,
        level: levelMap[paper.difficulty] || "Intermediate",
        tags: [],
        rating: 0,
        questionCount: paper._count?.questions || 0,
        durationMinutes: paper.duration || 0,
        attempts: paper._count.examAttempts,
        date: new Date(paper.createdAt).toLocaleDateString("en-GB", {
            day: '2-digit', month: 'short', year: 'numeric'
        }),
        subject: paper.subject?.name || "",
        teacher: {
            id: paper.teacher?.id || "",
            name: paper.teacher ? `${paper.teacher.firstName} ${paper.teacher.lastName}` : "",
            avatarUrl: paper.teacher?.avatar || ""
        },
        purchased: paper.purchased,
    };
}

/**
 * Fetch public papers with optional filters.
 * Client-side filtering is applied for fields the backend doesn't support filtering on.
 */
export async function getPublicPapers(filters: PaperFilters = {}): Promise<PublicPaper[]> {
    try {
        const page = 1;
        const limit = 50; // Fetch enough for client-side filtering
        const response = await http.get<BackendPublicPapersResponse>(
            DASHBOARD_ENDPOINTS.getPublicPapers(page, limit)
        );

        let uiPapers = response.data.papers.map(transformBackendPaper);

        // Client-side filtering (backend doesn't support these filters yet)
        if (filters.level && filters.level !== "All") {
            uiPapers = uiPapers.filter(p => p.level === filters.level);
        }

        if (filters.rating && filters.rating.includes("4")) {
            uiPapers = uiPapers.filter(p => p.rating >= 4.0);
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            uiPapers = uiPapers.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.teacher.name.toLowerCase().includes(q) ||
                p.subject.toLowerCase().includes(q)
            );
        }

        if (filters.sortBy) {
            if (filters.sortBy === "Price: Low to High") {
                uiPapers.sort((a, b) => a.price - b.price);
            } else if (filters.sortBy === "Price: High to Low") {
                uiPapers.sort((a, b) => b.price - a.price);
            }
        }

        return uiPapers;
    } catch (error) {
        console.error('[Paper] Failed to fetch public papers:', error);
        throw error;
    }
}

/**
 * Gets the count of purchased papers for the current student.
 * Uses the dashboard endpoint which returns purchase count.
 */
export async function getPurchasedPapersCount(): Promise<number> {
    try {
        const response = await http.get<{
            success: boolean;
            data: { purchases: number };
        }>(DASHBOARD_ENDPOINTS.getDashboard());
        return response.data.purchases;
    } catch (error) {
        console.error('[Paper] Failed to fetch purchased papers count:', error);
        return 0;
    }
}

/**
 * Gets list of purchased papers for the current student.
 * Filters public papers to only those marked as purchased.
 */
export async function getPurchasedPapers(): Promise<PublicPaper[]> {
    try {
        const allPapers = await getPublicPapers({});
        return allPapers.filter(p => p.purchased);
    } catch (error) {
        console.error('[Paper] Failed to fetch purchased papers:', error);
        return [];
    }
}
