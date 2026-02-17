import { http } from "@/lib/http-client";
import { TEACHER_QUESTION_ENDPOINTS } from "@/lib/api-config";

export interface Question {
    id: string;
    text: string;
    type: "MCQ" | "TEXT" | "FILL_IN_THE_BLANKS";
    options?: string[] | string; // Can be array or JSON string from backend
    correctAnswer: string;
    marks: number;
    difficulty: "EASY" | "INTERMEDIATE" | "ADVANCED";
    explanation?: string;
    questionImageUrl?: string;
    solutionImageUrl?: string;
    paperId: string;
}

export const teacherQuestionService = {
    /**
     * Get all questions for a paper
     */
    getAll: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Question[] }>(
                TEACHER_QUESTION_ENDPOINTS.getAll(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherQuestions] Failed to fetch questions:", error);
            throw error;
        }
    },

    /**
     * Create a new question
     */
    create: async (paperId: string, data: Partial<Question>) => {
        try {
            const response = await http.post<{ success: boolean; data: Question }>(
                TEACHER_QUESTION_ENDPOINTS.create(paperId),
                data
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherQuestions] Failed to create question:", error);
            throw error;
        }
    },

    /**
     * Update a question
     */
    update: async (paperId: string, questionId: string, data: Partial<Question>) => {
        try {
            const response = await http.put<{ success: boolean; data: Question }>(
                TEACHER_QUESTION_ENDPOINTS.update(paperId, questionId),
                data
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherQuestions] Failed to update question:", error);
            throw error;
        }
    },

    /**
     * Delete a question
     */
    delete: async (paperId: string, questionId: string) => {
        try {
            await http.delete(TEACHER_QUESTION_ENDPOINTS.delete(paperId, questionId));
        } catch (error) {
            console.error("[TeacherQuestions] Failed to delete question:", error);
            throw error;
        }
    },

    /**
     * Bulk upload questions from a file (CSV/Excel)
     */
    bulkUpload: async (paperId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Manual fetch for FormData support
            const token = typeof window !== 'undefined' ? localStorage.getItem('hubx_access_token') : null;
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(TEACHER_QUESTION_ENDPOINTS.bulkUpload(paperId), {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Bulk upload failed');
            }

            const data = await response.json();
            return data.data;

        } catch (error) {
            console.error("[TeacherQuestions] Failed to bulk upload:", error);
            throw error;
        }
    },
};
