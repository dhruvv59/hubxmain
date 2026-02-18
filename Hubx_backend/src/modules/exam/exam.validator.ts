import { param, query, body, validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"

/**
 * Validation Middleware for Exam Module
 * Uses express-validator to validate all exam API inputs
 */

// ============================================
// PARAM VALIDATORS
// ============================================

export const validateAttemptId = param("attemptId")
  .isString()
  .notEmpty()
  .trim()
  .withMessage("Invalid attempt ID")

export const validatePaperId = param("paperId")
  .isString()
  .notEmpty()
  .trim()
  .withMessage("Invalid paper ID")

export const validateQuestionId = param("questionId")
  .isString()
  .notEmpty()
  .trim()
  .withMessage("Invalid question ID")

// ============================================
// QUERY VALIDATORS
// ============================================

export const validateQuestionIndex = query("questionIndex")
  .optional()
  .isInt({ min: 0 })
  .withMessage("Question index must be a non-negative integer")

// ============================================
// BODY VALIDATORS
// ============================================

export const validateSaveAnswer = [
  body("answerText")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .withMessage("Answer text must be a string"),

  body("selectedOption")
    .optional({ checkFalsy: false })
    .isInt({ min: 0 })
    .withMessage("Selected option must be a non-negative integer"),

  // At least one of answerText or selectedOption must be provided
  body()
    .custom((value, { req }) => {
      const { answerText, selectedOption } = req.body
      const hasAnswerText = answerText && String(answerText).trim().length > 0
      const hasSelectedOption = selectedOption !== undefined && selectedOption !== null

      if (!hasAnswerText && !hasSelectedOption) {
        throw new Error("Either answerText or selectedOption must be provided")
      }
      return true
    }),
]

export const validateDoubt = [
  body("doubtText")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Doubt text is required")
    .isLength({ max: 2000 })
    .withMessage("Doubt text must not exceed 2000 characters"),
]

export const validateMarkHard = [
  body("isTooHard")
    .isBoolean()
    .withMessage("isTooHard must be a boolean value"),
]

// ============================================
// VALIDATION RESULT HANDLER
// ============================================

/**
 * Express middleware to handle validation errors
 * Call this after all validators in route chain
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : err.type,
        message: err.msg,
      })),
    })
  }
  next()
}

// ============================================
// COMBINED VALIDATORS FOR ROUTES
// ============================================

/**
 * Validators for: POST /start/:paperId
 */
export const validateStartExam = [validatePaperId, validate]

/**
 * Validators for: GET /:attemptId/question
 */
export const validateGetQuestion = [validateAttemptId, validateQuestionIndex, validate]

/**
 * Validators for: GET /:attemptId/data
 */
export const validateGetExamData = [validateAttemptId, validate]

/**
 * Validators for: POST /:attemptId/answer/:questionId
 */
export const validateSaveAnswerRoute = [validateAttemptId, validateQuestionId, ...validateSaveAnswer, validate]

/**
 * Validators for: PATCH /:attemptId/:questionId/mark-review
 */
export const validateMarkForReview = [validateAttemptId, validateQuestionId, validate]

/**
 * Validators for: POST /:attemptId/next-question
 */
export const validateNextQuestion = [validateAttemptId, validate]

/**
 * Validators for: POST /:attemptId/previous-question
 */
export const validatePreviousQuestion = [validateAttemptId, validate]

/**
 * Validators for: POST /:attemptId/submit
 */
export const validateSubmitExam = [validateAttemptId, validate]

/**
 * Validators for: GET /:attemptId/result
 */
export const validateGetResult = [validateAttemptId, validate]

/**
 * Validators for: POST /:attemptId/:questionId/doubt
 */
export const validateRaiseDoubt = [validateAttemptId, validateQuestionId, ...validateDoubt, validate]

/**
 * Validators for: POST /:attemptId/:questionId/mark-hard
 */
export const validateMarkQuestionAsHard = [validateAttemptId, validateQuestionId, ...validateMarkHard, validate]
