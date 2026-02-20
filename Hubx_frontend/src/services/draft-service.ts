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
        let customStandard: string | undefined = undefined;

        if (!standardNum && config.standard) {
            const match = config.standard.match(/\d+/);
            if (match) {
                // Has a number - use it as standard number
                standardNum = parseInt(match[0]);
            } else {
                // No number found - this is a custom standard like "IIT Bombay"
                customStandard = config.standard;
                standardNum = 0; // Send 0 to indicate custom standard
            }
        }

        // Map frontend config to backend payload
        const payload: any = {
            title: config.title,
            standard: standardNum,
            subjectId: config.subjectId,
            difficulty: config.difficulty.toUpperCase(),
            type: config.isTimeBound ? "TIME_BOUND" : "NO_LIMIT", // Backend expects these
            duration: config.duration,
            isPublic: config.isPublic,
            isFreeAccess: config.schoolOnly, // Map schoolOnly to backend's isFreeAccess
            price: config.price,
            chapterIds: config.chapters.filter(c => c.selected).map(c => c.id),
            description: "Created via AI Assessment"
        };

        // Add custom standard if provided
        if (customStandard) {
            payload.customStandard = customStandard;
        }

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
        // Handle both custom and standard number standards
        const standardDisplay = paper.customStandard
            ? paper.customStandard
            : (paper.standard ? `Standard ${paper.standard}` : "Not selected");

        return {
            title: paper.title,
            standard: standardDisplay,
            standardValue: paper.standard || undefined,
            standardId: paper.subject?.standardId,
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
            schoolOnly: paper.isFreeAccess || false, // Map backend's isFreeAccess to schoolOnly
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
                    questionImage: q.questionImage || undefined,
                    solutionImage: q.solutionImage || undefined,
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
export const addQuestionToDraft = async (draftId: string, question: Question & { questionImage?: File; solutionImage?: File }): Promise<void> => {
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
            content: question.content?.substring(0, 50),
            hasQuestionImage: !!question.questionImage,
            hasSolutionImage: !!question.solutionImage
        };

        // Add type-specific debug info
        if (question.options) {
            const opts = question.options as any[];
            debugLog.optionsCount = opts.length;
            debugLog.optionsFormat = opts.length > 0 ? (typeof opts[0] === 'string' ? 'string[]' : 'object[]') : 'empty';
            debugLog.optionsPreview = opts.slice(0, 2);
            if (opts.length > 0 && typeof opts[0] === 'object') {
                debugLog.correctOptionIndex = opts.findIndex((o: any) => o.isCorrect);
            }
        } else if (question.blanks) {
            debugLog.blanksCount = question.blanks.length;
            debugLog.blanks = question.blanks.map(b => ({ position: b.position, answer: b.correctAnswer }));
        }

        console.log('🔍 DEBUG addQuestionToDraft:', debugLog);

        // Prepare multipart form data for question creation (supports images)
        const formData = new FormData();
        formData.append("type", mappedType);
        formData.append("difficulty", question.difficulty.toUpperCase());
        formData.append("questionText", question.content);
        formData.append("solutionText", question.solution);
        formData.append("marks", (question.marks || 1).toString());

        // Append image files if they exist
        if (question.questionImage) {
            formData.append("questionImage", question.questionImage);
        }
        if (question.solutionImage) {
            formData.append("solutionImage", question.solutionImage);
        }

        if (question.options) {
            // Handle both formats: MCQOption objects or string arrays
            let optionTexts: string[] = [];
            let correctOptionIndex = -1;

            // Check if options are objects (MCQOption format from manual form)
            if (Array.isArray(question.options) && question.options.length > 0) {
                const firstOption = question.options[0];

                if (typeof firstOption === 'object' && 'text' in firstOption) {
                    // Format: MCQOption[] from manual form
                    const nonEmptyOptions = question.options.filter((o: any) => o.text?.trim());
                    optionTexts = nonEmptyOptions.map((o: any) => o.text);

                    // Find correct option index
                    const correctOption = question.options.find((o: any) => o.isCorrect);
                    if (correctOption) {
                        correctOptionIndex = nonEmptyOptions.findIndex((o: any) => o.id === correctOption.id);
                    }
                } else if (typeof firstOption === 'string') {
                    // Format: string[] from question bank
                    optionTexts = (question.options as unknown as string[]).map(o => o.trim()).filter(o => o.length > 0);
                    // Assume first option is correct if not specified (common in question bank)
                    correctOptionIndex = 0;
                }
            }

            // Validate: MCQ must have 2-6 options
            if (optionTexts.length < 2 || optionTexts.length > 6) {
                throw new Error(`MCQ must have between 2 and 6 options (you have ${optionTexts.length})`);
            }

            // Send options and correct answer index
            formData.append("options", JSON.stringify(optionTexts));
            if (correctOptionIndex !== -1) {
                formData.append("correctOption", correctOptionIndex.toString());
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

/**
 * Publishes a draft paper (changes status from DRAFT to PUBLISHED)
 */
export const publishPaper = async (paperId: string): Promise<void> => {
    try {
        await http.post<any>(TEACHER_ENDPOINTS.publishPaper(paperId), {});
        console.log("[Draft Service] Paper published successfully:", paperId);
    } catch (error) {
        console.error("[Draft Service] Failed to publish paper:", error);
        throw new Error("Failed to publish paper. Please try again.");
    }
};

/**
 * Unpublishes a paper (changes status from PUBLISHED to DRAFT)
 */
export const unpublishPaper = async (paperId: string): Promise<void> => {
    try {
        // For now, we'll use the same endpoint. Backend should handle it
        // In future, might need a separate unpublish endpoint
        await http.post<any>(`${TEACHER_ENDPOINTS.publishPaper(paperId)}/unpublish`, {});
        console.log("[Draft Service] Paper unpublished successfully:", paperId);
    } catch (error) {
        console.error("[Draft Service] Failed to unpublish paper:", error);
        throw new Error("Failed to unpublish paper. Please try again.");
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
