import { Router } from "express";
import { aiController } from "./ai.controller";
import { authMiddleware, roleMiddleware } from "@middlewares/auth";
import { ROLES } from "@utils/constants";

const router = Router();

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.TEACHER));

/**
 * Generate questions using AI
 * POST /teacher/papers/:paperId/generate-questions
 * Body: {
 *   subject: string,
 *   chapters: string[],
 *   difficulty: "Easy" | "Medium" | "Hard",
 *   count: number (1-50),
 *   instructions?: string,
 *   standard?: string
 * }
 */
router.post("/papers/:paperId/generate-questions", aiController.generateQuestions);

export default router;
