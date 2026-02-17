import type { Response } from "express"
import { subjectService } from "./subject.service"
import { standardService } from "./standard.service"
import { paperService } from "./paper.service"
import { questionService } from "./question.service"
import { notificationService } from "./notification.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class TeacherController {
  // Standard endpoints
  createStandard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name } = req.body
    if (!name) {
      return sendError(res, 400, "Standard name is required")
    }

    const standard = await standardService.createStandard(req.user!.userId, name)
    sendResponse(res, 201, "Standard created successfully", standard)
  })

  getStandards = asyncHandler(async (req: AuthRequest, res: Response) => {
    const standards = await standardService.getStandards(req.user!.userId)
    sendResponse(res, 200, "Standards fetched successfully", standards)
  })

  getStandard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId } = req.params
    const standard = await standardService.getStandard(standardId, req.user!.userId)
    sendResponse(res, 200, "Standard fetched successfully", standard)
  })

  updateStandard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId } = req.params
    const { name } = req.body

    if (!name) {
      return sendError(res, 400, "Standard name is required")
    }

    const standard = await standardService.updateStandard(standardId, req.user!.userId, name)
    sendResponse(res, 200, "Standard updated successfully", standard)
  })

  deleteStandard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId } = req.params
    const result = await standardService.deleteStandard(standardId, req.user!.userId)
    sendResponse(res, 200, result.message, null)
  })

  // Subject endpoints
  createSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId } = req.params
    const { name } = req.body
    if (!name) {
      return sendError(res, 400, "Subject name is required")
    }

    const subject = await subjectService.createSubject(standardId, req.user!.userId, name)
    sendResponse(res, 201, "Subject created successfully", subject)
  })

  getSubjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId } = req.params
    const subjects = await subjectService.getSubjects(standardId, req.user!.userId)
    sendResponse(res, 200, "Subjects fetched successfully", subjects)
  })

  getSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId } = req.params
    const subject = await subjectService.getSubject(subjectId, standardId, req.user!.userId)
    sendResponse(res, 200, "Subject fetched successfully", subject)
  })

  updateSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId } = req.params
    const { name } = req.body

    if (!name) {
      return sendError(res, 400, "Subject name is required")
    }

    const subject = await subjectService.updateSubject(subjectId, standardId, req.user!.userId, name)
    sendResponse(res, 200, "Subject updated successfully", subject)
  })

  deleteSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId } = req.params
    const result = await subjectService.deleteSubject(subjectId, standardId, req.user!.userId)
    sendResponse(res, 200, result.message, null)
  })

  // Chapter endpoints
  createChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId } = req.params
    const { name } = req.body

    if (!name) {
      return sendError(res, 400, "Chapter name is required")
    }

    const chapter = await subjectService.createChapter(subjectId, standardId, req.user!.userId, name)
    sendResponse(res, 201, "Chapter created successfully", chapter)
  })

  getChapters = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId } = req.params
    const chapters = await subjectService.getChapters(subjectId, standardId, req.user!.userId)
    sendResponse(res, 200, "Chapters fetched successfully", chapters)
  })

  updateChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId, chapterId } = req.params
    const { name } = req.body

    if (!name) {
      return sendError(res, 400, "Chapter name is required")
    }

    const chapter = await subjectService.updateChapter(chapterId, subjectId, standardId, req.user!.userId, name)
    sendResponse(res, 200, "Chapter updated successfully", chapter)
  })

  deleteChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { standardId, subjectId, chapterId } = req.params
    const result = await subjectService.deleteChapter(chapterId, subjectId, standardId, req.user!.userId)
    sendResponse(res, 200, result.message, null)
  })

  // Paper endpoints
  createPaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const paper = await paperService.createPaper(req.user!.userId, req.body)
    sendResponse(res, 201, "Paper created successfully", paper)
  })

  getPapers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const filters = {
      search: req.query.search as string | undefined,
      subject: req.query.subject as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      sort: req.query.sort as string | undefined,
      std: req.query.std as string | undefined,
    }

    const result = await paperService.getPapers(req.user!.userId, page, limit, filters)
    sendResponse(res, 200, "Papers fetched successfully", result)
  })

  getPaperById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const paper = await paperService.getPaperById(paperId, req.user!.userId)
    sendResponse(res, 200, "Paper fetched successfully", paper)
  })

  updatePaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const paper = await paperService.updatePaper(paperId, req.user!.userId, req.body)
    sendResponse(res, 200, "Paper updated successfully", paper)
  })

  publishPaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const paper = await paperService.publishPaper(paperId, req.user!.userId)
    sendResponse(res, 200, "Paper published successfully", paper)
  })

  deletePaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const result = await paperService.deletePaper(paperId, req.user!.userId)
    sendResponse(res, 200, result.message, null)
  })

  getPaperAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const analytics = await paperService.getPaperAnalytics(paperId, req.user!.userId)
    sendResponse(res, 200, "Analytics fetched successfully", analytics)
  })

  // Question endpoints
  createQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params

    // Parse JSON fields from form-data
    // Safe extraction of uploaded files: multer sets `req.files` as either
    // an array or a map of fieldname -> File[] depending on configuration.
    let questionImage: Express.Multer.File | undefined
    let solutionImage: Express.Multer.File | undefined

    if (Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[]
      questionImage = files.find((f) => f.fieldname === "questionImage")
      solutionImage = files.find((f) => f.fieldname === "solutionImage")
    } else {
      const files = req.files as { [field: string]: Express.Multer.File[] } | undefined
      questionImage = files?.questionImage?.[0]
      solutionImage = files?.solutionImage?.[0]
    }

    const body = {
      ...req.body,
      options: req.body.options ? JSON.parse(req.body.options) : undefined,
      correctAnswers: req.body.correctAnswers ? JSON.parse(req.body.correctAnswers) : undefined,
      marks: req.body.marks ? Number(req.body.marks) : undefined,
      correctOption: req.body.correctOption !== undefined ? Number(req.body.correctOption) : undefined,
      caseSensitive: req.body.caseSensitive ? JSON.parse(req.body.caseSensitive) : false,
      questionImage,
      solutionImage,
    }

    const question = await questionService.createQuestion(paperId, req.user!.userId, body)
    sendResponse(res, 201, "Question created successfully", question)
  })

  getQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const questions = await questionService.getQuestions(paperId, req.user!.userId)
    sendResponse(res, 200, "Questions fetched successfully", questions)
  })

  updateQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId, questionId } = req.params
    let questionImage: Express.Multer.File | undefined
    let solutionImage: Express.Multer.File | undefined

    if (Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[]
      questionImage = files.find((f) => f.fieldname === "questionImage")
      solutionImage = files.find((f) => f.fieldname === "solutionImage")
    } else {
      const files = req.files as { [field: string]: Express.Multer.File[] } | undefined
      questionImage = files?.questionImage?.[0]
      solutionImage = files?.solutionImage?.[0]
    }

    const body = {
      ...req.body,
      options: req.body.options ? JSON.parse(req.body.options) : undefined,
      correctAnswers: req.body.correctAnswers ? JSON.parse(req.body.correctAnswers) : undefined,
      caseSensitive: req.body.caseSensitive ? JSON.parse(req.body.caseSensitive) : undefined,
      questionImage,
      solutionImage,
    }

    const question = await questionService.updateQuestion(questionId, paperId, req.user!.userId, body)
    sendResponse(res, 200, "Question updated successfully", question)
  })

  deleteQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId, questionId } = req.params
    const result = await questionService.deleteQuestion(questionId, paperId, req.user!.userId)
    sendResponse(res, 200, result.message, null)
  })

  bulkUploadQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params

    if (!req.file) {
      return sendError(res, 400, "Excel file is required")
    }

    const result = await questionService.bulkUploadQuestions(paperId, req.user!.userId, req.file)

    if (result.failed > 0) {
      sendResponse(res, 207, `Bulk upload completed with ${result.failed} errors`, result)
    } else {
      sendResponse(res, 201, "All questions uploaded successfully", result)
    }
  })

  getPublicPapers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 9

    const filters = {
      subject: req.query.subject as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      search: req.query.search as string | undefined,
      std: req.query.std as string | undefined,
      rating: req.query.rating as string | undefined,
    }

    const result = await paperService.getPublicPapers(teacherId, page, limit, filters)
    sendResponse(res, 200, "Public papers fetched successfully", result)
  })

  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifications = await notificationService.getNotifications(req.user!.userId)
    sendResponse(res, 200, "Notifications fetched successfully", notifications)
  })
}

export const teacherController = new TeacherController()
