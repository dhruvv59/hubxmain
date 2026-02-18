/**
 * Practice Papers Service
 *
 * Maps practice paper operations to existing exam APIs
 * Backend endpoints: /api/student/practice-exams, /api/exam/*
 *
 * Server-side filtering: subject, search, difficulty, type, status
 * are all handled by the backend now.
 */

import { http } from '@/lib/http-client';
import { DASHBOARD_ENDPOINTS, EXAM_ENDPOINTS, API_BASE_URL } from '@/lib/api-config';
import type {
    GetPapersParams,
    GetPapersResponse,
    GetPaperDetailsResponse,
    StartTestResponse,
    SubmitTestResponse,
    Paper,
} from '@/types/practice-paper';

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Get practice papers (published private papers)
 * Maps to: GET /api/student/practice-exams
 *
 * All filtering is now done server-side.
 * @param params - Filter and pagination params
 * @returns Paginated list of practice papers with status
 */
export async function getPapers(params: GetPapersParams = {}): Promise<GetPapersResponse> {
    try {
        const page = params.page || 1;
        const limit = params.limit || 10;

        // Build query string with all filter params for server-side filtering
        const queryParts: string[] = [`page=${page}`, `limit=${limit}`];
        if (params.subject && params.subject !== 'All') {
            queryParts.push(`subject=${encodeURIComponent(params.subject)}`);
        }
        if (params.search) {
            queryParts.push(`search=${encodeURIComponent(params.search)}`);
        }
        if (params.difficulty) {
            // Map frontend difficulty to backend enum
            queryParts.push(`difficulty=${encodeURIComponent(mapDifficultyToBackend(params.difficulty))}`);
        }
        if (params.type && params.type !== 'all') {
            queryParts.push(`type=${encodeURIComponent(params.type)}`);
        }
        if (params.status && params.status !== 'all') {
            queryParts.push(`status=${encodeURIComponent(params.status)}`);
        }

        const queryString = queryParts.join('&');

        const response = await http.get<{
            success: boolean;
            data: {
                papers: any[];
                subjects: { id: string; name: string }[];
                stats: {
                    total: number;
                    completed: number;
                    inProgress: number;
                    assigned: number;
                    notStarted: number;
                };
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    pages: number;
                };
            };
        }>(
            `${API_BASE_URL}/student/practice-exams?${queryString}`
        );

        // Map backend papers to frontend Paper type
        const papers: Paper[] = response.data.papers.map((paper: any) => ({
            id: paper.id,
            title: paper.title,
            type: paper.isAssigned ? 'assigned' : 'practice' as const,
            subject: paper.subject?.name || paper.subjectName || 'General',
            difficulty: mapDifficulty(paper.difficulty),
            questions: paper.questionsCount || paper.totalQuestions || 0,
            duration: paper.duration || 0,
            marks: paper.totalMarks || 0,

            // Assignment info
            assignedBy: paper.assignedBy,
            assignedByAvatar: paper.assignedByAvatar,
            dueDate: paper.dueDate,
            assignmentNote: paper.assignmentNote,

            // Progress tracking
            status: paper.studentStatus || 'not-started',
            score: paper.score,
            percentage: paper.percentage,
            bestScore: paper.bestScore,
            bestPercentage: paper.bestPercentage,
            attempts: paper.attempts || 0,
            lastAttemptedAt: paper.lastAttemptedAt,
            attemptId: paper.attemptId,

            // Bookmark
            isBookmarked: paper.isBookmarked || false,

            // Metadata
            createdAt: paper.createdAt,
            updatedAt: paper.updatedAt || paper.createdAt,
        }));

        return {
            success: true,
            data: {
                papers,
                subjects: response.data.subjects || [],
                stats: response.data.stats || {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    assigned: 0,
                    notStarted: 0
                },
                pagination: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: response.data.pagination.total,
                    totalPages: response.data.pagination.pages,
                    hasNextPage: page < response.data.pagination.pages,
                    hasPrevPage: page > 1,
                },
            },
            timestamp: new Date().toISOString(),
        };
    } catch (error: any) {
        console.error('[PracticePaper] Error fetching papers:', error);
        throw error;
    }
}

/**
 * Get single paper details
 * Maps to: POST /api/exam/start/:id then GET /api/exam/:attemptId/data
 */
