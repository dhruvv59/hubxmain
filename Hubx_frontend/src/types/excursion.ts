export type ExcursionStatusType = "consent" | "interest";

export interface Excursion {
    id: string;
    companyName: string;
    industry: string;
    logoUrl: string;
    dateBadge?: string;
    rating: number;
    duration: string;
    maxStudents: number;
    visits: number;
    votes: number;
    location: string;
    description: string;
    tags: string[];
    // Status Logic
    statusType: ExcursionStatusType;
    statusValue: number; // percentage or count
    statusTotal?: number; // e.g. 21/30
    statusLabel?: string; // e.g. "Need 41% more vote"
    // Flags
    highDemand?: boolean;
    isApproved?: boolean;
    showConsentButton?: boolean;
}

export interface ExcursionFilters {
    search: string;
    company: string;
    type: string;
    page: number;
}

// ==========================================
// API RESPONSE TYPES (Backend Contract)
// ==========================================

export interface ApiExcursion {
    exc_uuid: string;
    org_name: string;
    sector: string; // e.g. "Renewable Energy"
    logo_image: string;

    // Scheduling
    scheduled_at?: string; // ISO date
    duration_hours: number;

    // Stats
    avg_rating: number;
    capacity_limit: number;
    total_visits_count: number;
    total_votes_count: number;

    // Details
    venue_address: string;
    about_text: string;
    highlights: string[];

    // Current State
    state: "CONSENT_PENDING" | "VOTING_OPEN" | "APPROVED";
    progress_metrics: {
        current: number;
        required: number;
        label_text?: string;
    };

    flags: {
        is_trending: boolean;
        user_c_action_required: boolean; // e.g. show consent button
    };
}
