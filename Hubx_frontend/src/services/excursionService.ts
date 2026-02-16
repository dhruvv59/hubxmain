import { Excursion, ApiExcursion } from "@/types/excursion";

// --- 1. RAW BACKEND RESPONSE (Mocked) ---
const MOCK_API_RESPONSE: ApiExcursion[] = [
    {
        exc_uuid: "1",
        org_name: "Excursion",
        sector: "Renewable Energy",
        logo_image: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Ola_Cabs_logo.svg",
        scheduled_at: "2025-01-10T14:00:00Z",
        duration_hours: 3,
        avg_rating: 4.5,
        capacity_limit: 40,
        total_visits_count: 57,
        total_votes_count: 72,
        venue_address: "Krishnagiri, Tamil Nadu, India",
        about_text: "Pioneer in solar and wind energy solutions. Students will explore renewable energy technologies, sustainability practices, and environmental engineering.",
        highlights: ["Solar Farm", "Wind Turbine Site", "Research Lab", "Control Room"],
        state: "CONSENT_PENDING",
        progress_metrics: { current: 21, required: 30 },
        flags: { is_trending: false, user_c_action_required: false }
    },
    {
        exc_uuid: "2",
        org_name: "Glenmark",
        sector: "Biotechnology",
        logo_image: "",
        scheduled_at: "2025-01-22T14:00:00Z",
        duration_hours: 3,
        avg_rating: 4.5,
        capacity_limit: 40,
        total_visits_count: 57,
        total_votes_count: 72,
        venue_address: "Krishnagiri, Tamil Nadu, India",
        about_text: "Pioneer in solar and wind energy solutions. Students will explore renewable energy technologies, sustainability practices, and environmental engineering.",
        highlights: ["Solar Farm", "Wind Turbine Site", "Research Lab", "Control Room"],
        state: "VOTING_OPEN",
        progress_metrics: { current: 75, required: 100 },
        flags: { is_trending: true, user_c_action_required: true }
    },
    {
        exc_uuid: "3",
        org_name: "Google",
        sector: "Software Company",
        logo_image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        duration_hours: 3,
        avg_rating: 4.5,
        capacity_limit: 40,
        total_visits_count: 57,
        total_votes_count: 72,
        venue_address: "Krishnagiri, Tamil Nadu, India",
        about_text: "Pioneer in solar and wind energy solutions. Students will explore renewable energy technologies, sustainability practices, and environmental engineering.",
        highlights: ["Solar Farm", "Wind Turbine Site", "Research Lab", "Control Room"],
        state: "VOTING_OPEN",
        progress_metrics: { current: 75, required: 100 },
        flags: { is_trending: true, user_c_action_required: false }
    },
    {
        exc_uuid: "4",
        org_name: "Adani Green",
        sector: "Renewable Energy",
        logo_image: "",
        duration_hours: 3,
        avg_rating: 4.5,
        capacity_limit: 40,
        total_visits_count: 57,
        total_votes_count: 72,
        venue_address: "Krishnagiri, Tamil Nadu, India",
        about_text: "Pioneer in solar and wind energy solutions. Students will explore renewable energy technologies, sustainability practices, and environmental engineering.",
        highlights: ["Solar Farm", "Wind Turbine Site", "Research Lab", "Control Room"],
        state: "VOTING_OPEN",
        progress_metrics: { current: 29, required: 100, label_text: "Need 41% more vote" },
        flags: { is_trending: false, user_c_action_required: false }
    }
];

// --- 2. ADAPTER / MAPPER LAYER ---

function transformExcursion(apiData: ApiExcursion): Excursion {
    let statusType: "consent" | "interest" = "interest";
    let isApproved = false;

    if (apiData.state === "CONSENT_PENDING") statusType = "consent";
    if (apiData.state === "APPROVED") isApproved = true;

    // Formatting Date using Intl for better reliability
    let dateBadge = undefined;
    if (apiData.scheduled_at) {
        const d = new Date(apiData.scheduled_at);
        // Simple formatter for "10th Jan 2pm" style
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const time = d.getHours() > 12 ? `${d.getHours() - 12}pm` : `${d.getHours()}am`;
        // Helper for suffix
        const suffix = ["th", "st", "nd", "rd"][((day % 100) > 10 && (day % 100) < 20) ? 0 : (day % 10 < 4 ? day % 10 : 0)];
        dateBadge = `${day}${suffix} ${month} ${time}`;
    }

    return {
        id: apiData.exc_uuid,
        companyName: apiData.org_name,
        industry: apiData.sector,
        logoUrl: apiData.logo_image,
        dateBadge: dateBadge,
        rating: apiData.avg_rating,
        duration: `${apiData.duration_hours} Hours`,
        maxStudents: apiData.capacity_limit,
        visits: apiData.total_visits_count,
        votes: apiData.total_votes_count,
        location: apiData.venue_address,
        description: apiData.about_text,
        tags: apiData.highlights,
        statusType: statusType,
        statusValue: apiData.progress_metrics.current,
        statusTotal: apiData.progress_metrics.required,
        statusLabel: apiData.progress_metrics.label_text,
        highDemand: apiData.flags.is_trending,
        showConsentButton: apiData.flags.user_c_action_required,
        isApproved: isApproved
    };
}


// --- 3. SERVICES (API Calls) ---
/**
 * Simulates a backend API service.
 * In production, this would use fetch/axios to call your real endpoints.
 */
export const excursionService = {
    getAll: async (): Promise<Excursion[]> => {
        // Simulate network delay (remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Return transformed data
        return MOCK_API_RESPONSE.map(transformExcursion);
    },

    getById: async (id: string): Promise<Excursion | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const raw = MOCK_API_RESPONSE.find((e) => e.exc_uuid === id);
        return raw ? transformExcursion(raw) : undefined;
    },
};
