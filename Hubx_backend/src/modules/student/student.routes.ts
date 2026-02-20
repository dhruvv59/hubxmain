import { Router } from "express"
import { studentController } from "./student.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import { ROLES } from "@utils/constants"

const router = Router()

// Middleware
router.use(authMiddleware)
router.use(roleMiddleware(ROLES.STUDENT, ROLES.TEACHER, ROLES.SUPER_ADMIN))


router.get("/dashboard", studentController.getDashboard)
router.get("/published-papers", studentController.getPublicPapers)
router.get("/practice-exams", studentController.getPracticeExams)
router.get("/exam-history", studentController.getExamHistory)
router.get("/exam-result/:attemptId", studentController.getExamResult)

// New Dashboard Metrics Endpoints
router.get("/performance-metrics", studentController.getPerformanceMetrics)
router.get("/percentile-range", studentController.getPercentileForDateRange)
router.get("/subject-performance", studentController.getSubjectPerformance)
router.get("/syllabus-coverage", studentController.getSyllabusCoverage)
router.get("/notifications", studentController.getNotifications)
router.get("/test-recommendations", studentController.getTestRecommendations)
router.get("/upcoming-exams", studentController.getUpcomingExams)

// NEW: Subject and Assessment Generation Endpoints
router.get("/subjects", studentController.getAllSubjects)
router.post("/generate-assessment", studentController.generateAssessment)

// Bookmark routes
router.post("/papers/:paperId/bookmark", studentController.toggleBookmark)
router.get("/bookmarks", studentController.getBookmarks)

// Paper assignment routes (Teacher → Student)
router.post("/papers/:paperId/assign", roleMiddleware(ROLES.TEACHER, ROLES.SUPER_ADMIN), studentController.assignPaper)

export default router
