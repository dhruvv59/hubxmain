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
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    // Parse all filter query params
    const filters = {
      subject: (req.query.subject as string) || undefined,
      search: (req.query.search as string) || undefined,
      difficulty: (req.query.difficulty as string) || undefined,
      type: (req.query.type as string) || undefined,
      status: (req.query.status as string) || undefined,
    }

    const exams = await studentService.getPracticeExams(req.user!.userId, page, limit, filters)
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
    const { from, to } = req.query
    const metrics = await studentService.getPerformanceMetrics(
      req.user!.userId,
      from as string | undefined,
      to as string | undefined
    )
    sendResponse(res, 200, "Performance metrics fetched successfully", metrics)
  })

  getPercentileForDateRange = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query
    const percentile = await studentService.getPercentileForDateRange(
      req.user!.userId,
      from as string | undefined,
      to as string | undefined
    )
    sendResponse(res, 200, "Percentile calculated successfully", { percentile })
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
   * Fetch all available subjects with performance data
   */
  getAllSubjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const subjects = await studentService.getAllAvailableSubjects(req.user!.userId)
    sendResponse(res, 200, "All subjects fetched successfully", subjects)
  })

  /**
   * Generate adaptive assessment
   */
  generateAssessment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subjectIds, chapterIds, difficulty, duration } = req.body

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

  // ==========================================
  // BOOKMARK ENDPOINTS
  // ==========================================

  toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    const result = await studentService.toggleBookmark(req.user!.userId, paperId)
    sendResponse(res, 200, result.bookmarked ? "Paper bookmarked" : "Bookmark removed", result)
  })

  getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookmarks = await studentService.getBookmarks(req.user!.userId)
    sendResponse(res, 200, "Bookmarks fetched successfully", bookmarks)
  })

  // ==========================================
  // PAPER ASSIGNMENT ENDPOINTS (TEACHER → STUDENT)
  // ==========================================

  assignPaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const { studentIds, dueDate, note } = req.body

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendError(res, 400, "At least one student must be selected")
    }

    const result = await studentService.assignPaper(req.user!.userId, paperId, studentIds, dueDate, note)
    sendResponse(res, 200, "Paper assigned successfully", result)
  })
}

export const studentController = new StudentController()

