import type { Response } from "express"
import { questionBankService } from "./question-bank.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class QuestionBankController {
  createBankQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId

    // Extract data from request body and files
    const {
      type,
      difficulty,
      questionText,
      options,
      correctOption,
      caseSensitive,
      correctAnswers,
      solutionText,
      marks,
      subjectId,
      chapterIds,
      tags
    } = req.body

    // Validate required fields
    if (!type || !difficulty || !questionText) {
      return sendError(res, 400, "Missing required fields: type, difficulty, questionText")
    }

    // Parse arrays if they come as strings
    const parsedOptions = options ? (typeof options === 'string' ? JSON.parse(options) : options) : undefined
    const parsedChapterIds = chapterIds ? (typeof chapterIds === 'string' ? JSON.parse(chapterIds) : chapterIds) : undefined
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined
    const parsedCorrectAnswers = correctAnswers ? (typeof correctAnswers === 'string' ? JSON.parse(correctAnswers) : correctAnswers) : undefined

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const questionImage = files?.questionImage?.[0]
    const solutionImage = files?.solutionImage?.[0]

    const question = await questionBankService.createBankQuestion(teacherId, {
      type,
      difficulty,
      questionText,
      questionImage,
      options: parsedOptions,
      correctOption: correctOption ? Number.parseInt(correctOption) : undefined,
      caseSensitive: caseSensitive === 'true',
      correctAnswers: parsedCorrectAnswers,
      solutionText,
      solutionImage,
      marks: marks ? Number.parseFloat(marks) : undefined,
      subjectId,
      chapterIds: parsedChapterIds,
      tags: parsedTags
    })

    sendResponse(res, 201, "Question added to bank successfully", question)
  })

  getBankQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId

    const filters = {
      page: req.query.page ? Number.parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string) : undefined,
      subjectId: req.query.subjectId as string,
      chapterIds: req.query.chapterIds ? (req.query.chapterIds as string).split(',') : undefined,
      difficulty: req.query.difficulty as any,
      type: req.query.type as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string
    }

    const result = await questionBankService.getBankQuestions(teacherId, filters)
    sendResponse(res, 200, "Question bank fetched successfully", result)
  })

  getBankQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId
    const { questionId } = req.params

    if (!questionId) {
      return sendError(res, 400, "Question ID is required")
    }

    const question = await questionBankService.getBankQuestion(teacherId, questionId)
    sendResponse(res, 200, "Question fetched successfully", question)
  })

  updateBankQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId
    const { questionId } = req.params

    if (!questionId) {
      return sendError(res, 400, "Question ID is required")
    }

    // Extract data from request body and files
    const {
      type,
      difficulty,
      questionText,
      options,
      correctOption,
      caseSensitive,
      correctAnswers,
      solutionText,
      marks,
      subjectId,
      chapterIds,
      tags
    } = req.body

    // Parse arrays if they come as strings
    const parsedOptions = options ? (typeof options === 'string' ? JSON.parse(options) : options) : undefined
    const parsedChapterIds = chapterIds ? (typeof chapterIds === 'string' ? JSON.parse(chapterIds) : chapterIds) : undefined
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined
    const parsedCorrectAnswers = correctAnswers ? (typeof correctAnswers === 'string' ? JSON.parse(correctAnswers) : correctAnswers) : undefined

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const questionImage = files?.questionImage?.[0]
    const solutionImage = files?.solutionImage?.[0]

    const question = await questionBankService.updateBankQuestion(teacherId, questionId, {
      type,
      difficulty,
      questionText,
      questionImage,
      options: parsedOptions,
      correctOption: correctOption ? Number.parseInt(correctOption) : undefined,
      caseSensitive: caseSensitive === 'true' || caseSensitive === true,
      correctAnswers: parsedCorrectAnswers,
      solutionText,
      solutionImage,
      marks: marks ? Number.parseFloat(marks) : undefined,
      subjectId,
      chapterIds: parsedChapterIds,
      tags: parsedTags
    })

    sendResponse(res, 200, "Question updated successfully", question)
  })

  deleteBankQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId
    const { questionId } = req.params

    if (!questionId) {
      return sendError(res, 400, "Question ID is required")
    }

    await questionBankService.deleteBankQuestion(teacherId, questionId)
    sendResponse(res, 200, "Question deleted from bank", null)
  })

  addToPaper = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId
    const { questionId } = req.params
    const { paperId, order } = req.body

    if (!questionId) {
      return sendError(res, 400, "Question ID is required")
    }

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    const result = await questionBankService.addToPaper(
      teacherId,
      questionId,
      paperId,
      order ? Number.parseInt(order) : undefined
    )

    sendResponse(res, 200, "Question added to paper successfully", result)
  })

  bulkUploadBankQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId

    if (!req.file) {
      return sendError(res, 400, "Excel file is required")
    }

    // Optional filters from query params
    const subjectId = req.query.subjectId as string | undefined
    const chapterIds = req.query.chapterIds
      ? (req.query.chapterIds as string).split(',')
      : undefined

    const result = await questionBankService.bulkUploadBankQuestions(
      teacherId,
      req.file,
      subjectId,
      chapterIds
    )

    if (result.failed > 0) {
      sendResponse(res, 207, `Bulk upload completed with ${result.failed} errors`, result)
    } else {
      sendResponse(res, 201, "All questions uploaded successfully to bank", result)
    }
  })

  createBankQuestionsInBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = req.user!.userId

    // Extract questions data from body
    const { questions } = req.body

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return sendError(res, 400, "At least one question is required in 'questions' array")
    }

    // Parse JSON fields if they come as strings (from FormData)
    const parsedQuestions = questions.map((q: any, index: number) => {
      try {
        return {
          type: q.type,
          difficulty: q.difficulty,
          questionText: q.questionText || q.text,
          marks: q.marks ? Number.parseFloat(q.marks) : undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solutionText: q.solutionText,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
          correctOption: q.correctOption ? Number.parseInt(q.correctOption) : undefined,
          correctAnswers: q.correctAnswers ? (typeof q.correctAnswers === 'string' ? JSON.parse(q.correctAnswers) : q.correctAnswers) : undefined,
          caseSensitive: q.caseSensitive === 'true' || q.caseSensitive === true,
          subjectId: q.subjectId,
          chapterIds: q.chapterIds ? (typeof q.chapterIds === 'string' ? JSON.parse(q.chapterIds) : q.chapterIds) : undefined,
          tags: q.tags ? (typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags) : undefined,
        }
      } catch (error: any) {
        throw new Error(`Question ${index}: Failed to parse question data - ${error.message}`)
      }
    })

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined

    const result = await questionBankService.createBankQuestionsInBatch(
      teacherId,
      parsedQuestions,
      files
    )

    if (result.failed > 0) {
      sendResponse(res, 207, `Created ${result.successful} questions with ${result.failed} validation errors`, result)
    } else {
      sendResponse(res, 201, "All questions created successfully", result)
    }
  })
}

export const questionBankController = new QuestionBankController()
