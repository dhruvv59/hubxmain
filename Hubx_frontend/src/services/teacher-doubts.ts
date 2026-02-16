import { http } from "@/lib/http-client";
import { TEACHER_DOUBT_ENDPOINTS } from "@/lib/api-config";

export interface Doubt {
    id: string;
    studentId: string;
    questionId: string;
    paperId: string;
    content: string;
    status: "OPEN" | "RESOLVED";
    createdAt: string;
    student: {
        name: string;
        avatar?: string;
    };
    replies: DoubtReply[];
}

export interface DoubtReply {
    id: string;
    doubtId: string;
    teacherId: string;
    content: string;
    createdAt: string;
    teacher: {
        name: string;
    };
}

export const teacherDoubtService = {
    /**
     * Get all doubts for a paper
     */
    getAll: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Doubt[] }>(
                TEACHER_DOUBT_ENDPOINTS.getAll(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherDoubts] Failed to fetch doubts:", error);
            throw error;
        }
    },

    /**
     * Get doubts for a specific question
     */
    getByQuestion: async (questionId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Doubt[] }>(
                TEACHER_DOUBT_ENDPOINTS.getByQuestion(questionId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherDoubts] Failed to fetch question doubts:", error);
            throw error;
        }
    },

    /**
     * Reply to a doubt
     */
    reply: async (doubtId: string, content: string) => {
        try {
            const response = await http.post<{ success: boolean; data: DoubtReply }>(
                TEACHER_DOUBT_ENDPOINTS.reply(doubtId),
                { content }
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherDoubts] Failed to reply to doubt:", error);
            throw error;
        }
    },

    /**
     * Get doubt statistics for a paper
     */
    getStats: async (paperId: string) => {
        try {
            const response = await http.get<any>(
                TEACHER_DOUBT_ENDPOINTS.getStats(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherDoubts] Failed to fetch doubt stats:", error);
            return null;
        }
    },

    /**
     * Get difficulty statistics for a paper (based on doubt density etc.)
     */
    getDifficultyStats: async (paperId: string) => {
        try {
            const response = await http.get<any>(
                TEACHER_DOUBT_ENDPOINTS.getDifficultyStats(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherDoubts] Failed to fetch difficulty stats:", error);
            return null;
        }
    },
};
