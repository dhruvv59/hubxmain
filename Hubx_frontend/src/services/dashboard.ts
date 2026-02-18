import {
    DashboardData,
    ApiPerformanceMetrics,
    SyllabusData,
    RecentActivityItem,
    UpcomingExam,
} from "@/types/dashboard";
import { http, ApiError, NetworkError } from "@/lib/http-client";
import { DASHBOARD_ENDPOINTS, ANALYTICS_ENDPOINTS } from "@/lib/api-config";

/**
 * ========================================
 * BACKEND RESPONSE TYPES
 * ========================================
 * These match the actual backend response structures from:
 * - GET /api/student/dashboard
 * - GET /api/student/exam-history
 * - GET /api/student/public-papers
 */

interface BackendDashboardResponse {
    success: boolean;
    message: string;
    data: {
        performance: {
            rank: number;
            averageScore: number;
            averagePercentage: number;
            averageTime: number; // in seconds
            totalAttempts: number;
        };
        purchases: number;
        streak: number;
    };
}

interface BackendExamHistoryResponse {
    success: boolean;
    message: string;
    data: {
        attempts: Array<{
            id: string;
            paperId: string;
            status: string;
            startedAt: string;
            submittedAt: string | null;
            totalScore: number;
            totalMarks: number;
            percentage: number;
            timeSpent: number | null;
            paper: {
                id: string;
                title: string;
                description: string;
                difficulty: string;
                duration: number | null;
                type: string;
            };
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

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
            createdAt: string;
            _count: {
                examAttempts: number;
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
 * ========================================
 * ADAPTER / TRANSFORMER LAYER
 * ========================================
 * Transforms backend API responses to UI-friendly format.
 * The backend currently returns a simpler structure than the full
 * DashboardData interface. Fields not available from the backend
 * are returned with safe defaults so the UI does not break.
 */

function transformDashboardStats(backendData: BackendDashboardResponse['data']): DashboardData['stats'] {
    const avgTimeMinutes = Math.round(backendData.performance.averageTime / 60);

    return [
        {
            id: "rank",
            title: "PERFORMANCE RANK",
            value: backendData.performance.rank.toString(),
            trend: {
                value: `#${backendData.performance.rank}`,
                isUp: true
            },
            gradient: "linear-gradient(135deg, #FFF1F2 0%, #F3E8FF 50%, #E0E7FF 100%)",
            isCustomGradient: true
        },
        {
            id: "score",
            title: "AVERAGE SCORE",
            value: Math.round(backendData.performance.averagePercentage).toString(),
            subtext: "%",
            trend: {
                value: `${Math.round(backendData.performance.averageScore)} avg`,
                isUp: backendData.performance.averagePercentage >= 50
            },
            gradient: "linear-gradient(135deg, #ECFCCB 0%, #DCFCE7 50%, #D1FAE5 100%)",
            isCustomGradient: true
        },
        {
            id: "time",
            title: "AVERAGE TIME TAKEN",
            value: avgTimeMinutes.toString(),
            subtext: "mins",
            trend: {
                value: `${avgTimeMinutes} min avg`,
                isUp: false,
                color: "text-orange-500"
            },
            gradient: "linear-gradient(135deg, #FAE8FF 0%, #E0F2FE 100%)",
            isCustomGradient: true
        }
    ];
}

function transformExamHistoryToActivities(
    attempts: BackendExamHistoryResponse['data']['attempts']
): RecentActivityItem[] {
    try {
        return attempts.slice(0, 5).map((attempt) => {
            const isPositive = attempt.percentage >= 60;
            const timeDiff = attempt.submittedAt
                ? getRelativeTime(new Date(attempt.submittedAt))
                : 'In progress';

            return {
                id: attempt.id,
                action: attempt.status === 'SUBMITTED' ? 'Completed Exam' : 'Attempted Exam',
                subject: attempt.paper.title,
                target: `Score: ${attempt.totalScore}/${attempt.totalMarks}`,
                timestamp: timeDiff,
                score: attempt.percentage,
                isPositive,
            };
        });
    } catch (error) {
        console.error("Error transforming exam history:", error);
        return [];
    }
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * ========================================
 * PUBLIC API - SERVICE LAYER
 * ========================================
 */

/**
 * Fetches student profile info from dashboard endpoint
 */
export async function getStudentProfile(): Promise<{ name: string; avatar: string }> {
    try {
        const { getCurrentUser } = await import('./auth');
        const user = await getCurrentUser();
        return {
            name: user.fullName,
            avatar: (user as any).avatar || ""
        };
    } catch (error) {
        console.error('[Dashboard] Failed to fetch student profile:', error);
        return { name: "Student", avatar: "" };
    }
}

/**
 * Fetches dashboard stats (rank, score, time)
 */
export async function getDashboardStats() {
    try {
        const response = await http.get<BackendDashboardResponse>(
            DASHBOARD_ENDPOINTS.getDashboard()
        );
        return transformDashboardStats(response.data);
    } catch (error) {
        console.error('[Dashboard] Failed to fetch stats:', error);
        throw error;
    }
}

export async function getStreak() {
    try {
        const response = await http.get<BackendDashboardResponse>(
            DASHBOARD_ENDPOINTS.getDashboard()
        );
        return response.data.streak || 0;
    } catch (error) {
        return 0; // Default to 0 on error
    }
}

/**
 * Fetches excursion data
 * Uses local mock service for now as backend endpoint is not ready.
 */
export async function getExcursionData() {
    try {
        const { excursionService } = await import("./excursionService");
        const excursions = await excursionService.getAll();

        if (!excursions || excursions.length === 0) return null;

        const featured = excursions[0];

        return {
            id: featured.id,
            title: featured.companyName,
            image: featured.logoUrl || "",
            date: featured.dateBadge || "Coming Soon",
            status: featured.statusType,
            link: "/excursion"
        };
    } catch (error) {
        console.error('[Dashboard] Failed to fetch excursion data:', error);
        return null;
    }
}

/**
 * Fetches papers list (practice + public counts)
 * Maps from backend public papers count to the UI card format.
 */
export async function getPapersList() {
    try {
        const response = await http.get<BackendPublicPapersResponse>(
            DASHBOARD_ENDPOINTS.getPublicPapers(1, 1) // Just need the total count
        );
        const dashResponse = await http.get<BackendDashboardResponse>(
            DASHBOARD_ENDPOINTS.getDashboard()
        );

        return [
            {
                id: "practice",
                title: "PRACTICE PAPERS",
                count: dashResponse.data.purchases || 0,
                badgeCount: 0,
                borderColorClass: "border-orange-200",
                link: "/practice-papers"
            },
            {
                id: "public",
                title: "PUBLIC PAPERS",
                count: response.data.pagination.total,
                badgeCount: 0,
                borderColorClass: "border-green-200",
                link: "/papers"
            }
        ];
    } catch (error) {
        console.error('[Dashboard] Failed to fetch papers list:', error);
        throw error;
    }
}


/**
 * Fetches performance metrics for chart.
 *
 * IMPROVED: Returns null on error instead of empty array
 * UI can distinguish between "no data" vs "error loading"
 */
export async function getPerformanceMetrics(from?: string, to?: string) {
    try {
        let url = DASHBOARD_ENDPOINTS.getPerformanceMetrics();
        if (from && to) {
            url += `?from=${from}&to=${to}`;
        }
        const response = await http.get<any>(url);
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch performance metrics:', error);
        return null;
    }
}

/**
 * Calculates percentile rank for a student within a specific date range.
 * Returns what percentage of students the given student is better than (0-100).
 */
export async function getPercentileForDateRange(from?: string, to?: string) {
    try {
        let url = DASHBOARD_ENDPOINTS.getPercentileRange();
        if (from && to) {
            url += `?from=${from}&to=${to}`;
        }
        const response = await http.get<any>(url);
        return response.data?.percentile || 0;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch percentile for date range:', error);
        return 0;
    }
}

/**
 * Fetches subject performance data.
 *
 * IMPROVED: Returns null on error
 */
export async function getSubjectPerformance(from?: string, to?: string) {
    try {
        let url = DASHBOARD_ENDPOINTS.getSubjectPerformance();
        if (from && to) {
            url += `?from=${from}&to=${to}`;
        }
        const response = await http.get<any>(url);
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch subject performance:', error);
        return null;
    }
}

/**
 * Fetches peer rank data.
 * Returns the student's rank, percentile (% of students they're better than), and performance history.
 */
export async function getPeerRank() {
    try {
        const response = await http.get<BackendDashboardResponse>(
            DASHBOARD_ENDPOINTS.getDashboard()
        );
        const perfData = response.data.performance as any;
        const totalStudents = perfData.totalStudents || 1;

        // Calculate what the percentile would be for rank #1 (best student)
        // Special case: if only 1 student, they're at 100th percentile
        // Otherwise: Percentile = ((totalStudents - 1) / totalStudents) * 100
        let highestRankPercentile = 100; // Default for rank #1
        if (totalStudents > 1) {
            highestRankPercentile = Math.round(((totalStudents - 1) / totalStudents) * 100);
        }

        return {
            currentRank: perfData.rank,
            currentPercentile: perfData.percentile || 0, // Student's percentile rank (0-100)
            highestRankPercentile, // Rank #1's percentile (always 100 or close)
            history: perfData.history || [], // Performance scores over time
            totalStudents,
        };
    } catch (error) {
        console.error('[Dashboard] Failed to fetch peer rank:', error);
        throw error;
    }
}

/**
 * Fetches syllabus data.
 *
 * IMPROVED: Returns null on error
 */
export async function getSyllabusData(): Promise<SyllabusData[] | null> {
    try {
        const response = await http.get<any>(DASHBOARD_ENDPOINTS.getSyllabusCoverage());
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch syllabus data:', error);
        return null;
    }
}

/**
 * Fetches test recommendations.
 *
 * IMPROVED: Returns null on error
 */
export async function getHubXTestRecommendations() {
    try {
        const response = await http.get<any>(DASHBOARD_ENDPOINTS.getTestRecommendations());
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch test recommendations:', error);
        return null;
    }
}

/**
 * Fetches recent activities from exam history.
 */
export async function getRecentActivities() {
    try {
        const response = await http.get<BackendExamHistoryResponse>(
            DASHBOARD_ENDPOINTS.getExamHistory(1, 5)
        );
        return transformExamHistoryToActivities(response.data.attempts);
    } catch (error) {
        console.error('[Dashboard] Failed to fetch recent activities:', error);
        return [];
    }
}

/**
 * Fetches notification data.
 *
 * IMPROVED: Returns null on error
 */
export async function getNotificationData() {
    try {
        const response = await http.get<any>(DASHBOARD_ENDPOINTS.getNotifications());
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch notification data:', error);
        return null;
    }
}

/**
 * Fetches upcoming exams.
 *
 * IMPROVED: Returns null on error
 */
export async function getUpcomingExamsList(): Promise<UpcomingExam[] | null> {
    try {
        const response = await http.get<any>(DASHBOARD_ENDPOINTS.getUpcomingExams());
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch upcoming exams:', error);
        return null;
    }
}

/**
 * Fetches complete dashboard data (Legacy/Fallback)
 */
export async function getDashboardData(): Promise<DashboardData> {
    try {
        // Fetch available data in parallel
        const [profile, stats, papers, activities, peerRankData, upcomingExams, testRecommendations, syllabus] = await Promise.all([
            getStudentProfile(),
            getDashboardStats(),
            getPapersList().catch(() => []),
            getRecentActivities(),
            getPeerRank().catch(() => ({
                currentRank: 0,
                currentPercentile: 0,
                highestRankPercentile: 0,
                history: []
            })),
            getUpcomingExamsList().catch(() => []),
            getHubXTestRecommendations().catch(() => []),
            getSyllabusData().catch(() => [])
        ]);

        return {
            user: profile,
            stats: stats, // Use the stats array directly
            papers,
            performanceData: [],
            notifications: [],
            focusAreas: [],
            latestExcursion: null,
            subjectPerformance: {
                currentSubject: "N/A",
                overallPercentage: 0,
                trend: "Stable",
                metrics: []
            },
            peerRank: peerRankData,
            recentActivities: activities,
            dailyQuestion: {
                id: "",
                question: "",
                options: [],
                correctAnswer: 0,
                subject: ""
            },
            welcome: {
                greeting: "Hello",
                quote: "",
                daysLeft: 0,
                examName: ""
            },
            upcomingExams: upcomingExams || [],
            testRecommendations: testRecommendations || [],
            syllabus: syllabus || []
        };
    } catch (error) {
        console.error('[Dashboard Service] Failed to fetch dashboard data:', error);
        if (error instanceof ApiError || error instanceof NetworkError) {
            throw error;
        }
        throw new Error('An unexpected error occurred while loading dashboard data');
    }
}

/**
 * Additional endpoints for partial updates
 */
export async function getPerformanceStats(): Promise<ApiPerformanceMetrics> {
    const response = await http.get<BackendDashboardResponse>(
        DASHBOARD_ENDPOINTS.getDashboard()
    );
    // Map backend format to frontend ApiPerformanceMetrics type
    return {
        globalRank: {
            current: response.data.performance.rank,
            trend: 0
        },
        averageScore: {
            current: Math.round(response.data.performance.averageScore),
            trend: 0
        },
        averageTimeBeforeSubmission: {
            minutes: Math.round(response.data.performance.averageTime / 60),
            trend: 0
        }
    };
}

/**
 * Fetches comprehensive student analytics
 */
export async function getStudentAnalytics() {
    try {
        const response = await http.get<any>(ANALYTICS_ENDPOINTS.student());
        return response.data;
    } catch (error) {
        console.error('[Dashboard] Failed to fetch student analytics:', error);
        throw error;
    }
}



export async function getSyllabusCoverage(): Promise<SyllabusData[]> {
    return [];
}
