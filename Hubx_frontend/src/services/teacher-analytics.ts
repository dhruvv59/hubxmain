import { http } from "@/lib/http-client";
import { ANALYTICS_ENDPOINTS } from "@/lib/api-config";

export interface TeacherAnalyticsData {
    totalStudents: number;
    totalPapers: number;
    averageRating: number;
    revenue: number;
    studentPerformance: {
        subject: string;
        averageScore: number;
        totalAttempts: number;
    }[];
    recentActivities: {
        id: string;
        type: string;
        description: string;
        timestamp: string;
    }[];
}

export const teacherAnalyticsService = {
    getAnalytics: async () => {
        try {
            const response = await http.get<{ data: TeacherAnalyticsData }>(
                ANALYTICS_ENDPOINTS.teacher()
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherAnalytics] Failed to fetch analytics:", error);
            throw error;
        }
    },

    getPaperAnalytics: async (paperId: string) => {
        try {
            const response = await http.get<any>(
                ANALYTICS_ENDPOINTS.paper(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherAnalytics] Failed to fetch paper analytics:", error);
            throw error;
        }
    }
};
