import { Router } from "express"
import { analyticsController } from "./analytics.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import { ROLES } from "@utils/constants"

const router = Router()

router.use(authMiddleware)

// Teacher analytics
router.get("/teacher", roleMiddleware(ROLES.TEACHER), analyticsController.getTeacherAnalytics)

// Student analytics
router.get("/student", roleMiddleware(ROLES.STUDENT), analyticsController.getStudentAnalytics)

// Paper analytics
router.get("/paper/:paperId", analyticsController.getPaperAnalytics)

export default router
