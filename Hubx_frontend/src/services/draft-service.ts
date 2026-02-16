import { PaperConfig, Question, Difficulty } from "@/types/generate-paper";
import { http } from "@/lib/http-client";
import { TEACHER_ENDPOINTS, TEACHER_QUESTION_ENDPOINTS } from "@/lib/api-config";

/**
 * Creates a new paper (draft) on the backend
 */
export const saveDraft = async (config: PaperConfig): Promise<string> => {
    try {
        // Extract standard number if not provided directly
        let standardNum = config.standardValue;
        if (!standardNum && config.standard) {
            const match = config.standard.match(/\d+/);
            if (match) standardNum = parseInt(match[0]);
        }

        // Map frontend config to backend payload
        const payload = {
            title: config.title,
            standard: standardNum,
            subjectId: config.subjectId,
            difficulty: config.difficulty.toUpperCase(),
            type: config.isTimeBound ? "TIME_BOUND" : "NO_LIMIT", // Backend expects these
            duration: config.duration,
            isPublic: config.isPublic,
            price: config.price,
            chapterIds: config.chapters.filter(c => c.selected).map(c => c.id),
            description: "Created via AI Assessment"
        };

        console.log("Saving Draft Payload:", payload);

        const response = await http.post<any>(TEACHER_ENDPOINTS.createPaper(), payload);
        // Handle both wrapped ({ data: { id } }) and unwrapped ({ id }) responses
        return response.data?.id || response.id;
    } catch (error) {
        console.error("Failed to save draft:", error);
        throw new Error("Failed to create paper. Please try again.");
    }
};

/**
 * Fetches an existing paper and maps it to PaperConfig format
 */
export const getDraft = async (draftId: string): Promise<PaperConfig | null> => {
    try {
        const response = await http.get<any>(TEACHER_ENDPOINTS.getPaperById(draftId));
        const paper = response.data;

        if (!paper) return null;

        // Map backend Paper to frontend PaperConfig
        return {
            title: paper.title,
            standard: `Standard ${paper.standard}`,
            standardValue: paper.standard,
            subject: paper.subject?.name || "Unknown",
            subjectId: paper.subjectId,
            difficulty: mapDifficulty(paper.difficulty),
            chapters: paper.chapters?.map((pc: any) => ({
                id: pc.chapterId,
                name: pc.chapter?.name || "Unknown Chapter",
                selected: true
            })) || [],
            isTimeBound: paper.type === "TIME_BOUND",
            isPublic: paper.isPublic,
            schoolOnly: false, // Not currently supported by backend
            duration: paper.duration || 60,
            price: paper.price || 0,
            questions: paper.questions?.map((q: any) => ({
                id: q.id,
                type: q.type,
                difficulty: mapDifficulty(q.difficulty),
                content: q.questionText,
                solution: q.solutionText || "",
                marks: q.marks,
                options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined
            })) || []
        };
    } catch (error) {
        console.error("Failed to fetch draft:", error);
        return null;
    }
};

/**
 * Adds a question to an existing paper (draft)
 */
export const addQuestionToDraft = async (draftId: string, question: Question): Promise<void> => {
    try {
        // Prepare multipart form data for question creation (supports images if needed, but here simple text)
        const formData = new FormData();
        formData.append("type", question.type);
        formData.append("difficulty", question.difficulty.toUpperCase());
        formData.append("questionText", question.content);
        formData.append("solutionText", question.solution);
        formData.append("marks", (question.marks || 1).toString());

        if (question.options) {
            formData.append("options", JSON.stringify(question.options));
            // Calculate correct option index (backend expects correctOption: number for MCQ)
            const CORRECT_IDX = question.options.findIndex(o => o.isCorrect);
            if (CORRECT_IDX !== -1) {
                formData.append("correctOption", CORRECT_IDX.toString());
            }
        }

        // Use the dedicated endpoint for adding questions to a paper
        await http.post(TEACHER_QUESTION_ENDPOINTS.create(draftId), formData);

    } catch (error) {
        console.error("Failed to add question to draft:", error);
        throw error;
    }
};

/**
 * Removes a question from a draft
 */
export const removeQuestionFromDraft = async (draftId: string, questionId: string): Promise<void> => {
    try {
        await http.delete(TEACHER_QUESTION_ENDPOINTS.delete(draftId, questionId));
    } catch (error) {
        console.error("Failed to remove question:", error);
        throw error;
    }
};

// Helper for difficulty mapping
function mapDifficulty(diff: string): Difficulty {
    const map: Record<string, Difficulty> = {
        "EASY": "Easy",
        "MEDIUM": "Intermediate",
        "INTERMEDIATE": "Intermediate",
        "HARD": "Advanced",
        "ADVANCED": "Advanced"
    };
    return map[diff?.toUpperCase()] || "Intermediate";
}
