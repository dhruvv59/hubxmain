import { PaperConfig, Question, Difficulty, QuestionType } from "@/types/generate-paper";
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
            questions: paper.questions?.map((q: any) => {
                // Parse options if it's a string
                const parsedOptions = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null;

                // Map backend question type to frontend format
                const typeMap: Record<string, QuestionType> = {
                    "MCQ": "MCQ",
                    "TEXT": "Text",
                    "FILL_IN_THE_BLANKS": "Fill in the Blanks"
                };

                // Map backend question to frontend format
                const questionData: any = {
                    id: q.id,
                    type: typeMap[q.type] || (q.type as QuestionType),
                    difficulty: mapDifficulty(q.difficulty),
                    content: q.questionText,
                    solution: q.solutionText || "",
                    marks: q.marks,
                };

                // Handle MCQ: convert string array to MCQOption objects
                if (q.type === "MCQ" && Array.isArray(parsedOptions)) {
                    questionData.options = parsedOptions.map((optText: string, idx: number) => ({
                        id: `opt-${idx}`,
                        text: optText,
                        isCorrect: idx === q.correctOption
                    }));
                }
                // Handle FILL_IN_THE_BLANKS: convert options to blanks
                else if (q.type === "FILL_IN_THE_BLANKS" && Array.isArray(parsedOptions)) {
                    questionData.blanks = parsedOptions.map((answers: any, idx: number) => ({
                        id: `blank-${idx}`,
                        position: idx,
                        correctAnswer: Array.isArray(answers) ? answers[0] : answers,
                        placeholder: `Answer ${idx + 1}`
                    }));
                }

                return questionData;
            }) || []
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
        // Map frontend question types to backend format
        const typeMap: Record<string, string> = {
            'MCQ': 'MCQ',
            'Text': 'TEXT',
            'Fill in the Blanks': 'FILL_IN_THE_BLANKS'
        };

        // DEBUG: Log what we're sending
        const mappedType = typeMap[question.type] || question.type;
        const debugLog: any = {
            originalType: question.type,
            mappedType: mappedType,
            difficulty: question.difficulty.toUpperCase(),
            content: question.content?.substring(0, 50)
        };

        // Add type-specific debug info
        if (question.options) {
            debugLog.optionsCount = question.options.length;
            debugLog.correctOptionIndex = question.options.findIndex(o => o.isCorrect);
        } else if (question.blanks) {
            debugLog.blanksCount = question.blanks.length;
            debugLog.blanks = question.blanks.map(b => ({ position: b.position, answer: b.correctAnswer }));
        }

        console.log('🔍 DEBUG addQuestionToDraft:', debugLog);

        // Prepare multipart form data for question creation (supports images if needed, but here simple text)
        const formData = new FormData();
        formData.append("type", mappedType);
        formData.append("difficulty", question.difficulty.toUpperCase());
        formData.append("questionText", question.content);
        formData.append("solutionText", question.solution);
        formData.append("marks", (question.marks || 1).toString());

        if (question.options) {
            // Send only option text as array of strings
            const optionTexts = question.options.map(o => o.text);
            formData.append("options", JSON.stringify(optionTexts));

            // Calculate correct option index (backend expects correctOption: number for MCQ)
            const CORRECT_IDX = question.options.findIndex(o => o.isCorrect);
            if (CORRECT_IDX !== -1) {
                formData.append("correctOption", CORRECT_IDX.toString());
            }
        } else if (question.blanks && question.type === 'Fill in the Blanks') {
            // Map blanks to correctAnswers for storage
            // Each blank answer should be wrapped in an array to support multiple acceptable answers
            const correctAnswers = question.blanks.map(b => [b.correctAnswer]);
            formData.append("correctAnswers", JSON.stringify(correctAnswers));
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
