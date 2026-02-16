import prisma from "@config/database"
import { Prisma } from "@prisma/client"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, PAPER_STATUS, QUESTION_TYPE } from "@utils/constants"
import { uploadToS3 } from "@utils/s3"
import type { Express } from "express"
import * as XLSX from "xlsx"

export class QuestionService {
  async createQuestion(
    paperId: string,
    teacherId: string,
    data: {
      type: string
      difficulty: string
      questionText: string
      questionImage?: Express.Multer.File
      options?: string[]
      correctOption?: number
      correctAnswers?: string[][] // For FILL_IN_THE_BLANKS: array of arrays
      caseSensitive?: boolean      // For FILL_IN_THE_BLANKS
      solutionText?: string
      solutionImage?: Express.Multer.File
      marks?: number
      // Frontend compatibility
      text?: string
    },
  ) {
    // Map frontend 'text' to 'questionText' if needed
    if (!data.questionText && data.text) {
      data.questionText = data.text
    }
    // Validate paper ownership
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    // Cannot add questions to published papers
    if (paper.status === PAPER_STATUS.PUBLISHED) {
      throw new AppError(400, "Cannot add questions to published paper")
    }

    // Validate question type
    const validTypes = [QUESTION_TYPE.TEXT, QUESTION_TYPE.MCQ, QUESTION_TYPE.FILL_IN_THE_BLANKS]
    if (!validTypes.includes(data.type)) {
      throw new AppError(400, "Invalid question type")
    }

    // Validate MCQ specific fields
    if (data.type === QUESTION_TYPE.MCQ) {
      if (!data.options || data.options.length !== 4) {
        throw new AppError(400, "MCQ must have exactly 4 options")
      }
      if (data.correctOption === undefined || data.correctOption < 0 || data.correctOption > 3) {
        throw new AppError(400, "Correct option must be between 0 and 3")
      }
    }

    // Validate FILL_IN_THE_BLANKS specific fields
    if (data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS) {
      if (!data.correctAnswers || !Array.isArray(data.correctAnswers) || data.correctAnswers.length === 0) {
        throw new AppError(400, "FILL_IN_THE_BLANKS must have at least one blank with correct answers")
      }

      // Validate each blank has an array of answers
      for (let i = 0; i < data.correctAnswers.length; i++) {
        if (!Array.isArray(data.correctAnswers[i]) || data.correctAnswers[i].length === 0) {
          throw new AppError(400, `Blank ${i + 1} must have at least one correct answer`)
        }
        // Ensure all answers are strings
        if (!data.correctAnswers[i].every((answer) => typeof answer === "string")) {
          throw new AppError(400, `Blank ${i + 1} contains non-string answers`)
        }
      }
    }

    // Upload images to S3
    let questionImageUrl: string | undefined
    let solutionImageUrl: string | undefined

    if (data.questionImage) {
      questionImageUrl = await uploadToS3(data.questionImage)
    }

    if (data.solutionImage) {
      solutionImageUrl = await uploadToS3(data.solutionImage)
    }

    // Get question order
    const questionCount = await prisma.question.count({ where: { paperId } })

    const question = await prisma.question.create({
      data: {
        paperId,
        type: data.type as any,
        difficulty: data.difficulty as any,
        questionText: data.questionText,
        questionImage: questionImageUrl,
        options:
          data.type === QUESTION_TYPE.MCQ
            ? (data.options as Prisma.InputJsonValue)
            : data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS
              ? (data.correctAnswers as Prisma.InputJsonValue)
              : Prisma.JsonNull,
        correctOption: data.type === QUESTION_TYPE.MCQ ? data.correctOption : null,
        caseSensitive: data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS ? (data.caseSensitive || false) : false,
        solutionText: data.solutionText,
        solutionImage: solutionImageUrl,
        marks: data.marks || 1,
        order: questionCount + 1,
      },
    })

    return question
  }

  async getQuestions(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    const questions = await prisma.question.findMany({
      where: { paperId },
      orderBy: { order: "asc" },
    })

    return questions
  }

  async getQuestionById(questionId: string, paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question || question.paperId !== paperId) {
      throw new AppError(404, ERROR_MESSAGES.QUESTION_NOT_FOUND)
    }

