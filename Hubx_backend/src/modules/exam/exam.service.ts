import prisma from "@config/database"
import redis from "@config/redis"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, EXAM_STATUS, PAPER_STATUS } from "@utils/constants"
import { studentService } from "@modules/student/student.service"

export class ExamService {
  async startExam(paperId: string, studentId: string) {
    // Validate that the student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      throw new AppError(404, "Student not found. Please log in again.")
    }

    if (student.role !== "STUDENT") {
      throw new AppError(403, "Only students can start exams")
    }

    // Check if paper exists and is published
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { questions: true },
    })

    if (!paper || paper.status !== PAPER_STATUS.PUBLISHED) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    // Check if student has purchased (if paper is paid)
    // FREE papers (price = 0) are always accessible
    if (paper.price && paper.price > 0) {
      const purchase = await prisma.paperPurchase.findUnique({
        where: { paperId_studentId: { paperId, studentId } },
      })
      if (!purchase) {
        throw new AppError(403, "Paper not purchased")
      }
    }

    // Check if student already has an ongoing attempt
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: { paperId_studentId: { paperId, studentId } },
    })

    if (existingAttempt && existingAttempt.status === "ONGOING") {
      return existingAttempt
    }

    // If attempt exists but is submitted, delete it for a fresh attempt
    if (existingAttempt && existingAttempt.status === "SUBMITTED") {
      await prisma.examAttempt.delete({
        where: { id: existingAttempt.id },
      })
    }

    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        paperId,
        studentId,
        status: "ONGOING" as const,
        startedAt: new Date(),
        totalMarks: paper.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      },
    })

    // If paper is time bound, set timer in Redis
    if (paper.type === "TIME_BOUND" && paper.duration) {
      const timerKey = `timer:${attempt.id}`
      const durationSeconds = paper.duration * 60

      // Set timer with expiration
      await redis.setex(
        timerKey,
        durationSeconds,
        JSON.stringify({
          attemptId: attempt.id,
          paperId,
          studentId,
          endTime: Date.now() + durationSeconds * 1000,
        }),
      )

      // Schedule auto-submit when timer expires
      setTimeout(() => {
        this.autoSubmitExam(attempt.id, studentId)
      }, durationSeconds * 1000)
    }

    return attempt
  }

  async getQuestion(attemptId: string, studentId: string, questionIndex: number) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { paper: { include: { questions: true } } },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status !== "ONGOING") {
      throw new AppError(400, "Exam is not ongoing")
    }

    const questions = attempt.paper.questions
    if (questionIndex < 0 || questionIndex >= questions.length) {
      throw new AppError(400, "Invalid question index")
    }

    const question = questions[questionIndex]

    // Get student's answer if exists
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
    })

    // Return question without solution and correct option for MCQ
    return {
      ...question,
      options: question.type === "MCQ" ? question.options : undefined,
      correctOption: undefined, // Hide correct option during exam
      solutionText: undefined, // Hide solution during exam
      solutionImage: undefined, // Hide solution during exam
      studentAnswer: studentAnswer || null,
      questionNumber: questionIndex + 1,
      totalQuestions: questions.length,
    }
  }

  async saveAnswer(
    attemptId: string,
    studentId: string,
    questionId: string,
    answer: {
      answerText?: string
      selectedOption?: number
    },
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status !== "ONGOING") {
      throw new AppError(400, "Exam is not ongoing")
    }

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question || question.paperId !== attempt.paperId) {
      throw new AppError(404, ERROR_MESSAGES.QUESTION_NOT_FOUND)
    }

    // Check if answer exists
    let studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId } },
    })

    // Determine if answer is correct and compute marksObtained
    let isCorrect: boolean | null = null
    let marksObtained = 0
    const questionMarks = question.marks || 1

    if (question.type === "MCQ" && answer.selectedOption !== undefined) {
      isCorrect = answer.selectedOption === question.correctOption
      marksObtained = isCorrect ? questionMarks : 0
    }

    // Handle TEXT question type by calling OpenAI to evaluate answer liberally
    if (question.type === "TEXT" && answer.answerText !== undefined && answer.answerText !== null) {
      try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY
        if (OPENAI_API_KEY) {
          const payload = {
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional teacher. Evaluate the student's answer against the provided solution liberally and kindly. Output ONLY a JSON object with keys: marksObtained (number), isCorrect (true|false|null), feedback (short string). Do not include any extra text.",
              },
              {
                role: "user",
                content: `Solution: ${question.solutionText || ""}\n\nStudent Answer: ${answer.answerText}\n\nMaxMarks: ${questionMarks}`,
              },
            ],
            temperature: 0.2,
          }

          const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(payload),
          })

          if (resp.ok) {
            const j = await resp.json() as any
            const content = j?.choices?.[0]?.message?.content || ""
            let parsed: any = null
            try {
              parsed = JSON.parse(content)
            } catch (e) {
              // try to extract JSON substring
              const m = content.match(/\{[\s\S]*\}/)
              if (m) {
                try {
                  parsed = JSON.parse(m[0])
                } catch (e) {
                  parsed = null
                }
              }
            }

            if (parsed && typeof parsed.marksObtained === "number") {
              marksObtained = Math.min(questionMarks, Math.max(0, Math.round(parsed.marksObtained)))
              isCorrect = marksObtained >= 1
            } else {
              // Fallback: basic similarity scoring
              const sol = (question.solutionText || "").toLowerCase()
              const ans = String(answer.answerText).toLowerCase()
              const solWords = sol.split(/\s+/).filter(Boolean)
              const common = solWords.filter((w) => ans.includes(w)).length
              const score = solWords.length > 0 ? common / solWords.length : 0
              marksObtained = Math.round(Math.min(questionMarks, Math.max(0, score * questionMarks)))
              isCorrect = marksObtained >= 1
            }
          }
        }
      } catch (e) {
        // Swallow errors and fall back to 0 marks (non-blocking)
      }
    }

    // Handle FILL_IN_THE_BLANKS: answer.answerText expected as pipe-separated values
    if (question.type === "FILL_IN_THE_BLANKS" && answer.answerText !== undefined && answer.answerText !== null) {
      const studentParts = String(answer.answerText).split("|").map((s) => s.trim())
      const correctArrays: any = question.options || [] // created as Json (array of arrays)

      let allMatched = true

      if (!Array.isArray(correctArrays) || correctArrays.length === 0) {
        allMatched = false
      } else {
        for (let i = 0; i < correctArrays.length; i++) {
          const possibleAnswers = Array.isArray(correctArrays[i]) ? correctArrays[i] : []
          const studentAns = studentParts[i] ?? ""

          const matched = possibleAnswers.some((ans: any) => {
            if (typeof ans !== "string") return false
            if (question.caseSensitive) {
              return ans.trim() === studentAns
            }
            return ans.trim().toLowerCase() === studentAns.trim().toLowerCase()
          })

          if (!matched) {
            allMatched = false
            break
          }
        }
      }

      isCorrect = allMatched
      marksObtained = isCorrect ? questionMarks : 0
    }

    if (studentAnswer) {
      // Update existing answer
      studentAnswer = await prisma.studentAnswer.update({
        where: { id: studentAnswer.id },
        data: {
          answerText: answer.answerText,
          selectedOption: answer.selectedOption,
          isCorrect,
          marksObtained,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new answer
      studentAnswer = await prisma.studentAnswer.create({
        data: {
          attemptId,
          questionId,
          studentId,
          answerText: answer.answerText,
          selectedOption: answer.selectedOption,
          isCorrect,
          marksObtained,
        },
      })
    }

    return studentAnswer
  }

  async markForReview(attemptId: string, studentId: string, questionId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId } },
    })

    if (!studentAnswer) {
      throw new AppError(404, "Answer not found")
    }

    const updatedAnswer = await prisma.studentAnswer.update({
      where: { id: studentAnswer.id },
      data: { markedForReview: !studentAnswer.markedForReview },
    })

    return updatedAnswer
  }

  /**
   * SHARED SCORING LOGIC - Used by both manual and auto-submit
   * Ensures consistent score calculation across all submission types
   */
  private async calculateAndSubmitExam(
    attemptId: string,
    studentId: string,
    isAutoSubmit: boolean = false
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { question: true } },
        paper: { include: { questions: true } },
      },
    })

    if (!attempt) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    // Calculate score from stored marksObtained in answers
    let totalScore = 0
    let answeredCount = 0

    for (const answer of attempt.answers) {
      const answered = answer.selectedOption !== null || (answer.answerText !== null && answer.answerText !== undefined && answer.answerText !== "")
      if (answered) {
        answeredCount++
        totalScore += typeof answer.marksObtained === "number" ? answer.marksObtained : 0
      }
    }

    const percentage = attempt.totalMarks > 0 ? (totalScore / attempt.totalMarks) * 100 : 0

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)

    // Update attempt with calculated scores
    const submittedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: isAutoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
        submittedAt: new Date(),
        totalScore,
        percentage,
        timeSpent,
      },
    })

    // Update paper statistics (aggregated)
    const allAttempts = await prisma.examAttempt.findMany({
      where: {
        paperId: attempt.paperId,
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] }
      },
    })

    const averageScore =
      allAttempts.length > 0 ? allAttempts.reduce((sum, a) => sum + a.totalScore, 0) / allAttempts.length : 0

    await prisma.paper.update({
      where: { id: attempt.paperId },
      data: {
        totalAttempts: allAttempts.length,
        averageScore,
      },
    })

    // Clear Redis timer
    const timerKey = `timer:${attemptId}`
    await redis.del(timerKey).catch(() => { }) // Fail silently if key doesn't exist

    // PERFORMANCE: Invalidate rankings cache since scores have changed
    studentService.invalidateRankingsCache().catch((err) => {
      console.error("Failed to invalidate rankings cache:", err)
    })

    return submittedAttempt
  }

  async submitExam(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status !== EXAM_STATUS.ONGOING) {
      throw new AppError(400, "Exam is not ongoing")
    }

    return this.calculateAndSubmitExam(attemptId, studentId, false)
  }

  async autoSubmitExam(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.status !== "ONGOING") {
      return
    }

    // Use the same scoring logic as manual submit
    return this.calculateAndSubmitExam(attemptId, studentId, true)
  }

  async raiseDoubt(attemptId: string, studentId: string, questionId: string, doubtText: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    const doubt = await prisma.doubt.create({
      data: {
        attemptId,
        questionId,
        studentId,
        doubtText,
      },
    })

    return doubt
  }

  async markQuestionAsHard(attemptId: string, studentId: string, questionId: string, isTooHard: boolean) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    // Get or create student answer
    let studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId } },
    })

    if (studentAnswer) {
      // Update existing answer
      studentAnswer = await prisma.studentAnswer.update({
        where: { id: studentAnswer.id },
        data: { markedTooHard: isTooHard },
      })
    } else {
      // Create new answer record just for marking
      studentAnswer = await prisma.studentAnswer.create({
        data: {
          attemptId,
          questionId,
          studentId,
          markedTooHard: isTooHard,
        },
      })
    }

    return studentAnswer
  }

  async getExamData(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        paper: { include: { questions: true } },
      },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    // Get timer if exam is ongoing
    let timeRemaining: number | null = null
    if (attempt.status === "ONGOING" && attempt.paper.type === "TIME_BOUND") {
      const timerKey = `timer:${attemptId}`
      const timerData = await redis.get(timerKey)
      if (timerData) {
        const timer = JSON.parse(timerData)
        timeRemaining = Math.ceil((timer.endTime - Date.now()) / 1000)
      }
    }

    return {
      attempt,
      timeRemaining,
      progress: {
        answered: attempt.answers.filter((a) => a.selectedOption !== null).length,
        markedForReview: attempt.answers.filter((a) => a.markedForReview).length,
        total: attempt.paper.questions.length,
      },
    }
  }

  async getNextQuestion(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        paper: { include: { questions: { orderBy: { order: "asc" } } } },
        answers: true,
      },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status !== "ONGOING") {
      throw new AppError(400, "Exam is not ongoing")
    }

    const questions = attempt.paper.questions
    if (questions.length === 0) {
      throw new AppError(400, "No questions in paper")
    }

    // Find current question index from answers or default to 0
    const currentQuestionId = attempt.answers.length > 0 ? attempt.answers[attempt.answers.length - 1].questionId : null
    let currentIndex = currentQuestionId
      ? questions.findIndex(q => q.id === currentQuestionId)
      : -1

    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      throw new AppError(400, "Already at last question")
    }

    const question = questions[nextIndex]

    // Get student's answer if exists
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
    })

    return {
      questionId: question.id,
      questionNumber: nextIndex + 1,
      totalQuestions: questions.length,
      type: question.type,
      questionText: question.questionText,
      questionImage: question.questionImage,
      difficulty: question.difficulty,
      marks: question.marks,
      options: question.type === "MCQ" ? question.options : null,
      isAnswered: !!studentAnswer?.selectedOption || !!studentAnswer?.answerText,
      isMarked: studentAnswer?.markedForReview || false,
    }
  }

  async getPreviousQuestion(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        paper: { include: { questions: { orderBy: { order: "asc" } } } },
        answers: true,
      },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status !== "ONGOING") {
      throw new AppError(400, "Exam is not ongoing")
    }

    const questions = attempt.paper.questions
    if (questions.length === 0) {
      throw new AppError(400, "No questions in paper")
    }

    // Find current question index from answers or default to 0
    const currentQuestionId = attempt.answers.length > 0 ? attempt.answers[attempt.answers.length - 1].questionId : null
    let currentIndex = currentQuestionId
      ? questions.findIndex(q => q.id === currentQuestionId)
      : 0

    const previousIndex = currentIndex - 1
    if (previousIndex < 0) {
      throw new AppError(400, "Already at first question")
    }

    const question = questions[previousIndex]

    // Get student's answer if exists
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
    })

    return {
      questionId: question.id,
      questionNumber: previousIndex + 1,
      totalQuestions: questions.length,
      type: question.type,
      questionText: question.questionText,
      questionImage: question.questionImage,
      difficulty: question.difficulty,
      marks: question.marks,
      options: question.type === "MCQ" ? question.options : null,
      isAnswered: !!studentAnswer?.selectedOption || !!studentAnswer?.answerText,
      isMarked: studentAnswer?.markedForReview || false,
    }
  }

  async getResult(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { question: true } },
        paper: { include: { questions: true } },
      },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    if (attempt.status === "ONGOING") {
      throw new AppError(400, "Exam is still ongoing")
    }

    // Sort paper questions by `order` (fallback to existing order if not present)
    const paperQuestions = (attempt.paper.questions || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))

    // Build a map of questionId -> question index (1-based) from the paper's ordered questions
    const questionIndexMap: Record<string, number> = {}
    paperQuestions.forEach((q, idx) => {
      questionIndexMap[q.id] = idx + 1
    })

    // Build detailed answer breakdown using stored DB values (marksObtained etc.)
    const detailedAnswers = attempt.answers.map((answer) => ({
      questionId: answer.questionId,
      questionNumber: questionIndexMap[answer.questionId] || null,
      questionText: answer.question.questionText,
      questionImage: answer.question.questionImage,
      type: answer.question.type,
      difficulty: answer.question.difficulty,
      marks: answer.question.marks,
      studentAnswer:
        answer.selectedOption !== null && answer.selectedOption !== undefined ? answer.selectedOption : answer.answerText,
      correctAnswer: answer.question.type === "MCQ" ? answer.question.correctOption : answer.question.solutionText,
      isCorrect: answer.isCorrect,
      marksObtained: typeof answer.marksObtained === "number" ? answer.marksObtained : answer.isCorrect ? answer.question.marks : 0,
      markedForReview: answer.markedForReview,
    }))

    // Compute stats by difficulty from the paper's questions (total) and answers (correct)
    const statsByDifficulty = (paperQuestions || []).reduce((acc, q) => {
      const difficulty = q.difficulty
      if (!acc[difficulty]) acc[difficulty] = { total: 0, correct: 0 }
      acc[difficulty].total++
      return acc
    }, {} as Record<string, { total: number; correct: number }>)

    for (const ans of attempt.answers) {
      const diff = ans.question.difficulty
      if (!statsByDifficulty[diff]) statsByDifficulty[diff] = { total: 0, correct: 0 }
      if (ans.isCorrect) statsByDifficulty[diff].correct++
    }

    const questionsAttempted = attempt.answers.filter((a) => a.selectedOption !== null || (a.answerText !== null && String(a.answerText).trim() !== "")).length

    return {
      attemptId: attempt.id,
      paperId: attempt.paperId,
      paperTitle: attempt.paper.title,
      status: attempt.status,
      totalQuestions: attempt.paper.questions?.length || 0,
      questionsAttempted,
      correctAnswers: attempt.answers.filter((a) => a.isCorrect).length,
      score: attempt.totalScore,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeTaken: attempt.timeSpent,
      duration: attempt.paper.duration,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      answers: detailedAnswers,
      statistics: {
        byDifficulty: statsByDifficulty,
        markedForReview: attempt.answers.filter((a) => a.markedForReview).length,
        notAttempted: (attempt.paper.questions?.length || 0) - questionsAttempted,
      },
    }
  }
}

export const examService = new ExamService()