export async function getPaperById(id: string): Promise<GetPaperDetailsResponse> {
    try {
        const startResponse = await http.post<{
            success: boolean;
            data: {
                attemptId: string;
                paperId: string;
                status: string;
                startedAt: string;
                totalMarks: number;
            };
        }>(
            EXAM_ENDPOINTS.start(id)
        );

        const attemptId = startResponse.data.attemptId;

        const examDataResponse = await http.get<{
            success: boolean;
            data: {
                attempt: any;
                timeRemaining: number | null;
                progress: {
                    answered: number;
                    markedForReview: number;
                    total: number;
                };
            };
        }>(
            EXAM_ENDPOINTS.getData(attemptId)
        );

        const { attempt } = examDataResponse.data;
        const backendPaper = attempt.paper;

        const paper: any = {
            id: backendPaper.id,
            title: backendPaper.title,
            type: 'practice' as const,
            subject: backendPaper.subject?.name || 'General',
            difficulty: mapDifficulty(backendPaper.difficulty) as any,
            questions: backendPaper.questions?.length || 0,
            duration: backendPaper.duration || 0,
            marks: attempt.totalMarks,
            status: 'in-progress' as const,
            attempts: attempt.attemptNumber || 1,
            createdAt: backendPaper.createdAt || new Date().toISOString(),
            updatedAt: backendPaper.updatedAt || new Date().toISOString(),
        };

        const questions = (backendPaper.questions || []).map((q: any) => ({
            id: q.id,
            text: q.questionText || '',
            type: 'mcq' as const,
            marks: q.marks,
            subject: backendPaper.subject?.name || 'General',
            topic: '',
            difficulty: mapDifficulty(backendPaper.difficulty) as any,
            options: (q.options || []).map((opt: string, idx: number) => ({
                id: `${q.id}-opt-${idx}`,
                text: opt,
            })),
        }));

        return {
            success: true,
            data: {
                paper,
                questions,
            },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('[PracticePaper] Error fetching paper details:', error);
        throw error;
    }
}

/**
 * Start a practice test
 * Maps to: POST /api/exam/start/:paperId
 */
export async function startTest(paperId: string): Promise<StartTestResponse> {
    try {
        const response = await http.post<{
            success: boolean;
            message: string;
            data: {
                attemptId: string;
                paperId: string;
                status: string;
                startedAt: string;
                totalMarks: number;
            };
        }>(
            EXAM_ENDPOINTS.start(paperId),
            {}
        );

        return {
            success: true,
            data: {
                attemptId: response.data.attemptId,
                startedAt: response.data.startedAt,
                expiresAt: response.data.startedAt,
                questions: [],
            },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('[PracticePaper] Error starting test:', error);
        throw error;
    }
}

/**
 * Submit practice test
 * Maps to: POST /api/exam/:attemptId/submit
 * Now returns complete result data from the backend
 */
export async function submitTest(
    paperId: string,
    attemptId: string,
    answers?: any[]
): Promise<SubmitTestResponse> {
    try {
        const response = await http.post<{
            success: boolean;
            message: string;
            data: {
                id: string;
                paperId: string;
                status: string;
                totalScore: number;
                totalMarks: number;
                percentage: number;
                timeSpent: number;
                // New enriched fields from backend
                correctAnswers?: number;
                incorrectAnswers?: number;
                unanswered?: number;
                totalQuestions?: number;
            };
        }>(
            EXAM_ENDPOINTS.submit(attemptId),
            {}
        );

        return {
            success: true,
            data: {
                score: response.data.totalScore,
                totalMarks: response.data.totalMarks,
                percentage: response.data.percentage,
                correctAnswers: response.data.correctAnswers ?? 0,
                incorrectAnswers: response.data.incorrectAnswers ?? 0,
                unanswered: response.data.unanswered ?? 0,
                timeTaken: response.data.timeSpent,
                totalQuestions: response.data.totalQuestions ?? 0,
            },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('[PracticePaper] Error submitting test:', error);
        throw error;
    }
}

/**
 * Toggle paper bookmark
 * Maps to: POST /api/student/papers/:paperId/bookmark
 */
export async function toggleBookmark(paperId: string): Promise<{ bookmarked: boolean }> {
    try {
        const response = await http.post<{
            success: boolean;
            data: { bookmarked: boolean };
        }>(`${API_BASE_URL}/student/papers/${paperId}/bookmark`, {});
        return response.data;
    } catch (error) {
        console.error('[PracticePaper] Error toggling bookmark:', error);
        throw error;
    }
}

/**
 * Get all bookmarked papers
 * Maps to: GET /api/student/bookmarks
 */
export async function getBookmarks(): Promise<Paper[]> {
    try {
        const response = await http.get<{
            success: boolean;
            data: any[];
        }>(`${API_BASE_URL}/student/bookmarks`);
        return response.data.map((b: any) => ({
            id: b.paper?.id || b.id,
            title: b.paper?.title || b.title,
            type: 'bookmarked' as const,
            subject: b.paper?.subject?.name || 'General',
            difficulty: mapDifficulty(b.paper?.difficulty),
            questions: 0,
            duration: b.paper?.duration || 0,
            marks: 0,
            status: 'not-started' as const,
            attempts: 0,
            isBookmarked: true,
            createdAt: b.createdAt,
            updatedAt: b.createdAt,
        }));
    } catch (error) {
        console.error('[PracticePaper] Error fetching bookmarks:', error);
        throw error;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapDifficulty(backendDifficulty: string): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
        'EASY': 'easy',
        'MEDIUM': 'medium',
        'INTERMEDIATE': 'medium',
        'HARD': 'hard',
        'ADVANCED': 'hard',
    };
    return difficultyMap[backendDifficulty?.toUpperCase()] || 'medium';
}

function mapDifficultyToBackend(frontendDifficulty: string): string {
    const map: Record<string, string> = {
        'easy': 'EASY',
        'medium': 'INTERMEDIATE',
        'hard': 'ADVANCED',
    };
    return map[frontendDifficulty?.toLowerCase()] || frontendDifficulty?.toUpperCase() || 'INTERMEDIATE';
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const practicePaperService = {
    getPapers,
    getPaperById,
    startTest,
    submitTest,
    toggleBookmark,
    getBookmarks,
};
