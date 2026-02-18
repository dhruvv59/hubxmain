import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, QUESTION_TYPE } from "@utils/constants"
import { uploadToS3 } from "@utils/s3"
import type { QuestionType, Difficulty, Prisma } from "@prisma/client"
import * as XLSX from "xlsx"

interface CreateQuestionBankData {
  type: QuestionType
  difficulty: Difficulty
  questionText: string
  questionImage?: Express.Multer.File
  options?: string[]
  correctOption?: number
  caseSensitive?: boolean
  correctAnswers?: string[][]
  solutionText?: string
  solutionImage?: Express.Multer.File
  marks?: number
  subjectId?: string
  chapterIds?: string[]
  tags?: string[]
  // Frontend compatibility
  text?: string
}

interface QuestionBankFilters {
  page?: number
  limit?: number
  subjectId?: string
  chapterIds?: string[]
  difficulty?: Difficulty
  type?: QuestionType
  tags?: string[]
  search?: string
}

export class QuestionBankService {
  async createBankQuestion(teacherId: string, data: CreateQuestionBankData) {
    // Frontend compatibility: Map 'text' to 'questionText'
    if (!data.questionText && data.text) {
      data.questionText = data.text
    }
    // Validate question type and type-specific fields
    if (data.type === QUESTION_TYPE.MCQ) {
      if (!data.options || data.options.length !== 4) {
        throw new AppError(400, "MCQ must have exactly 4 options")
      }
      if (data.correctOption === undefined || data.correctOption < 0 || data.correctOption > 3) {
        throw new AppError(400, "MCQ must have a valid correct option (0-3)")
      }
    }

    if (data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS) {
      if (!data.correctAnswers || data.correctAnswers.length === 0) {
        throw new AppError(400, "Fill in the blanks must have correct answers")
      }
    }

    // Validate subject ownership if provided
    if (data.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: data.subjectId,
          standard: { teacherId }
        }
      })
      if (!subject) {
        throw new AppError(404, "Subject not found or you don't have access")
      }
    }

    // Validate chapter ownership if provided
    if (data.chapterIds && data.chapterIds.length > 0) {
      const chapters = await prisma.chapter.findMany({
        where: {
          id: { in: data.chapterIds },
          subject: {
            standard: { teacherId }
          }
        }
      })
      if (chapters.length !== data.chapterIds.length) {
        throw new AppError(404, "One or more chapters not found or you don't have access")
      }
    }

    // Validate marks
    if (data.marks && data.marks <= 0) {
      throw new AppError(400, "Marks must be greater than 0")
    }

    // Upload images to S3 if provided
    let questionImageUrl: string | undefined
    let solutionImageUrl: string | undefined

    if (data.questionImage) {
      questionImageUrl = await uploadToS3(data.questionImage)
    }

    if (data.solutionImage) {
      solutionImageUrl = await uploadToS3(data.solutionImage)
    }

    // Create question in bank
    const questionBank = await prisma.questionBank.create({
      data: {
        teacherId,
        type: data.type,
        difficulty: data.difficulty,
        questionText: data.questionText,
        questionImage: questionImageUrl,
        options: data.type === QUESTION_TYPE.MCQ ? (data.options as any) : null,
        correctOption: data.type === QUESTION_TYPE.MCQ ? data.correctOption : null,
        caseSensitive: data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS ? (data.caseSensitive || false) : false,
        correctAnswers: data.type === QUESTION_TYPE.FILL_IN_THE_BLANKS ? (data.correctAnswers as any) : null,
        solutionText: data.solutionText,
        solutionImage: solutionImageUrl,
        marks: data.marks || 1,
        subjectId: data.subjectId,
        tags: data.tags ? (data.tags as any) : null,
        chapters: data.chapterIds ? {
          create: data.chapterIds.map(chapterId => ({
            chapterId
          }))
        } : undefined
      },
      include: {
        subject: true,
        chapters: {
          include: {
            chapter: true
          }
        }
      }
    })

    return this.transformQuestionBank(questionBank)
  }

  async getBankQuestions(teacherId: string, filters: QuestionBankFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 10
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      teacherId
    }

    if (filters.subjectId) {
      where.subjectId = filters.subjectId
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.search) {
      where.questionText = {
        contains: filters.search
      }
    }

    // Handle chapter filter
    if (filters.chapterIds && filters.chapterIds.length > 0) {
      where.chapters = {
        some: {
          chapterId: {
            in: filters.chapterIds
          }
        }
      }
    }

    // Handle tags filter (JSON contains)
    if (filters.tags && filters.tags.length > 0) {
      // Note: JSON filtering depends on database support
      // This is a simplified version
      where.tags = {
        path: '$',
        array_contains: filters.tags
      }
    }

    // Execute query with pagination
    const [questions, total] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        include: {
          subject: true,
          chapters: {
            include: {
              chapter: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.questionBank.count({ where })
    ])

    // Get filter counts for UI
    const [subjects, chapters, tagsList] = await Promise.all([
      prisma.questionBank.groupBy({
        by: ['subjectId'],
        where: { teacherId },
        _count: true
      }),
      prisma.questionBankChapter.groupBy({
        by: ['chapterId'],
        where: {
          questionBank: { teacherId }
        },
        _count: true
      }),
      // Tags aggregation would require custom logic
      Promise.resolve([])
    ])

    // Transform questions
    const transformedQuestions = questions.map(q => this.transformQuestionBank(q))

    return {
      questions: transformedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        subjects: subjects.map(s => ({ id: s.subjectId, count: s._count })),
        chapters: chapters.map(c => ({ id: c.chapterId, count: c._count })),
        tags: tagsList
      }
    }
  }

  async getBankQuestion(teacherId: string, questionId: string) {
    const question = await prisma.questionBank.findFirst({
      where: {
        id: questionId,
        teacherId
      },
      include: {
        subject: true,
        chapters: {
          include: {
            chapter: true
          }
        }
      }
    })

    if (!question) {
      throw new AppError(404, "Question not found in your bank")
    }

    return this.transformQuestionBank(question)
  }

  async updateBankQuestion(teacherId: string, questionId: string, data: Partial<CreateQuestionBankData>) {
    // Frontend compatibility: Map 'text' to 'questionText'
    if (!data.questionText && data.text) {
      data.questionText = data.text
    }

    // Verify ownership
    const existingQuestion = await prisma.questionBank.findFirst({
      where: {
        id: questionId,
        teacherId
      }
    })

    if (!existingQuestion) {
      throw new AppError(404, "Question not found in your bank")
    }

    // Validate type-specific fields if type is provided
    if (data.type === QUESTION_TYPE.MCQ && data.options) {
      if (data.options.length !== 4) {
        throw new AppError(400, "MCQ must have exactly 4 options")
      }
    }

    // Upload new images if provided
    let questionImageUrl = existingQuestion.questionImage
    let solutionImageUrl = existingQuestion.solutionImage

    if (data.questionImage) {
      questionImageUrl = await uploadToS3(data.questionImage)
    }

    if (data.solutionImage) {
      solutionImageUrl = await uploadToS3(data.solutionImage)
    }

    // Update chapters if provided
    if (data.chapterIds) {
      // Delete existing chapter links
      await prisma.questionBankChapter.deleteMany({
        where: { questionBankId: questionId }
      })

      // Create new chapter links
      if (data.chapterIds.length > 0) {
        await prisma.questionBankChapter.createMany({
          data: data.chapterIds.map(chapterId => ({
            questionBankId: questionId,
            chapterId
          }))
        })
      }
    }

    // Update question
    const updated = await prisma.questionBank.update({
      where: { id: questionId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.questionText && { questionText: data.questionText }),
        ...(questionImageUrl && { questionImage: questionImageUrl }),
        ...(data.options && { options: data.options as any }),
        ...(data.correctOption !== undefined && { correctOption: data.correctOption }),
        ...(data.caseSensitive !== undefined && { caseSensitive: data.caseSensitive }),
        ...(data.correctAnswers && { correctAnswers: data.correctAnswers as any }),
        ...(data.solutionText !== undefined && { solutionText: data.solutionText }),
        ...(solutionImageUrl && { solutionImage: solutionImageUrl }),
        ...(data.marks && { marks: data.marks }),
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.tags && { tags: data.tags as any })
      },
      include: {
        subject: true,
        chapters: {
          include: {
            chapter: true
          }
        }
      }
    })

    return this.transformQuestionBank(updated)
  }

  async deleteBankQuestion(teacherId: string, questionId: string) {
    // Verify ownership
    const question = await prisma.questionBank.findFirst({
      where: {
        id: questionId,
        teacherId
      }
    })

    if (!question) {
      throw new AppError(404, "Question not found in your bank")
    }

    // Delete question (cascade will handle chapters and paper links)
    await prisma.questionBank.delete({
      where: { id: questionId }
    })

    return { success: true }
  }

  async addToPaper(teacherId: string, questionId: string, paperId: string, order?: number) {
    // Verify question ownership
    const bankQuestion = await prisma.questionBank.findFirst({
      where: {
        id: questionId,
        teacherId
      }
    })

    if (!bankQuestion) {
      throw new AppError(404, "Question not found in your bank")
    }

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: {
        id: paperId,
        teacherId
      }
    })

    if (!paper) {
      throw new AppError(404, "Paper not found or you don't have access")
    }

    // Check if paper is published
    if (paper.status === 'PUBLISHED') {
      throw new AppError(400, "Cannot add questions to a published paper")
    }

    // Get current question count for ordering
    const questionCount = await prisma.question.count({
      where: { paperId }
    })

    // Create question in paper
    const question = await prisma.question.create({
      data: {
        paperId,
        type: bankQuestion.type,
        difficulty: bankQuestion.difficulty,
        questionText: bankQuestion.questionText,
        questionImage: bankQuestion.questionImage,
        options: bankQuestion.options || undefined,
        correctOption: bankQuestion.correctOption,
        caseSensitive: bankQuestion.caseSensitive,
        solutionText: bankQuestion.solutionText,
        solutionImage: bankQuestion.solutionImage,
        marks: bankQuestion.marks,
        order: order !== undefined ? order : questionCount + 1,
        bankSource: {
          create: {
            questionBankId: questionId
          }
        }
      }
    })

    // Increment usage count
    await prisma.questionBank.update({
      where: { id: questionId },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return {
      questionId: question.id,
      paperId,
      order: question.order
    }
  }

  /**
   * Bulk upload questions to question bank from Excel file
   */
  async bulkUploadBankQuestions(
    teacherId: string,
    file: Express.Multer.File,
    subjectId?: string,
    chapterIds?: string[]
  ) {
    // Validate subject ownership if provided
    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          standard: { teacherId }
        }
      })
      if (!subject) {
        throw new AppError(404, "Subject not found or you don't have access")
      }
    }

    // Validate chapter ownership if provided
    if (chapterIds && chapterIds.length > 0) {
      const chapters = await prisma.chapter.findMany({
        where: {
          id: { in: chapterIds },
          subject: {
            standard: { teacherId }
          }
        }
      })
      if (chapters.length !== chapterIds.length) {
        throw new AppError(404, "One or more chapters not found or you don't have access")
      }
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

    // Process each row
    const questionsToCreate: any[] = []
    const questionChapters: Array<{ questionIndex: number; chapterIds: string[] }> = []

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

        let options: any = null
        let correctOption: number | null = null
        let caseSensitive = false
        let correctAnswers: any = null

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
          const blanks = correctAnswersStr.split("|").map((blank: string) =>
            blank.split(";").map((ans: string) => ans.trim())
          )

          if (blanks.length === 0 || blanks.some((blank: string[]) => blank.length === 0)) {
            throw new Error("FILL_IN_THE_BLANKS must have at least one blank with correct answers")
          }

          correctAnswers = blanks as Prisma.InputJsonValue
          caseSensitive = row["Case Sensitive"]?.toString().toUpperCase() === "TRUE"
        }

        const marks = row.Marks ? Number.parseFloat(row.Marks) : 1
        if (Number.isNaN(marks) || marks <= 0) {
          throw new Error("Marks must be a positive number")
        }

        // Parse tags if provided (comma-separated)
        const tags = row.Tags ? row.Tags.toString().split(',').map((tag: string) => tag.trim()).filter(Boolean) : null

        // Prepare question data
        questionsToCreate.push({
          teacherId,
          type: type as any,
          difficulty: difficulty as any,
          questionText: row["Question Text"].toString().trim(),
          questionImage: null, // Bulk upload doesn't support images
          options,
          correctOption,
          caseSensitive,
          correctAnswers,
          solutionText: row["Solution Text"]?.toString().trim() || null,
          solutionImage: null, // Bulk upload doesn't support images
          marks,
          subjectId: subjectId || null,
          tags: tags as Prisma.InputJsonValue,
          usageCount: 0
        })

        // Store chapter IDs for this question if provided
        if (chapterIds && chapterIds.length > 0) {
          questionChapters.push({
            questionIndex: results.successful,
            chapterIds
          })
        }

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
      const createdQuestions = await prisma.$transaction(async (tx) => {
        // Create questions
        const questions = await Promise.all(
          questionsToCreate.map(questionData =>
            tx.questionBank.create({ data: questionData })
          )
        )

        // Create chapter links if provided
        if (questionChapters.length > 0) {
          const chapterLinks = questionChapters.flatMap(({ questionIndex, chapterIds: qChapterIds }) =>
            qChapterIds.map(chapterId => ({
              questionBankId: questions[questionIndex].id,
              chapterId
            }))
          )

          if (chapterLinks.length > 0) {
            await tx.questionBankChapter.createMany({
              data: chapterLinks
            })
          }
        }

        return questions
      })

      return {
        ...results,
        questions: createdQuestions.map(q => ({ id: q.id, questionText: q.questionText }))
      }
    }

    return results
  }

  /**
   * Create multiple bank questions in a single batch operation (atomic transaction)
   */
  async createBankQuestionsInBatch(
    teacherId: string,
    questionsData: CreateQuestionBankData[],
    files?: { [fieldname: string]: Express.Multer.File[] }
  ) {
    // Validate at least one question
    if (!questionsData || questionsData.length === 0) {
      throw new AppError(400, "At least one question is required")
    }

    // Validate subject ownership if any question has a subject
    const uniqueSubjectIds = [...new Set(questionsData.map(q => q.subjectId).filter((id): id is string => Boolean(id)))]
    if (uniqueSubjectIds.length > 0) {
      const subjects = await prisma.subject.findMany({
        where: {
          id: { in: uniqueSubjectIds },
          standard: { teacherId }
        }
      })
      if (subjects.length !== uniqueSubjectIds.length) {
        throw new AppError(404, "One or more subjects not found or you don't have access")
      }
    }

    // Validate chapters ownership if any question has chapters
    const uniqueChapterIds = [...new Set(questionsData.flatMap(q => q.chapterIds || []))]
    if (uniqueChapterIds.length > 0) {
      const chapters = await prisma.chapter.findMany({
        where: {
          id: { in: uniqueChapterIds },
          subject: {
            standard: { teacherId }
          }
        }
      })
      if (chapters.length !== uniqueChapterIds.length) {
        throw new AppError(404, "One or more chapters not found or you don't have access")
      }
    }

    // Validate each question type-specific fields
    const validationErrors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i]

      // Frontend compatibility: Map 'text' to 'questionText'
      if (!q.questionText && q.text) {
        q.questionText = q.text
      }

      // Validate required fields
      if (!q.questionText) {
        validationErrors.push({ index: i, error: "Question text is required" })
        continue
      }

      if (!q.type) {
        validationErrors.push({ index: i, error: "Question type is required" })
        continue
      }

      if (!q.difficulty) {
        validationErrors.push({ index: i, error: "Difficulty is required" })
        continue
      }

      // Type-specific validation
      if (q.type === QUESTION_TYPE.MCQ) {
        if (!q.options || q.options.length < 2) {
          validationErrors.push({ index: i, error: "MCQ must have at least 2 options" })
          continue
        }
        if (q.correctOption === undefined || q.correctOption < 0 || q.correctOption >= q.options.length) {
          validationErrors.push({ index: i, error: `MCQ correct option must be between 0 and ${q.options.length - 1}` })
          continue
        }
      }

      if (q.type === QUESTION_TYPE.FILL_IN_THE_BLANKS) {
        if (!q.correctAnswers || q.correctAnswers.length === 0) {
          validationErrors.push({ index: i, error: "Fill in the blanks must have correct answers" })
          continue
        }
      }

      // Validate marks
      if (q.marks && q.marks <= 0) {
        validationErrors.push({ index: i, error: "Marks must be greater than 0" })
        continue
      }
    }

    // If all questions have validation errors, return error
    if (validationErrors.length === questionsData.length) {
      throw new AppError(400, `All questions have validation errors: ${validationErrors.map(e => `Q${e.index + 1}: ${e.error}`).join("; ")}`)
    }

    // Upload images for all questions
    const uploadedImages: Array<{ questionIndex: number; questionImageUrl?: string; solutionImageUrl?: string }> = []

    for (let i = 0; i < questionsData.length; i++) {
      const imageEntry = { questionIndex: i }

      // Upload question image if exists
      const questionImageFile = files?.[`questionImage_${i}`]?.[0]
      if (questionImageFile) {
        try {
          const url = await uploadToS3(questionImageFile)
            ; (imageEntry as any).questionImageUrl = url
        } catch (error) {
          console.error(`Failed to upload question image for question ${i}:`, error)
          // Continue without image, don't fail entire batch
        }
      }

      // Upload solution image if exists
      const solutionImageFile = files?.[`solutionImage_${i}`]?.[0]
      if (solutionImageFile) {
        try {
          const url = await uploadToS3(solutionImageFile)
            ; (imageEntry as any).solutionImageUrl = url
        } catch (error) {
          console.error(`Failed to upload solution image for question ${i}:`, error)
          // Continue without image, don't fail entire batch
        }
      }

      uploadedImages.push(imageEntry)
    }

    // Prepare questions for creation (filter out invalid ones)
    const validQuestions = questionsData
      .map((q, i) => ({ ...q, _index: i }))
      .filter(q => !validationErrors.some(e => e.index === q._index))

    if (validQuestions.length === 0) {
      throw new AppError(400, `No valid questions to create: ${validationErrors.map(e => `Q${e.index + 1}: ${e.error}`).join("; ")}`)
    }

    // Create questions in a transaction
    const createdQuestions = await prisma.$transaction(async (tx) => {
      const created = []

      for (const qData of validQuestions) {
        const originalIndex = qData._index as number
        const imageEntry = uploadedImages.find(img => img.questionIndex === originalIndex)

        const questionData: any = {
          teacherId,
          type: qData.type,
          difficulty: qData.difficulty,
          questionText: qData.questionText,
          questionImage: imageEntry?.questionImageUrl,
          marks: qData.marks || 1,
          solutionText: qData.solutionText,
          solutionImage: imageEntry?.solutionImageUrl,
          subjectId: qData.subjectId,
          tags: qData.tags ? (qData.tags as any) : null,
        }

        // Type-specific fields
        if (qData.type === QUESTION_TYPE.MCQ) {
          questionData.options = qData.options as any
          questionData.correctOption = qData.correctOption
        } else if (qData.type === QUESTION_TYPE.FILL_IN_THE_BLANKS) {
          questionData.correctAnswers = qData.correctAnswers as any
          questionData.caseSensitive = qData.caseSensitive || false
        }

        const question = await tx.questionBank.create({
          data: questionData,
          include: {
            subject: true,
            chapters: {
              include: {
                chapter: true
              }
            }
          }
        })

        // Create chapter links if provided
        if (qData.chapterIds && qData.chapterIds.length > 0) {
          await tx.questionBankChapter.createMany({
            data: qData.chapterIds.map(chapterId => ({
              questionBankId: question.id,
              chapterId
            }))
          })
        }

        created.push(this.transformQuestionBank(question))
      }

      return created
    })

    return {
      successful: createdQuestions.length,
      failed: validationErrors.length,
      questions: createdQuestions,
      errors: validationErrors.length > 0 ? validationErrors : undefined
    }
  }

  private transformQuestionBank(question: any) {
    return {
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      questionText: question.questionText,
      questionImage: question.questionImage,
      options: question.options,
      correctOption: question.correctOption,
      caseSensitive: question.caseSensitive,
      correctAnswers: question.correctAnswers,
      solutionText: question.solutionText,
      solutionImage: question.solutionImage,
      marks: question.marks,
      subject: question.subject ? {
        id: question.subject.id,
        name: question.subject.name
      } : null,
      chapters: question.chapters?.map((qc: any) => ({
        id: qc.chapter.id,
        name: qc.chapter.name
      })) || [],
      tags: question.tags || [],
      usageCount: question.usageCount,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }
  }
}

export const questionBankService = new QuestionBankService()
