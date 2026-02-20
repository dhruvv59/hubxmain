/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base API URL - should be set via environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.zapmark.in/api';

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
    login: () => `${API_BASE_URL}/auth/login`,
    register: () => `${API_BASE_URL}/auth/register`,
    profile: () => `${API_BASE_URL}/auth/profile`,
    refreshToken: () => `${API_BASE_URL}/auth/refresh-token`,
    logout: () => `${API_BASE_URL}/auth/logout`,
    changePassword: () => `${API_BASE_URL}/auth/change-password`,
} as const;

/**
 * Student Dashboard Endpoints
 */
export const DASHBOARD_ENDPOINTS = {
    getDashboard: () => `${API_BASE_URL}/student/dashboard`,
    getPublicPapers: (page = 1, limit = 10) => `${API_BASE_URL}/student/published-papers?page=${page}&limit=${limit}`,
    getExamHistory: (page = 1, limit = 10) => `${API_BASE_URL}/student/exam-history?page=${page}&limit=${limit}`,
    getPracticeExams: (page = 1, limit = 10) => `${API_BASE_URL}/student/practice-exams?page=${page}&limit=${limit}`,
    getExamResult: (attemptId: string) => `${API_BASE_URL}/student/exam-result/${attemptId}`,
    getPerformanceMetrics: () => `${API_BASE_URL}/student/performance-metrics`,
    getPercentileRange: () => `${API_BASE_URL}/student/percentile-range`,
    getSubjectPerformance: () => `${API_BASE_URL}/student/subject-performance`,
    getSyllabusCoverage: () => `${API_BASE_URL}/student/syllabus-coverage`,
    getNotifications: () => `${API_BASE_URL}/student/notifications`,
    getTestRecommendations: () => `${API_BASE_URL}/student/test-recommendations`,
    getUpcomingExams: () => `${API_BASE_URL}/student/upcoming-exams`,
    // NEW: Subject and Assessment Endpoints
    getAllSubjects: () => `${API_BASE_URL}/student/subjects`,
    generateAssessment: () => `${API_BASE_URL}/student/generate-assessment`,
} as const;

/**
 * Exam Endpoints
 */
export const EXAM_ENDPOINTS = {
    start: (paperId: string) => `${API_BASE_URL}/exam/start/${paperId}`,
    getData: (attemptId: string) => `${API_BASE_URL}/exam/${attemptId}/data`,
    getQuestion: (attemptId: string, questionIndex = 0) => `${API_BASE_URL}/exam/${attemptId}/question?questionIndex=${questionIndex}`,
    answerQuestion: (attemptId: string, questionId: string) => `${API_BASE_URL}/exam/${attemptId}/answer/${questionId}`,
    markReview: (attemptId: string, questionId: string) => `${API_BASE_URL}/exam/${attemptId}/${questionId}/mark-review`,
    nextQuestion: (attemptId: string) => `${API_BASE_URL}/exam/${attemptId}/next-question`,
    previousQuestion: (attemptId: string) => `${API_BASE_URL}/exam/${attemptId}/previous-question`,
    submit: (attemptId: string) => `${API_BASE_URL}/exam/${attemptId}/submit`,
    result: (attemptId: string) => `${API_BASE_URL}/exam/${attemptId}/result`,
    raiseDoubt: (attemptId: string, questionId: string) => `${API_BASE_URL}/exam/${attemptId}/${questionId}/doubt`,
    markHard: (attemptId: string, questionId: string) => `${API_BASE_URL}/exam/${attemptId}/${questionId}/mark-hard`,
} as const;

/**
 * Teacher Endpoints
 */
export const TEACHER_ENDPOINTS = {
    getPapers: (page = 1, limit = 10) => `${API_BASE_URL}/teacher/papers?page=${page}&limit=${limit}`,
    getPublicPapers: (filters?: string) => filters ? `${API_BASE_URL}/teacher/published-papers?${filters}` : `${API_BASE_URL}/teacher/published-papers`,
    getPaperById: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}`,
    createPaper: () => `${API_BASE_URL}/teacher/papers`,
    updatePaper: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}`,
    publishPaper: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/publish`,
    deletePaper: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}`,
    getPaperAnalytics: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/analytics`,
    generateQuestions: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/generate-questions`,
    getNotifications: () => `${API_BASE_URL}/teacher/notifications`,
} as const;

/**
 * Payment Endpoints
 */
export const PAYMENT_ENDPOINTS = {
    createOrder: () => `${API_BASE_URL}/payment/create-order`,
    verify: () => `${API_BASE_URL}/payment/verify`,
    history: () => `${API_BASE_URL}/payment/history`,
    verifyAccess: (paperId: string) => `${API_BASE_URL}/payment/verify-access/${paperId}`,
    claimFree: () => `${API_BASE_URL}/payment/claim-free`, // NEW: Free coupon redemption
} as const;

/**
 * Chat Endpoints
 */
export const CHAT_ENDPOINTS = {
    getRooms: () => `${API_BASE_URL}/chat/rooms`,
    getRoom: (paperId: string) => `${API_BASE_URL}/chat/rooms/${paperId}`,
    getMessages: (paperId: string) => `${API_BASE_URL}/chat/messages/${paperId}`,
    sendMessage: () => `${API_BASE_URL}/chat/messages`,
    getUnreadCount: (paperId: string) => `${API_BASE_URL}/chat/unread/${paperId}`,
    markAsRead: (messageId: string) => `${API_BASE_URL}/chat/messages/${messageId}/read`,
} as const;

