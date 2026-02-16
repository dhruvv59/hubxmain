/**
 * Practice Papers Service
 *
 * Maps practice paper operations to existing exam APIs
 * Backend endpoints: /api/student/practice-exams, /api/exam/*
 *
 * IMPORTANT: This service is a facade over existing exam functionality
 */

import { http } from '@/lib/http-client';
import { DASHBOARD_ENDPOINTS, EXAM_ENDPOINTS } from '@/lib/api-config';
import type {
    GetPapersParams,
    GetPapersResponse,
    GetPaperDetailsResponse,
    StartTestResponse,
    SubmitTestResponse,
    Paper,
    PaginationMeta,
} from '@/types/practice-paper';

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Get practice papers (purchased papers)
 * Maps to: GET /api/student/practice-exams
 *
 * @param params - Filter and pagination params
 * @returns Paginated list of practice papers
 */
export async function getPapers(params: GetPapersParams = {}): Promise<GetPapersResponse> {
    try {
        const page = params.page || 1;
        const limit = params.limit || 10;

        const response = await http.get<{
            success: boolean;
            data: {
                papers: any[];
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
            DASHBOARD_ENDPOINTS.getPracticeExams(page, limit)
        );

        const papers: any[] = response.data.papers.map((paper: any) => ({
            id: paper.id,
            title: paper.title,
            description: paper.description || '',
            subject: paper.subject?.name || 'General',
            difficulty: mapDifficulty(paper.difficulty),
            duration: paper.duration || 0,
            totalQuestions: paper.questions?.length || 0,
            totalMarks: paper.questions?.reduce((sum: number, q: any) => sum + (q.marks || 0), 0) || 0,
            price: paper.price || 0,
            isPurchased: true,
            createdAt: paper.createdAt,
        }));

        let filteredPapers = papers;

        if (params.subject && params.subject !== 'All') {
            filteredPapers = filteredPapers.filter(p => p.subject === params.subject);
        }

        if (params.difficulty) {
            filteredPapers = filteredPapers.filter(p => p.difficulty === params.difficulty);
        }

        if (params.search) {
            const query = params.search.toLowerCase();
            filteredPapers = filteredPapers.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.subject.toLowerCase().includes(query)
            );
        }

        return {
            success: true,
            data: {
                papers: filteredPapers,
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
            attempts: 1,
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
                correctAnswers: 0,
                incorrectAnswers: 0,
                unanswered: 0,
                timeTaken: response.data.timeSpent,
            },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('[PracticePaper] Error submitting test:', error);
        throw error;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapDifficulty(backendDifficulty: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const difficultyMap: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'> = {
        'EASY': 'Beginner',
        'MEDIUM': 'Intermediate',
        'INTERMEDIATE': 'Intermediate',
        'HARD': 'Advanced',
        'ADVANCED': 'Advanced',
    };
    return difficultyMap[backendDifficulty?.toUpperCase()] || 'Intermediate';
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const practicePaperService = {
    getPapers,
    getPaperById,
    startTest,
    submitTest,
};
