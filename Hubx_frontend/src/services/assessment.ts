import { AssessmentDetail, AssessmentFilters, AssessmentResult, Subject } from "@/types/assessment";
import { http } from "@/lib/http-client";
import { DASHBOARD_ENDPOINTS, EXAM_ENDPOINTS } from "@/lib/api-config";

/**
 * Backend Response Types
 */

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
                standard: number;
                difficulty: string;
                type: string;
                duration: number | null;
                status: string;
                isPublic: boolean;
                price: number;
                totalAttempts: number;
                averageScore: number;
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

interface BackendExamDataResponse {
    success: boolean;
    message: string;
    data: {
        attempt: {
            id: string;
            paperId: string;
            status: string;
            startedAt: string;
            submittedAt: string | null;
            totalScore: number;
            totalMarks: number;
            percentage: number;
            timeSpent: number | null;
            answers: Array<any>;
            paper: {
                id: string;
                title: string;
                type: string;
                duration: number | null;
                status: string;
                questions: Array<{
                    id: string;
                    type: string;
                    difficulty: string;
                    questionText: string;
                    questionImage: string | null;
                    options: string[];
                    marks: number;
                    order: number;
                }>;
            };
        };
        timeRemaining: number | null;
        progress: {
            answered: number;
            markedForReview: number;
            total: number;
        };
    };
}

interface BackendStartExamResponse {
    success: boolean;
    message: string;
    data: {
        attemptId: string;
        paperId: string;
        status: string;
        startedAt: string;
        totalMarks: number;
    };
}

interface BackendSubmitExamResponse {
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
}

/**
 * Adapter: transforms backend exam attempt to UI AssessmentResult
 */
