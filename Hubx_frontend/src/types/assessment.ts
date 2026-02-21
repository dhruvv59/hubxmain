export type AssessmentLevel = "Beginner" | "Intermediate" | "Advanced";

export interface AnswerOption {
    id: string; // Display ID (A, B, C, D)
    text: string;
    index?: number; // ✅ NEW: Numeric index (0-3) for backend API calls
}

export interface Question {
    id: string; // ✅ CHANGED: Now string (UUID) instead of number
    text: string;
    type: "MCQ" | "Text" | "FILL_IN_THE_BLANKS";
    options: AnswerOption[];
    questionImage?: string | null; // S3 URL for question attachment
    correctAnswer?: string; // Should be hidden in a real safe exam browser, but fetched here for immediate feedback if allowed
    points: number;
    order?: number; // ✅ NEW: Original question order from paper
}

export interface AssessmentDetail {
    id: string;
    title: string;
    subjects: string[]; // e.g. ["Mathematics", "Science"]
    level: AssessmentLevel;
    totalScore: number;
    durationSeconds: number; // e.g. 5400 for 90 mins
    questions: Question[];
}

export interface AssessmentResult {
    id: string;
    title: string;
    level: AssessmentLevel;
    tags: string[]; // Subject tags
    date: string; // ISO date or formatted string
    scoreObtained: number;
    totalScore: number;
    durationTakenString: string; // "90/90 mins"
    correctCount: number;
    wrongCount: number;
    totalQuestions: number;
    flags: number;
    doubts: number;
    marked: number;
    percentage: number;
}

export interface AssessmentFilters {
    subject?: string;
    level?: string; // "All" | AssessmentLevel
    search?: string;
    sortBy?: "Most Recent" | "Score High-Low" | "Score Low-High";
    page?: number;
    limit?: number;
}

export type PerformanceLevel = "Excellent" | "Average" | "Poor";

export interface Chapter {
    id: string;
    name: string;
    questionCount: number;
}

export interface Subject {
    id: string;
    name: string;
    score: number;
    performance: PerformanceLevel;
    chapters: Chapter[];
    totalQuestions: number;
}

export interface PublicPaper {
    id: string;
    title: string;
    badges: string[]; // e.g., ["FEATURED"]
    price: number;
    level: AssessmentLevel;
    tags: string[]; // e.g., ["Algebra", "Geometry"]
    rating: number;
    questionCount: number;
    durationMinutes: number;
    attempts: number;
    date: string; // "29 Oct 2025"
    subject: string;
    teacher: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    purchased?: boolean;
}

// ==========================================
// API RESPONSE TYPES (Backend Contract)
// ==========================================

export interface ApiPublicPaper {
    paper_uuid: string;
    paper_title: string;
    is_featured: boolean;
    cost_amount: number; // e.g. 200
    difficulty_grade: string; // "ADVANCED"
    topic_tags: string[];
    user_rating: number; // 4.5
    stats: {
        total_questions: number;
        duration_minutes: number;
        total_attempts: number;
    };
    created_at_date: string; // ISO
    subject_name: string;
    author: {
        teacher_id: string;
        display_name: string;
        profile_pic_url: string;
    };
}

export interface PaperFilters {
    subject?: string;
    level?: string;
    rating?: string; // "4 & above"
    search?: string;
    sortBy?: string;
    teacherId?: string;
}

export interface TeacherProfile {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
    subjects: string[]; // "Mathematics", "Science"
    stats: {
        publicPapers: number;
        notifiedStudents: number;
    };
    bio?: string; // "Mathematics, Science, Social Science"
}

export interface TestSettings {
    noTimeLimit: boolean;
    showAnswersAfterWrong: boolean;
    inTestSolutionView: boolean;
}

// ==========================================
// API RESPONSE TYPES (Backend Contract)
// ==========================================

export interface ApiChapter {
    sys_id: string;
    title: string;
    q_count: number;
}

export interface ApiSubject {
    subject_id: string;
    display_name: string;
    current_score: number; // 0-100
    total_q_count: number;
    chapters: ApiChapter[];
}

export interface ApiAssessmentResult {
    exam_id: string;
    exam_title: string;
    difficulty_level: string; // Backend might send "ADVANCED" (uppercase)
    tags_list: string[];
    submission_date: string; // ISO String
    score_details: {
        obtained: number;
        max: number;
    };
    timings: {
        time_taken_seconds: number;
        total_duration_seconds: number;
    };
    stats: {
        correct: number;
        wrong: number;
        total_qs: number;
        flags: number;
        doubts: number;
        marked: number;
    };
}

export interface ApiQuestion {
    q_id: number;
    problem_statement: string;
    q_type: "MCQ";
    max_points: number;
    answer_choices: { choice_id: string, label: string }[]; // e.g. [{ choice_id: "A", label: "3x10..." }]
    correct_choice_id: string; // "A"
}

export interface ApiAssessmentDetail {
    exam_uuid: string;
    exam_name: string;
    subject_names: string[];
    difficulty: string; // "ADVANCED"
    max_marks: number;
    allowed_time_seconds: number;
    question_paper: ApiQuestion[];
}
