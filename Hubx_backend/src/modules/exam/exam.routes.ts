import { Router, type Request } from "express"
import rateLimit from "express-rate-limit"
import { examController } from "./exam.controller"
import { authMiddleware, roleMiddleware, type AuthRequest } from "@middlewares/auth"
import { ROLES } from "@utils/constants"
import {
  validateStartExam,
  validateGetQuestion,
  validateGetExamData,
  validateSaveAnswerRoute,
  validateMarkForReview,
  validateNextQuestion,
  validatePreviousQuestion,
  validateSubmitExam,
  validateGetResult,
  validateRaiseDoubt,
  validateMarkQuestionAsHard,
} from "./exam.validator"

const router = Router()

// ============================================
// RATE LIMITING FOR EXAM ENDPOINTS
// ============================================
// Stricter limits for exam endpoints to prevent abuse
// Use user ID as key if authenticated, otherwise use IP (with IPv6 support)
const userOrIpKeyGenerator = (req: Request): string => {
  const authReq = req as AuthRequest
  if (authReq.user?.userId) {
    return authReq.user.userId
  }
  // Use express-rate-limit's IPv6-aware IP generator
  return req.ip || "unknown"
}

const saveAnswerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 answer saves per minute per user
  keyGenerator: userOrIpKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many answer submissions. Please wait before submitting again.",
    })
  },
  skip: (req) => !req.ip, // Skip if no IP available
})

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 submissions per hour per user
  keyGenerator: userOrIpKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many exam submissions. Please wait before submitting another exam.",
    })
  },
  skip: (req) => !req.ip,
})

const doubtLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 doubts per minute
  keyGenerator: userOrIpKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many doubts. Please wait before raising another doubt.",
    })
  },
  skip: (req) => !req.ip,
})

// Middleware
router.use(authMiddleware)
router.use(roleMiddleware(ROLES.STUDENT))

// Routes with validation and rate limiting
router.post("/start/:paperId", validateStartExam, examController.startExam)
router.get("/:attemptId/data", validateGetExamData, examController.getExamData)
router.get("/:attemptId/question", validateGetQuestion, examController.getQuestion)
router.post("/:attemptId/answer/:questionId", saveAnswerLimiter, validateSaveAnswerRoute, examController.saveAnswer)
router.patch("/:attemptId/:questionId/mark-review", validateMarkForReview, examController.markForReview)
router.post("/:attemptId/next-question", validateNextQuestion, examController.nextQuestion)
router.post("/:attemptId/previous-question", validatePreviousQuestion, examController.previousQuestion)
router.post("/:attemptId/submit", submitLimiter, validateSubmitExam, examController.submitExam)
router.get("/:attemptId/result", validateGetResult, examController.getResult)
router.post("/:attemptId/:questionId/doubt", doubtLimiter, validateRaiseDoubt, examController.raiseDoubt)
router.post("/:attemptId/:questionId/mark-hard", validateMarkQuestionAsHard, examController.markQuestionAsHard)

export default router
