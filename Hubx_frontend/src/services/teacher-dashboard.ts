import { TeacherDashboardData } from "@/types/teacher";
import { http } from "@/lib/http-client";
import { ANALYTICS_ENDPOINTS, TEACHER_ENDPOINTS } from "@/lib/api-config";

/**
 * Backend Response Types
 * Matches GET /api/analytics/teacher
 */
interface BackendTeacherAnalyticsResponse {
    success: boolean;
    message: string;
    data: {
        totalPapers: number;
        totalAttempts: number;
        totalEarnings: number;
        averageScore: number;
        revenueData: Array<{ name: string; value: number }>;
        likeabilityData: Array<{ name: string; value: number }>;
        topPerformingPapers: Array<{
            id: string;
            title: string;
            attempts: number;
            averageScore: number;
        }>;
    };
}

/**
 * Adapter: transforms backend analytics into UI stat cards
 */
function transformToTeacherStats(
    analytics: BackendTeacherAnalyticsResponse['data']
): TeacherDashboardData['stats'] {
    // Format earnings to readable string
    const earnings = analytics.totalEarnings;
    const earningsStr = earnings >= 1000
        ? `₹${(earnings / 1000).toFixed(1)}k`
        : `₹${earnings}`;

    return [
        {
            id: "earnings",
            title: "TOTAL EARNINGS",
            value: earningsStr,
            subValue: "",
            lastMonthValue: "",
            trend: "up",
            theme: "green"
        },
        {
            id: "purchased",
            title: "TOTAL PURCHASED PAPERS",
            value: analytics.totalAttempts.toString(),
            subValue: "",
            lastMonthValue: "",
            trend: "up",
            theme: "orange"
        },
        {
            id: "created",
            title: "PAPERS CREATED",
            value: analytics.totalPapers.toString(),
            subValue: "",
            lastMonthValue: "",
            trend: "up",
            theme: "purple"
        },
        {
            id: "trending",
            title: "TRENDING PAPERS",
            value: analytics.topPerformingPapers.length.toString().padStart(2, '0'),
            subValue: "",
            lastMonthValue: "",
            trend: "up",
            theme: "yellow"
        }
    ];
}

/**
 * STREAMING API FUNCTIONS
 * Each section loads independently for progressive rendering.
 */

/**
 * Fetch teacher name and basic info
 */
export async function getTeacherInfo(): Promise<{ teacherName: string }> {
    try {
        const { getCurrentUser } = await import('./auth');
        const user = await getCurrentUser();
        return { teacherName: user.fullName };
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch teacher info:', error);
        return { teacherName: "Teacher" };
    }
}

/**
 * Fetch dashboard statistics from analytics endpoint
 */
export async function getTeacherStats(): Promise<TeacherDashboardData['stats']> {
    try {
        const response = await http.get<BackendTeacherAnalyticsResponse>(
            ANALYTICS_ENDPOINTS.teacher()
        );
        return transformToTeacherStats(response.data);
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch stats:', error);
        throw error;
    }
}

/**
 * Fetch revenue chart data.
 */
export async function getRevenueData(): Promise<TeacherDashboardData['revenueData']> {
    try {
        const response = await http.get<BackendTeacherAnalyticsResponse>(
            ANALYTICS_ENDPOINTS.teacher()
        );

        if (response.data.revenueData) {
            return response.data.revenueData;
        }

        return [
            { name: "Total", value: response.data.totalEarnings }
        ];
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch revenue data:', error);
        throw error;
    }
}

/**
 * Fetch likeability chart data.
 */
export async function getLikeabilityData(): Promise<TeacherDashboardData['likeabilityData']> {
    try {
        const response = await http.get<BackendTeacherAnalyticsResponse>(
            ANALYTICS_ENDPOINTS.teacher()
        );
        return response.data.likeabilityData || [];
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch likeability data:', error);
        return [];
    }
}

/**
 * Fetch notifications from backend.
 */
export async function getNotifications(): Promise<TeacherDashboardData['notifications']> {
    try {
        const response = await http.get<any>(TEACHER_ENDPOINTS.getNotifications());

        return response.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: n.type.toLowerCase() as any, // 'info', 'warning', 'success', 'error'
            avatar: "/images/teacher/avatar-placeholder.png", // Added mock avatar as backend doesn't send sender avatar yet
            user: "Student", // Backend doesn't send sender name yet, default to "Student"
            action: n.type === 'WARNING' ? 'reported issue in' : 'interacted with',
            target: "Paper"
        }));
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch notifications:', error);
        return [];
    }
}

/**
 * Optimized fetch all data at once
 */
export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
    try {
        // Fetch User Info
        const infoPromise = getTeacherInfo();

        // Fetch Notifications
        const notifPromise = getNotifications();

        // Fetch Analytics (Stats, Revenue, Likeability all come from ONE endpoint)
        const analyticsPromise = http.get<BackendTeacherAnalyticsResponse>(
            ANALYTICS_ENDPOINTS.teacher()
        );

        const [info, notifications, analyticsResponse] = await Promise.all([
            infoPromise,
            notifPromise,
            analyticsPromise
        ]);

        const analytics = analyticsResponse.data;

        return {
            teacherName: info.teacherName,
            stats: transformToTeacherStats(analytics),
            revenueData: analytics.revenueData || [],
            likeabilityData: analytics.likeabilityData || [],
            notifications,
        };
    } catch (error) {
        console.error('[TeacherDashboard] Failed to load dashboard data:', error);
        throw error;
    }
}

/**
 * Metadata Interfaces
 */
export interface Standard {
    id: string;
    standard: number; // e.g. 9, 10
}

export interface Subject {
    id: string;
    name: string;
    standardId: string;
}

export interface Chapter {
    id: string;
    name: string;
    subjectId: string;
    description?: string;
}

/**
 * Fetch available standards
 */
export async function getStandards(): Promise<Standard[]> {
    try {
        const { TEACHER_CONTENT_ENDPOINTS } = await import("@/lib/api-config");
        const response = await http.get<any>(TEACHER_CONTENT_ENDPOINTS.getStandards());
        // Handle both direct array and wrapped response { data: [...] }
        const data = Array.isArray(response) ? response : (response.data || []);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch standards:', error);
        return [];
    }
}

/**
 * Fetch subjects for a standard
 */
export async function getSubjects(standardId: string): Promise<Subject[]> {
    try {
        const { TEACHER_CONTENT_ENDPOINTS } = await import("@/lib/api-config");
        const response = await http.get<any>(TEACHER_CONTENT_ENDPOINTS.getSubjects(standardId));
        // Handle both direct array and wrapped response { data: [...] }
        const data = Array.isArray(response) ? response : (response.data || []);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch subjects:', error);
        return [];
    }
}

/**
 * Fetch chapters for a subject
 */
export async function getChapters(standardId: string, subjectId: string): Promise<Chapter[]> {
    try {
        const { TEACHER_CONTENT_ENDPOINTS } = await import("@/lib/api-config");
        const response = await http.get<any>(TEACHER_CONTENT_ENDPOINTS.getChapters(standardId, subjectId));
        // Handle both direct array and wrapped response { data: [...] }
        const data = Array.isArray(response) ? response : (response.data || []);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('[TeacherDashboard] Failed to fetch chapters:', error);
        return [];
    }
}