function transformAttemptToResult(
    attempt: BackendExamHistoryResponse['data']['attempts'][0]
): AssessmentResult {
    const levelMap: Record<string, "Advanced" | "Beginner" | "Intermediate"> = {
        "ADVANCED": "Advanced",
        "EASY": "Beginner",
        "INTERMEDIATE": "Intermediate"
    };

    const timeSpentMins = attempt.timeSpent ? Math.round(attempt.timeSpent / 60) : 0;
    const durationMins = attempt.paper.duration || 0;

    return {
        id: attempt.id,
        title: attempt.paper.title,
        level: levelMap[attempt.paper.difficulty] || "Intermediate",
        tags: [],
        date: attempt.submittedAt
            ? new Date(attempt.submittedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
            : "In Progress",
        scoreObtained: attempt.totalScore,
        totalScore: attempt.totalMarks,
        durationTakenString: `${timeSpentMins}/${durationMins} mins`,
        correctCount: 0,
        wrongCount: 0,
        totalQuestions: 0,
        flags: 0,
        doubts: 0,
        marked: 0,
        percentage: attempt.percentage,
    };
}

/**
 * Adapter: transforms backend exam data to UI AssessmentDetail
 */
function transformExamDataToDetail(
    data: BackendExamDataResponse['data']
): AssessmentDetail {
    const paper = data.attempt.paper;

    return {
        id: data.attempt.id,
        title: paper.title,
        subjects: [],
        level: "Intermediate",
        totalScore: data.attempt.totalMarks,
        durationSeconds: paper.duration ? paper.duration * 60 : 0,
        questions: paper.questions.map((q, index) => ({
            // CRITICAL FIX: Use real backend question ID (UUID) instead of index
            id: q.id, // ✅ Now uses real Prisma CUID like "clxxx..."
            text: q.questionText,
            type: q.type === "MCQ" ? "MCQ" as const : "Text" as const,
            points: q.marks,
            // ✅ Options now include numeric index for backend compatibility
            options: (q.options || []).map((opt, i) => ({
                id: String.fromCharCode(65 + i), // A, B, C, D for display
                text: opt,
                index: i, // ✅ NEW: Numeric index (0-3) for backend API
            })),
            order: q.order, // ✅ Preserve original order
        })),
    };
}

/**
 * Fetch available subjects and their performance stats.
 * NEW: Uses dedicated /subjects endpoint (fixes cold start issue)
 */
export async function getAssessmentSubjects(): Promise<Subject[]> {
    try {
        const response = await http.get<any>(DASHBOARD_ENDPOINTS.getAllSubjects());

        // Transform API response to Subject type
        return (response.data || []).map((subject: any) => ({
            id: subject.id,
            name: subject.name,
            score: subject.score || 0,
            totalQuestions: 0, // Will be populated when needed
            progress: subject.score || 0,
            color: subject.color || "#9ca3af",
            icon: "BookOpen", // Default icon
            chapters: subject.chapters || [],
        }));
    } catch (error) {
        console.error('[Assessment] Failed to fetch subjects:', error);
        // Return empty array to prevent UI breaking
        return [];
    }
}

/**
 * NEW: Generate adaptive assessment based on user selections
 * Solves: Custom assessment creation
 * @param config - Assessment configuration (subjects, chapters, difficulty, duration)
 * @returns Generated paper details ready for exam
 */
export async function generateAdaptiveAssessment(config: {
    subjectIds: string[];
    chapterIds: string[];
    difficulty: string;
    duration: number | null;
}): Promise<{
    paperId: string;
    title: string;
    questionCount: number;
    duration: number | null;
    totalMarks: number;
}> {
    try {
        const response = await http.post<any>(
            DASHBOARD_ENDPOINTS.generateAssessment(),
            {
                subjectIds: config.subjectIds,
                chapterIds: config.chapterIds,
                difficulty: config.difficulty,
                duration: config.duration,
            }
        );

        if (!response.success) {
            throw new Error(response.message || "Failed to generate assessment");
        }

        return response.data;
    } catch (error: any) {
        console.error("[generateAdaptiveAssessment] Error:", error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Unable to generate assessment. Please try again."
        );
    }
}

/**
 * Fetch past assessment results with optional filtering.
 * Maps from GET /api/student/exam-history
 */
export async function getPastAssessments(
    filters?: AssessmentFilters
): Promise<{ data: AssessmentResult[]; total: number }> {
    try {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;

        const response = await http.get<BackendExamHistoryResponse>(
            DASHBOARD_ENDPOINTS.getExamHistory(page, limit)
        );

        let results = response.data.attempts.map(transformAttemptToResult);

        // Client-side filtering for fields not supported by backend query
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        if (filters?.level && filters.level !== "All") {
            results = results.filter(r => r.level === filters.level);
        }

        if (filters?.sortBy === "Score High-Low") {
            results.sort((a, b) => b.percentage - a.percentage);
        } else if (filters?.sortBy === "Score Low-High") {
            results.sort((a, b) => a.percentage - b.percentage);
        }

        return {
            data: results,
            total: response.data.pagination.total,
        };
    } catch (error) {
        console.error('[Assessment] Failed to fetch past assessments:', error);
        throw error;
    }
}

/**
 * Fetch assessment detail by starting/retrieving exam data.
 * Uses GET /api/exam/:attemptId/data
 *
 * NOTE: The `id` parameter here is the attemptId (after starting an exam).
 * If the caller has a paperId instead, they should call startAssessment first.
 */
export async function getAssessmentDetail(id: string): Promise<AssessmentDetail> {
    try {
        const response = await http.get<BackendExamDataResponse>(
            EXAM_ENDPOINTS.getData(id)
        );
        return transformExamDataToDetail(response.data);
    } catch (error) {
        console.error('[Assessment] Failed to fetch assessment detail:', error);
        throw error;
    }
}

/**
 * Start a new exam attempt for a paper.
 * Uses POST /api/exam/start/:paperId
 * Returns the attemptId needed for subsequent exam operations.
 */
export async function startAssessment(paperId: string): Promise<{ attemptId: string }> {
    try {
        const response = await http.post<BackendStartExamResponse>(
            EXAM_ENDPOINTS.start(paperId)
        );
        return { attemptId: response.data.attemptId };
    } catch (error) {
        console.error('[Assessment] Failed to start assessment:', error);
        throw error;
    }
}

/**
 * Submit assessment answers.
 * Uses POST /api/exam/:attemptId/submit
 *
 * NOTE: Individual answers should be submitted during the exam via
 * POST /api/exam/:attemptId/answer/:questionId. This function
 * finalizes the exam attempt.
 */
export async function submitAssessment(
    attemptId: string,
    _answers: Record<number, string>
): Promise<{ resultId: string; score: number }> {
    try {
        const response = await http.post<BackendSubmitExamResponse>(
            EXAM_ENDPOINTS.submit(attemptId)
        );
        return {
            resultId: response.data.id,
            score: response.data.totalScore,
        };
    } catch (error) {
        console.error('[Assessment] Failed to submit assessment:', error);
        throw error;
    }
}
