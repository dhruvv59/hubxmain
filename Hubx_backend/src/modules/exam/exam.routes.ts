import { Router } from "express"
import { examController } from "./exam.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import { ROLES } from "@utils/constants"

const router = Router()

// Middleware
router.use(authMiddleware)
router.use(roleMiddleware(ROLES.STUDENT))

router.post("/start/:paperId", examController.startExam)
router.get("/:attemptId/data", examController.getExamData)
router.get("/:attemptId/question", examController.getQuestion)
router.post("/:attemptId/answer/:questionId", examController.saveAnswer)
router.patch("/:attemptId/:questionId/mark-review", examController.markForReview)
router.post("/:attemptId/next-question", examController.nextQuestion)
router.post("/:attemptId/previous-question", examController.previousQuestion)
router.post("/:attemptId/submit", examController.submitExam)
router.get("/:attemptId/result", examController.getResult)
router.post("/:attemptId/:questionId/doubt", examController.raiseDoubt)
router.post("/:attemptId/:questionId/mark-hard", examController.markQuestionAsHard)

export default router
