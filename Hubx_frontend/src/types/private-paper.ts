export interface PrivatePaper {
    id: string;
    title: string;
    std: string;
    tags: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    rating: number;
    questionsCount: number;
    duration: number; // in minutes
    attempts: number;
    date: string;
    plays: number;
    teacher: {
        name: string;
        avatar: string;
    };
    subject: string;
}

export interface PrivatePaperFilters {
    subject?: string;
    std?: string;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
}
