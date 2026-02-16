import { Router } from "express"
import { authenticate } from "@middlewares/auth"
import { requireTeacher } from "@middlewares/roleAuth"
import { doubtController } from "./doubt.controller"

const router = Router()

// All routes require authentication and teacher role
router.use(authenticate, requireTeacher)

// Get all doubts for a paper (with optional filter)
router.get("/papers/:paperId/doubts", doubtController.getAllDoubts)

// Get doubts for a specific question
router.get("/questions/:questionId/doubts", doubtController.getQuestionDoubts)

// Reply to a doubt
router.post("/doubts/:doubtId/reply", doubtController.replyToDoubt)

// Get doubt statistics for a paper
router.get("/papers/:paperId/doubt-stats", doubtController.getDoubtStats)

// Get question difficulty statistics for a paper
router.get("/papers/:paperId/difficulty-stats", doubtController.getDifficultyStats)

export default router