/**
 * Organization Endpoints
 */
export const ORGANIZATION_ENDPOINTS = {
    create: () => `${API_BASE_URL}/organization`,
    getAll: () => `${API_BASE_URL}/organization`,
    getById: (id: string) => `${API_BASE_URL}/organization/${id}`,
    addMember: (id: string) => `${API_BASE_URL}/organization/${id}/members`,
    getMembers: (id: string) => `${API_BASE_URL}/organization/${id}/members`,
    removeMember: (id: string, userId: string) => `${API_BASE_URL}/organization/${id}/members/${userId}`,
    getUserOrgs: (userId: string) => `${API_BASE_URL}/organization/user/${userId}`,
} as const;

/**
 * Coupon Endpoints
 */
export const COUPON_ENDPOINTS = {
    validate: () => `${API_BASE_URL}/coupons/validate`,
    getMyCoupon: (paperId: string) => `${API_BASE_URL}/coupons/my-coupon/${paperId}`,
    getPaperCoupons: (paperId: string) => `${API_BASE_URL}/coupons/paper/${paperId}`,
    regenerate: (paperId: string) => `${API_BASE_URL}/coupons/regenerate/${paperId}`,
} as const;

/**
 * OCR Endpoints
 */
export const OCR_ENDPOINTS = {
    extractText: () => `${API_BASE_URL}/ocr/extract-text`,
} as const;

/**
 * Teacher Content Endpoints (Standards/Subjects/Chapters)
 * IMPORTANT: Backend uses nested RESTful routes - maintain hierarchy
 */
export const TEACHER_CONTENT_ENDPOINTS = {
    // Standards - Top Level
    getStandards: () => `${API_BASE_URL}/teacher/standards`,
    createStandard: () => `${API_BASE_URL}/teacher/standards`,
    getStandard: (standardId: string) => `${API_BASE_URL}/teacher/standards/${standardId}`,
    updateStandard: (standardId: string) => `${API_BASE_URL}/teacher/standards/${standardId}`,
    deleteStandard: (standardId: string) => `${API_BASE_URL}/teacher/standards/${standardId}`,

    // Subjects - NESTED under Standard
    createSubject: (standardId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects`,
    getSubjects: (standardId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects`,
    getSubject: (standardId: string, subjectId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}`,
    updateSubject: (standardId: string, subjectId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}`,
    deleteSubject: (standardId: string, subjectId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}`,

    // Chapters - NESTED under Standard AND Subject
    createChapter: (standardId: string, subjectId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}/chapters`,
    getChapters: (standardId: string, subjectId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}/chapters`,
    updateChapter: (standardId: string, subjectId: string, chapterId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}`,
    deleteChapter: (standardId: string, subjectId: string, chapterId: string) => `${API_BASE_URL}/teacher/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}`,
} as const;

/**
 * Teacher Questions Endpoints
 */
export const TEACHER_QUESTION_ENDPOINTS = {
    create: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/questions`,
    getAll: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/questions`,
    update: (paperId: string, questionId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/questions/${questionId}`,
    delete: (paperId: string, questionId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/questions/${questionId}`,
    bulkUpload: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/questions/bulk-upload`,
} as const;

/**
 * Teacher Doubts Endpoints
 */
export const TEACHER_DOUBT_ENDPOINTS = {
    getAll: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/doubts`,
    getByQuestion: (questionId: string) => `${API_BASE_URL}/teacher/questions/${questionId}/doubts`,
    reply: (doubtId: string) => `${API_BASE_URL}/teacher/doubts/${doubtId}/reply`,
    getStats: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/doubt-stats`,
    getDifficultyStats: (paperId: string) => `${API_BASE_URL}/teacher/papers/${paperId}/difficulty-stats`,
} as const;

/**
 * Teacher Question Bank Endpoints
 */
export const TEACHER_QUESTION_BANK_ENDPOINTS = {
    create: () => `${API_BASE_URL}/teacher/question-bank`,
    batchCreate: () => `${API_BASE_URL}/teacher/question-bank/batch-create`,
    getAll: (filters?: string) => filters ? `${API_BASE_URL}/teacher/question-bank?${filters}` : `${API_BASE_URL}/teacher/question-bank`,
    get: (id: string) => `${API_BASE_URL}/teacher/question-bank/${id}`,
    update: (id: string) => `${API_BASE_URL}/teacher/question-bank/${id}`,
    delete: (id: string) => `${API_BASE_URL}/teacher/question-bank/${id}`,
    addToPaper: (id: string) => `${API_BASE_URL}/teacher/question-bank/${id}/add-to-paper`,
    bulkUpload: () => `${API_BASE_URL}/teacher/question-bank/bulk-upload`,
} as const;

/**
 * Analytics Endpoints
 */
export const ANALYTICS_ENDPOINTS = {
    teacher: () => `${API_BASE_URL}/analytics/teacher`,
    student: () => `${API_BASE_URL}/analytics/student`,
    paper: (paperId: string) => `${API_BASE_URL}/analytics/paper/${paperId}`,
} as const;

/**
 * System Status Endpoints
 */
export const SYSTEM_STATUS_ENDPOINTS = {
    getStatus: () => `${API_BASE_URL}/system/status`,
} as const;

/**
 * API Client Configuration
 */
export const API_CONFIG = {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
} as const;