    return question
  }

  async updateQuestion(questionId: string, paperId: string, teacherId: string, data: any) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question || question.paperId !== paperId) {
      throw new AppError(404, ERROR_MESSAGES.QUESTION_NOT_FOUND)
    }

    // Cannot update questions in published papers
    if (paper.status === PAPER_STATUS.PUBLISHED) {
      throw new AppError(400, "Cannot update questions in published paper")
    }

    let questionImageUrl = question.questionImage
    let solutionImageUrl = question.solutionImage

    if (data.questionImage) {
      questionImageUrl = await uploadToS3(data.questionImage)
    }

    if (data.solutionImage) {
      solutionImageUrl = await uploadToS3(data.solutionImage)
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: data.questionText || question.questionText,
        questionImage: questionImageUrl,
        solutionText: data.solutionText || question.solutionText,
        solutionImage: solutionImageUrl,
        ...(data.options && { options: data.options as Prisma.InputJsonValue }),
        ...(data.correctAnswers && { options: data.correctAnswers as Prisma.InputJsonValue }),
        correctOption: data.correctOption !== undefined ? data.correctOption : question.correctOption,
        caseSensitive: data.caseSensitive !== undefined ? data.caseSensitive : question.caseSensitive,
        marks: data.marks || question.marks,
      },
    })

    return updatedQuestion
  }

  async deleteQuestion(questionId: string, paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question || question.paperId !== paperId) {
      throw new AppError(404, ERROR_MESSAGES.QUESTION_NOT_FOUND)
    }

    // Cannot delete questions from published papers
    if (paper.status === PAPER_STATUS.PUBLISHED) {
      throw new AppError(400, "Cannot delete questions from published paper")
    }

    await prisma.question.delete({ where: { id: questionId } })
    return { message: "Question deleted successfully" }
  }

  async bulkUploadQuestions(
    paperId: string,
    teacherId: string,
    file: Express.Multer.File,
  ) {
    // Validate paper ownership
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    // Cannot add questions to published papers
    if (paper.status === PAPER_STATUS.PUBLISHED) {
      throw new AppError(400, "Cannot add questions to published paper")
    }

    // Parse Excel file
    const workbook = XLSX.read(file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" })

    if (!data || data.length === 0) {
      throw new AppError(400, "Excel file is empty or invalid")
    }

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    }

    // Get current question count for ordering
    let questionCount = await prisma.question.count({ where: { paperId } })

    // Process each row
    const questionsToCreate: any[] = []

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]
      const rowNumber = i + 2 // Excel row number (1-indexed + header row)

      try {
        // Validate required fields
        if (!row.Type || !row.Difficulty || !row["Question Text"]) {
          throw new Error("Missing required fields: Type, Difficulty, or Question Text")
        }

        // Validate question type
        const type = row.Type.toUpperCase()
        const validTypes = [QUESTION_TYPE.TEXT, QUESTION_TYPE.MCQ, QUESTION_TYPE.FILL_IN_THE_BLANKS]
        if (!validTypes.includes(type)) {
          throw new Error(`Invalid question type: ${row.Type}. Must be TEXT, MCQ, or FILL_IN_THE_BLANKS`)
        }

        // Validate difficulty
        const difficulty = row.Difficulty.toUpperCase()
        const validDifficulties = ["EASY", "INTERMEDIATE", "ADVANCED"]
        if (!validDifficulties.includes(difficulty)) {
          throw new Error(`Invalid difficulty: ${row.Difficulty}. Must be EASY, INTERMEDIATE, or ADVANCED`)
        }

        let options: any = Prisma.JsonNull
        let correctOption: number | null = null
        let caseSensitive = false

        // Validate MCQ specific fields
        if (type === QUESTION_TYPE.MCQ) {
          const mcqOptions = [
            row["Option 1"]?.toString().trim(),
            row["Option 2"]?.toString().trim(),
            row["Option 3"]?.toString().trim(),
            row["Option 4"]?.toString().trim(),
          ]

          if (mcqOptions.some((opt) => !opt)) {
            throw new Error("MCQ must have all 4 options filled")
          }

          const correctOptionValue = Number.parseInt(row["Correct Option"])
          if (!correctOptionValue || correctOptionValue < 1 || correctOptionValue > 4) {
            throw new Error("Correct Option must be between 1 and 4 for MCQ")
          }

          options = mcqOptions as Prisma.InputJsonValue
          correctOption = correctOptionValue - 1 // Convert to 0-indexed
        }

        // Validate FILL_IN_THE_BLANKS specific fields
        if (type === QUESTION_TYPE.FILL_IN_THE_BLANKS) {
          const correctAnswersStr = row["Correct Answers"]?.toString().trim()
          if (!correctAnswersStr) {
            throw new Error("FILL_IN_THE_BLANKS must have Correct Answers specified")
          }

          // Parse format: "France;france|Paris;paris"
          // Each blank separated by |, alternatives separated by ;
          const blanks = correctAnswersStr.split("|").map((blank: string) => blank.split(";").map((ans: string) => ans.trim()))

          if (blanks.length === 0 || blanks.some((blank: string[]) => blank.length === 0)) {
            throw new Error("FILL_IN_THE_BLANKS must have at least one blank with correct answers")
          }

          options = blanks as Prisma.InputJsonValue
          caseSensitive = row["Case Sensitive"]?.toString().toUpperCase() === "TRUE"
        }

        const marks = row.Marks ? Number.parseInt(row.Marks) : 1
        if (Number.isNaN(marks) || marks < 1) {
          throw new Error("Marks must be a positive number")
        }

        // Prepare question data
        questionsToCreate.push({
          paperId,
          type: type as any,
          difficulty: difficulty as any,
          questionText: row["Question Text"].toString().trim(),
          questionImage: null, // Bulk upload doesn't support images
          options,
          correctOption,
          caseSensitive,
          solutionText: row["Solution Text"]?.toString().trim() || null,
          solutionImage: null, // Bulk upload doesn't support images
          marks,
          order: questionCount + i + 1,
        })

        results.successful++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: rowNumber,
          error: error.message || "Unknown error",
        })
      }
    }

    // Create all valid questions in a transaction
    if (questionsToCreate.length > 0) {
      await prisma.question.createMany({
        data: questionsToCreate,
      })
    }

    return results
  }
}

export const questionService = new QuestionService()
