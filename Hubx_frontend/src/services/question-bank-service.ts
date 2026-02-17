/**
 * Question Bank Service
 * Handles teacher's standalone question library (separate from papers)
 */

import { http } from '@/lib/http-client';
import { TEACHER_QUESTION_BANK_ENDPOINTS } from '@/lib/api-config';
import type { Question } from "@/types/generate-paper";

export interface QuestionBankFilter {
    subject?: string;
    difficulty?: string[];
    rating?: string;
    addedTime?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// Backend response types
interface BackendQuestionBank {
    id: string;
    type: 'TEXT' | 'MCQ' | 'FILL_IN_THE_BLANKS';
    difficulty: 'EASY' | 'INTERMEDIATE' | 'ADVANCED';
    questionText: string;
    questionImage?: string;
    options?: string[];
    correctOption?: number;
    caseSensitive?: boolean;
    correctAnswers?: string[][];
    solutionText?: string;
    solutionImage?: string;
    marks: number;
    subject?: { id: string; name: string } | null;
    chapters: Array<{ id: string; name: string }>;
    tags: string[];
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface BackendResponse {
    success: boolean;
    message: string;
    data: {
        questions: BackendQuestionBank[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        filters?: {
            subjects: Array<{ id: string | null; count: number }>;
            chapters: Array<{ id: string; count: number }>;
            tags: Array<{ tag: string; count: number }>;
        };
    };
}

/**
 * Transform backend question to frontend Question format
 */
function transformBackendQuestion(backendQ: BackendQuestionBank): Question {
    // Map backend type to frontend type
    const typeMap: Record<string, string> = {
        'TEXT': 'Text',
        'MCQ': 'MCQ',
        'FILL_IN_THE_BLANKS': 'Fill in the Blanks'
    };

    // Map backend difficulty to frontend format
    const difficultyMap: Record<string, string> = {
        'EASY': 'Easy',
        'INTERMEDIATE': 'Intermediate',
        'ADVANCED': 'Advanced'
    };

    return {
        id: backendQ.id,
        type: (typeMap[backendQ.type] || backendQ.type) as "Text" | "MCQ" | "Fill in the Blanks",
        difficulty: (difficultyMap[backendQ.difficulty] || backendQ.difficulty) as "Easy" | "Intermediate" | "Advanced",
        content: backendQ.questionText,
        solution: backendQ.solutionText || '',
        marks: backendQ.marks,
    };
}

/**
 * Fetch questions from teacher's question bank with filtering
 */
export async function getBankQuestions(filters: QuestionBankFilter = {}): Promise<Question[]> {
    try {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
        // NOTE: Subject filter disabled - frontend sends subject NAME but backend expects ID
        // TODO: Fetch actual subject IDs from backend and map them before sending
        // if (filters.subject) params.append('subjectId', filters.subject);
        if (filters.search) params.append('search', filters.search);

        // Handle difficulty filter (array)
        if (filters.difficulty && filters.difficulty.length > 0 && !filters.difficulty.includes("All")) {
            // For now, we'll just use the first difficulty
            // Backend supports single difficulty, not array
            // Map frontend difficulty names to backend enum values
            const difficultyMap: Record<string, string> = {
                'Beginner': 'EASY',
                'Intermediate': 'INTERMEDIATE',
                'Advanced': 'ADVANCED',
                'Easy': 'EASY',
            };
            const difficulty = difficultyMap[filters.difficulty[0]] || filters.difficulty[0].toUpperCase();
            params.append('difficulty', difficulty);
        }

        const response = await http.get<BackendResponse>(
            TEACHER_QUESTION_BANK_ENDPOINTS.getAll(params.toString())
        );

        // Transform backend questions to frontend format
        return response.data.questions.map(transformBackendQuestion);
    } catch (error) {
        console.error('[QuestionBankService] Failed to fetch questions:', error);
        throw error;
    }
}

/**
 * Get a single question from the bank
 */
export async function getBankQuestion(questionId: string): Promise<Question> {
    try {
        const response = await http.get<{ success: boolean; message: string; data: BackendQuestionBank }>(
            TEACHER_QUESTION_BANK_ENDPOINTS.get(questionId)
        );

        return transformBackendQuestion(response.data);
    } catch (error) {
        console.error('[QuestionBankService] Failed to fetch question:', error);
        throw error;
    }
}

/**
 * Create a new question in the bank
 */
export async function createBankQuestion(data: FormData): Promise<Question> {
    try {
        const response = await http.post<{ success: boolean; message: string; data: BackendQuestionBank }>(
            TEACHER_QUESTION_BANK_ENDPOINTS.create(),
            data
        );

        return transformBackendQuestion(response.data);
    } catch (error) {
        console.error('[QuestionBankService] Failed to create question:', error);
        throw error;
    }
}

/**
 * Update a question in the bank
 */
export async function updateBankQuestion(questionId: string, data: FormData): Promise<Question> {
    try {
        const response = await http.put<{ success: boolean; message: string; data: BackendQuestionBank }>(
            TEACHER_QUESTION_BANK_ENDPOINTS.update(questionId),
            data
        );

        return transformBackendQuestion(response.data);
    } catch (error) {
        console.error('[QuestionBankService] Failed to update question:', error);
        throw error;
    }
}

/**
 * Delete a question from the bank
 */
export async function deleteBankQuestion(questionId: string): Promise<void> {
    try {
        await http.delete(TEACHER_QUESTION_BANK_ENDPOINTS.delete(questionId));
    } catch (error) {
        console.error('[QuestionBankService] Failed to delete question:', error);
        throw error;
    }
}

/**
 * Add a question from bank to a paper
 */
export async function addQuestionToPaper(questionId: string, paperId: string, order?: number): Promise<void> {
    try {
        await http.post(
            TEACHER_QUESTION_BANK_ENDPOINTS.addToPaper(questionId),
            { paperId, order }
        );
    } catch (error) {
        console.error('[QuestionBankService] Failed to add question to paper:', error);
        throw error;
    }
}
