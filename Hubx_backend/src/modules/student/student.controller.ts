import type { Response } from "express"
import { studentService } from "./student.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class StudentController {
  getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await studentService.getDashboard(req.user!.userId)
    sendResponse(res, 200, "Dashboard data fetched successfully", data)
  })

  getPublicPapers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const search = (req.query.search as string) || ""

    const result = await studentService.getPublicPapers(req.user!.userId, page, limit)
    sendResponse(res, 200, "Public papers fetched successfully", result)
  })

  getPracticeExams = asyncHandler(async (req: AuthRequest, res: Response) => {
    const exams = await studentService.getPracticeExams(req.user!.userId)
    sendResponse(res, 200, "Practice exams fetched successfully", exams)
  })

  getExamHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const result = await studentService.getExamHistory(req.user!.userId, page, limit)
    sendResponse(res, 200, "Exam history fetched successfully", result)
  })

  getExamResult = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const result = await studentService.getExamResult(attemptId, req.user!.userId)
    sendResponse(res, 200, "Exam result fetched successfully", result)
  })

  getPerformanceMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const metrics = await studentService.getPerformanceMetrics(req.user!.userId)
    sendResponse(res, 200, "Performance metrics fetched successfully", metrics)
  })

  getSubjectPerformance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const performance = await studentService.getSubjectPerformance(req.user!.userId)
    sendResponse(res, 200, "Subject performance fetched successfully", performance)
  })

  getSyllabusCoverage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const coverage = await studentService.getSyllabusCoverage(req.user!.userId)
    sendResponse(res, 200, "Syllabus coverage fetched successfully", coverage)
  })

  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 5
    const notifications = await studentService.getNotificationData(req.user!.userId)
    sendResponse(res, 200, "Notifications fetched successfully", notifications)
  })

  getTestRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const recommendations = await studentService.getTestRecommendations(req.user!.userId)
    sendResponse(res, 200, "Test recommendations fetched successfully", recommendations)
  })

  getUpcomingExams = asyncHandler(async (req: AuthRequest, res: Response) => {
    const exams = await studentService.getUpcomingExams(req.user!.userId)
    sendResponse(res, 200, "Upcoming exams fetched successfully", exams)
  })

  /**
   * NEW: Fetch all available subjects with performance data
   * Solves: Cold start issue for new students
   * Returns: All subjects from student's attempted papers + common subjects
   */
  getAllSubjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const subjects = await studentService.getAllAvailableSubjects(req.user!.userId)
    sendResponse(res, 200, "All subjects fetched successfully", subjects)
  })

  /**
   * NEW: Generate adaptive assessment based on student's selections
   * Solves: Custom assessment creation
   * Creates: Dynamic paper with AI-selected questions
   */
  generateAssessment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subjectIds, chapterIds, difficulty, duration } = req.body

    // Validation
    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return sendError(res, 400, "At least one subject must be selected")
    }

    if (!difficulty || !["EASY", "INTERMEDIATE", "ADVANCED"].includes(difficulty)) {
      return sendError(res, 400, "Valid difficulty level required")
    }

    const result = await studentService.generateAdaptiveAssessment(req.user!.userId, {
      subjectIds,
      chapterIds: chapterIds || [],
      difficulty,
      duration: duration || null,
    })

    sendResponse(res, 201, "Assessment generated successfully", result)
  })
}

export const studentController = new StudentController()
