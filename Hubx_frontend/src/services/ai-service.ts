import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS } from "@/lib/api-config";

export interface GenerateQuestionsRequest {
    subject: string;
    chapters: string[];
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
    instructions?: string;
    standard?: string;
}

export interface GeneratedQuestion {
    id?: string;
    type: "TEXT" | "MCQ" | "FILL_IN_THE_BLANKS";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionText: string;
    solutionText: string;
    marks: number;
    options?: string[];
    correctOption?: number;
    caseSensitive?: boolean;
}

export interface GenerateQuestionsResponse {
    success: boolean;
    message: string;
    data: {
        questions: GeneratedQuestion[];
        count: number;
    };
}

export const aiService = {
    /**
     * Generate questions using AI for a paper
     */
    generateQuestions: async (
        paperId: string,
        request: GenerateQuestionsRequest
    ): Promise<GeneratedQuestion[]> => {
        try {
            const response = await http.post<GenerateQuestionsResponse>(
                TEACHER_ENDPOINTS.generateQuestions(paperId),
                request
            );

            if (response.data?.questions) {
                return response.data.questions;
            }

            throw new Error("No questions in response");
        } catch (error) {
            console.error("[AI Service] Failed to generate questions:", error);
            throw error;
        }
    },
};
