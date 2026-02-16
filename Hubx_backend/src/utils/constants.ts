export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
}

export const PAPER_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
}

export const PAPER_TYPE = {
  TIME_BOUND: "TIME_BOUND",
  NO_LIMIT: "NO_LIMIT",
}

export const DIFFICULTY = {
  EASY: "EASY",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
}

export const QUESTION_TYPE = {
  TEXT: "TEXT",
  MCQ: "MCQ",
  FILL_IN_THE_BLANKS: "FILL_IN_THE_BLANKS",
}

// FILL_IN_THE_BLANKS Question Structure:
// {
//   type: "FILL_IN_THE_BLANKS",
//   questionText: string,      // e.g., "The capital of ___ is ___"
//   correctAnswers: string[][],// Array of arrays - each inner array contains acceptable answers for a blank
//                              // e.g., [["France", "france"], ["Paris", "paris"]]
//   caseSensitive: boolean,    // Whether answers are case-sensitive (default: false)
//   questionImage?: File,
//   solutionText?: string,
//   solutionImage?: File,
//   marks?: number
// }

export const EXAM_STATUS = {
  ONGOING: "ONGOING",
  SUBMITTED: "SUBMITTED",
  AUTO_SUBMITTED: "AUTO_SUBMITTED",
}

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
}

export const NOTIFICATION_TYPES = {
  INFO: "INFO",
  WARNING: "WARNING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
}

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_EXISTS: "Email already exists",
  PAPER_NOT_FOUND: "Paper not found",
  QUESTION_NOT_FOUND: "Question not found",
  EXAM_NOT_FOUND: "Exam not found",
  INVALID_ROLE: "Invalid role",
  PAPER_NOT_PUBLISHED: "Paper is not published",
  ALREADY_PURCHASED: "Paper already purchased",
  INSUFFICIENT_QUESTIONS: "Paper must have at least 1 question",
  PUBLIC_PAPER_REQUIRES_PRICE: "Public paper must have a price",
  TIME_BOUND_REQUIRES_DURATION: "Time bound paper must have a duration",
}
