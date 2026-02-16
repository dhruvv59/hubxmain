/**
 * Practice Papers Type Definitions
 * 
 * Comprehensive type system for practice papers feature
 * Following REST API best practices
 */

// ============================================
// CORE TYPES
// ============================================

export type PaperType = 'practice' | 'previous' | 'assigned';
export type PaperDifficulty = 'easy' | 'medium' | 'hard';
export type PaperStatus = 'not-started' | 'in-progress' | 'completed';

export interface Paper {
    id: string;
    title: string;
    type: PaperType;
    subject: string;
    difficulty: PaperDifficulty;
    questions: number;
    duration: number; // minutes
    marks: number;

    // Optional fields based on type
    year?: number; // For previous year papers
    assignedBy?: string; // For assigned tests
    assignedByAvatar?: string;
    dueDate?: string; // ISO string for assigned tests

    // Progress tracking
    status: PaperStatus;
    score?: number; // If completed
    percentage?: number; // If completed
    attempts: number;
    lastAttemptedAt?: string; // ISO string

    // Metadata
    createdAt: string;
    updatedAt: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * GET /api/v1/practice-papers
 * Query parameters for fetching papers
 */
export interface GetPapersParams {
    page?: number;
    limit?: number;
    subject?: string; // 'All' | specific subject
    type?: PaperType | 'all';
    search?: string;
    difficulty?: PaperDifficulty;
    status?: PaperStatus;
    sortBy?: 'createdAt' | 'dueDate' | 'difficulty' | 'title';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata following REST best practices
 */
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Stats for dashboard display
 */
export interface PaperStats {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    assigned: number; // Pending assigned tests
    averageScore?: number;
}

/**
 * GET /api/v1/practice-papers
 * Response structure
 */
export interface GetPapersResponse {
    success: boolean;
    data: {
        papers: Paper[];
        stats: PaperStats;
        pagination: PaginationMeta;
    };
    timestamp: string;
}

/**
 * GET /api/v1/practice-papers/:id
 * Single paper details response
 */
export interface GetPaperDetailsResponse {
    success: boolean;
    data: {
        paper: Paper;
        questions?: Question[]; // If starting test
    };
    timestamp: string;
}

/**
 * POST /api/v1/practice-papers/:id/start
 * Start test request/response
 */
export interface StartTestRequest {
    paperId: string;
}

export interface StartTestResponse {
    success: boolean;
    data: {
        attemptId: string;
        startedAt: string;
        expiresAt: string;
        questions: Question[];
    };
    timestamp: string;
}

/**
 * POST /api/v1/practice-papers/:id/submit
 * Submit test request/response
 */
export interface SubmitTestRequest {
    attemptId: string;
    answers: Answer[];
    timeSpent: number; // seconds
}

export interface SubmitTestResponse {
    success: boolean;
    data: {
        score: number;
        totalMarks: number;
        percentage: number;
        correctAnswers: number;
        incorrectAnswers: number;
        unanswered: number;
        timeTaken: number;
        rank?: number; // Optional class rank
        feedback?: string;
    };
    timestamp: string;
}

// ============================================
// QUESTION TYPES
// ============================================

export type QuestionType = 'mcq' | 'multiple-select' | 'short-answer' | 'long-answer' | 'numerical';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    marks: number;
    negativeMarks?: number;

    // For MCQ
    options?: QuestionOption[];

    // For numerical
    unit?: string;
    expectedFormat?: string;

    // Metadata
    subject: string;
    topic: string;
    difficulty: PaperDifficulty;

    // Media
    imageUrl?: string;
    videoUrl?: string;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean; // Only in answers, not in question display
}

export interface Answer {
    questionId: string;
    selectedAnswer: string | string[] | number; // Based on question type
    timeSpent: number; // seconds on this question
    isBookmarked?: boolean;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface PapersUIState {
    papers: Paper[];
    stats: PaperStats;
    pagination: PaginationMeta;
    isLoading: boolean;
    error: Error | null;
    filters: PaperFilters;
}

export interface PaperFilters {
    subject: string;
    type: PaperType | 'all';
    search: string;
    difficulty?: PaperDifficulty;
    status?: PaperStatus;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}

// ============================================
// CONSTANTS
// ============================================

export const SUBJECTS = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'English'] as const;
export type Subject = typeof SUBJECTS[number];

export const ITEMS_PER_PAGE = 9; // 3x3 grid
export const DEFAULT_PAGE = 1;
