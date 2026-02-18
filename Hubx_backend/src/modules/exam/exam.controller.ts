import type { Response } from "express"
import { examService } from "./exam.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class ExamController {
  startExam = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const { noTimeLimit, showAnswerAfterWrong, enableSolutionView } = req.body

    const attempt = await examService.startExam(paperId, req.user!.userId, {
      noTimeLimit: noTimeLimit === true,
      showAnswerAfterWrong: showAnswerAfterWrong === true,
      enableSolutionView: enableSolutionView === true,
    })

    const responseData = {
      attemptId: attempt.id,
      paperId: attempt.paperId,
      studentId: attempt.studentId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      totalScore: attempt.totalScore,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeSpent: attempt.timeSpent,
      noTimeLimit: attempt.noTimeLimit,
      showAnswerAfterWrong: attempt.showAnswerAfterWrong,
      enableSolutionView: attempt.enableSolutionView,
    }

    sendResponse(res, 200, "Exam started successfully", responseData)
  })

  getQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const { questionIndex } = req.query

    // Default to first question (index 0) if not provided
    const index = questionIndex ? Number.parseInt(questionIndex as string) : 0

    const question = await examService.getQuestion(
      attemptId,
      req.user!.userId,
      index,
    )
    sendResponse(res, 200, "Question fetched successfully", question)
  })

  saveAnswer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId, questionId } = req.params
    const { answerText, selectedOption } = req.body

    const answer = await examService.saveAnswer(attemptId, req.user!.userId, questionId, {
      answerText,
      selectedOption,
    })
    sendResponse(res, 200, "Answer saved successfully", answer)
  })

  markForReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId, questionId } = req.params
    const answer = await examService.markForReview(attemptId, req.user!.userId, questionId)
    sendResponse(res, 200, "Question marked for review", answer)
  })

  submitExam = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const attempt = await examService.submitExam(attemptId, req.user!.userId)
    sendResponse(res, 200, "Exam submitted successfully", attempt)
  })

  raiseDoubt = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId, questionId } = req.params
    const { doubtText } = req.body

    if (!doubtText) {
      return sendError(res, 400, "Doubt text is required")
    }

    const doubt = await examService.raiseDoubt(attemptId, req.user!.userId, questionId, doubtText)
    sendResponse(res, 201, "Doubt raised successfully", doubt)
  })

  markQuestionAsHard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId, questionId } = req.params
    const { isTooHard } = req.body

    if (typeof isTooHard !== "boolean") {
      return sendError(res, 400, "isTooHard must be a boolean value")
    }

    const answer = await examService.markQuestionAsHard(attemptId, req.user!.userId, questionId, isTooHard)
    sendResponse(res, 200, isTooHard ? "Question marked as too hard" : "Hard marking removed", answer)
  })

  getExamData = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const data = await examService.getExamData(attemptId, req.user!.userId)
    sendResponse(res, 200, "Exam data fetched successfully", data)
  })

  nextQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const question = await examService.getNextQuestion(attemptId, req.user!.userId)
    sendResponse(res, 200, "Next question fetched successfully", question)
  })

  previousQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const question = await examService.getPreviousQuestion(attemptId, req.user!.userId)
    sendResponse(res, 200, "Previous question fetched successfully", question)
  })

  getResult = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params
    const result = await examService.getResult(attemptId, req.user!.userId)
    sendResponse(res, 200, "Exam result fetched successfully", result)
  })
}

export const examController = new ExamController()
