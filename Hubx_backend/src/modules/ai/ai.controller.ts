import { Response } from "express";
import { aiService } from "./ai.service";
import { sendResponse } from "@utils/helpers";
import { asyncHandler } from "@utils/errors";
import type { AuthRequest } from "@middlewares/auth";

export class AIController {
    /**
     * Generate questions using AI
     * POST /teacher/papers/:paperId/generate-questions
     */
    generateQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { paperId } = req.params;
        const { subject, chapters, difficulty, count, instructions, standard } = req.body;

        // Validation
        if (!subject || !difficulty || !count) {
            return sendResponse(
                res,
                400,
                "Missing required fields: subject, difficulty, count",
                null
            );
        }

        if (count < 1 || count > 50) {
            return sendResponse(res, 400, "Count must be between 1 and 50", null);
        }

        const validDifficulties = ["Easy", "Medium", "Hard"];
        if (!validDifficulties.includes(difficulty)) {
            return sendResponse(
                res,
                400,
                `Difficulty must be one of: ${validDifficulties.join(", ")}`,
                null
            );
        }

        try {
            // Generate questions
            const questions = await aiService.generateQuestions(paperId, req.user!.userId, {
                subject,
                chapters: chapters || [],
                difficulty,
                count,
                instructions,
                standard,
            });

            sendResponse(res, 200, "Questions generated successfully", {
                questions,
                count: questions.length,
            });
        } catch (error: any) {
            throw error;
        }
    });
}

export const aiController = new AIController();
