/**
 * Question Bank Types
 * Types for the question bank creation form
 */

export type QuestionType = "TEXT" | "MCQ" | "FILL_IN_THE_BLANKS"
export type DifficultyLevel = "EASY" | "INTERMEDIATE" | "ADVANCED"

export interface QuestionBankQuestion {
  id: string | number // string for API responses, number for new local questions
  type: QuestionType
  difficulty: DifficultyLevel
  text: string // Question text
  correctAnswer?: string // For TEXT questions
  options?: string[] // For MCQ - array of options
  correctOption?: number // For MCQ - 0-indexed correct option
  correctAnswers?: string[][] // For FILL_IN_THE_BLANKS - array of alternatives per blank
  caseSensitive?: boolean // For FILL_IN_THE_BLANKS
  explanation?: string // Optional explanation
  solutionText?: string // Optional solution text
  marks: number // Question marks (default: 1)
  questionImage?: File | string | null // File object or URL string
  solutionImage?: File | string | null // File object or URL string
  subjectId?: string // Optional subject ID
  chapterIds?: string[] // Optional chapter IDs
  tags?: string[] // Optional tags
}

export interface CreateBankQuestionsRequest {
  questions: Omit<QuestionBankQuestion, "id">[]
}

export interface CreateBankQuestionsResponse {
  successful: number
  failed: number
  questions: Array<{
    id: string
    text: string
    type: QuestionType
  }>
  errors?: Array<{
    questionIndex: number
    error: string
  }>
}

// Utility type for form state
export interface QuestionFormState extends QuestionBankQuestion {
  _tempId: string | number // Temporary ID for new questions before creation
  _errors?: {
    text?: string
    type?: string
    difficulty?: string
    marks?: string
    correctAnswer?: string
    options?: string
    correctOption?: string
    [key: string]: string | undefined
  }
}

// Math symbols for the toolbar
export const MATH_SYMBOLS = {
  superscript2: "²",
  superscript3: "³",
  plus: "+",
  minus: "-",
  multiply: "×",
  divide: "÷",
  plusminus: "±",
  lessThanOrEqual: "≤",
  greaterThanOrEqual: "≥",
  squareRoot: "√",
  cubeRoot: "∛",
  pi: "π",
  infinity: "∞",
  fraction: "½",
  degree: "°",
  integral: "∫",
  summation: "∑",
} as const

export type MathSymbolKey = keyof typeof MATH_SYMBOLS
