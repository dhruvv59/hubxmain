// Existing interfaces
export interface TrendData {
    value: string;
    isUp: boolean;
    color?: string;
}

export interface StatCardData {
    id: string;
    title: string;
    value: string | number;
    subtext?: string;
    trend?: TrendData;
    gradient: string;
    isCustomGradient?: boolean;
}

export interface UpcomingExam {
    id: string;
    title: string;
    date: string; // e.g., "12 Oct, 2025"
    time: string; // e.g., "10:00 AM"
    subject: string;
    type: "Mock Test" | "Final Exam" | "Quiz";
}




// HubX System - Test Recommendation
export interface HubXTestRecommendation {
    id: string;
    title: string;
    subject: string;
    difficulty: "Hard" | "Medium" | "Easy";
    questions: number;
    time: string; // e.g. "30 mins"
    type: "AI Generated" | "System" | "Previous Year";
}


export interface PaperStatData {
    id: string;
    title: string;
    count: number;
    badgeCount?: number;
    borderColorClass: string;
    link?: string; // Link destination for the card
}

export interface ChartDataPoint {
    name: string;
    score: number;
    fill: string;
    count?: number;
}

export interface Notification {
    id: number;
    author: string;
    text: string;
    avatar?: string; // URL
}

export interface FocusArea {
    id: string;
    subject: string;
    topic: string;
    score: string;
    scoreColorClass: string;
}

// New Interfaces for Dynamic Widgets

export interface SyllabusData {
    subject: string;
    totalChapters: number;
    completedChapters: number;
    hexColor: string; // e.g. #86efac
    color: string; // Tailwind class fallback
}

export interface ExcursionData {
    id: string;
    title: string;
    status: string;
    link: string;
}

export interface SubjectPerformanceMetric {
    subject: string;
    score: number; // 0-100
    color: string;
}

export interface SubjectPerformanceData {
    currentSubject: string;
    metrics: SubjectPerformanceMetric[]; // For the dropdown
    overallPercentage: number;
    trend: string;
}

export interface PeerRankPoint {
    x: number; // Percentile (0-100)
    y: number; // Curve value
}

export interface PeerRankData {
    currentRank: number;
    currentPercentile: number;
    history: PeerRankPoint[]; // The curve data
    highestRankPercentile: number;
}

export interface RecentActivityItem {
    id: string;
    action: string; // e.g., "Completed Mock Test", "Watched Video"
    subject: string;
    target: string; // e.g., "Chapter 4: Force", "Math Full Syllabus"
    timestamp: string; // e.g. "2 hours ago"
    score?: number; // Optional
    isPositive?: boolean; // For color coding
}

export interface DailyQuestionData {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index
    subject: string;
}

export interface WelcomeBannerData {
    greeting: string;
    quote: string;
    daysLeft: number;
    examName: string;
}



export interface DashboardData {
    user: {
        name: string;
        avatar?: string;
    };
    stats: StatCardData[];
    papers: PaperStatData[];
    performanceData: ChartDataPoint[]; // For the main Performance Chart
    notifications: Notification[];
    focusAreas: FocusArea[];
    syllabus: SyllabusData[];

    // New Dynamic Data Fields
    latestExcursion: ExcursionData | null;
    subjectPerformance: SubjectPerformanceData;
    peerRank: PeerRankData;
    recentActivities: RecentActivityItem[];
    dailyQuestion: DailyQuestionData;
    welcome: WelcomeBannerData;
    upcomingExams: UpcomingExam[];
    testRecommendations: HubXTestRecommendation[];
}






// ==========================================
// API RESPONSE TYPES (Backend Contract)
// ==========================================

export interface ApiStudentProfile {
    id: string;
    fullName: string;
    avatarUrl?: string; // Optional
}

export interface ApiPerformanceMetrics {
    globalRank: {
        current: number;
        trend: number; // e.g., +3 or -2
    };
    averageScore: {
        current: number; // e.g., 86
        trend: number; // e.g., 2.1 (percent)
    };
    averageTimeBeforeSubmission: {
        minutes: number;
        trend: number; // e.g. 1
    };
}

// Complete API Response interface
export interface DashboardApiResponse {
    student: ApiStudentProfile;
    performance: ApiPerformanceMetrics;
    // ... validation for other fields can be added here
    dashboard_layout: any; // Flexible for now, or strict if we define all
    syllabus: SyllabusData[];
}
