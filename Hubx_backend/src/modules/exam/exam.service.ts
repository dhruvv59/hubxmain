import prisma from "@config/database"
import redis from "@config/redis"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, EXAM_STATUS, PAPER_STATUS } from "@utils/constants"
import { studentService } from "@modules/student/student.service"
import { sendEmail } from "@utils/email"

export class ExamService {
  async startExam(paperId: string, studentId: string, testSettings?: {
    noTimeLimit?: boolean
    showAnswerAfterWrong?: boolean
    enableSolutionView?: boolean
  }) {
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

    // Check if student already has an ONGOING attempt for this paper
    const ongoingAttempt = await prisma.examAttempt.findFirst({
      where: { paperId, studentId, status: "ONGOING" },
      orderBy: { createdAt: "desc" },
    })

    if (ongoingAttempt) {
      // Resume existing attempt
      return ongoingAttempt
    }

    // Count previous attempts to set attemptNumber
    const previousAttempts = await prisma.examAttempt.count({
      where: { paperId, studentId },
    })

    // Create new exam attempt (allows multiple re-attempts)
    const attempt = await prisma.examAttempt.create({
      data: {
        paperId,
        studentId,
        status: "ONGOING" as const,
        startedAt: new Date(),
        totalMarks: paper.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        attemptNumber: previousAttempts + 1,
        // Store test settings
        noTimeLimit: testSettings?.noTimeLimit ?? false,
        showAnswerAfterWrong: testSettings?.showAnswerAfterWrong ?? false,
        enableSolutionView: testSettings?.enableSolutionView ?? false,
      },
    })

    // If paper is time bound AND student did NOT select "no time limit", set timer in Redis
    // Note: Auto-submit is handled by the background job worker (src/jobs/exam-timer.ts)
    // that polls Redis every 10 seconds for expired timers
    if (paper.type === "TIME_BOUND" && paper.duration && !attempt.noTimeLimit) {
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

      console.log(`[Exam Timer] Set for attempt ${attempt.id}, duration: ${paper.duration}m`)
    } else if (attempt.noTimeLimit) {
      console.log(`[Exam Timer] Skipped for attempt ${attempt.id} - noTimeLimit enabled by student`)
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

    // Return question without solution and correct option for MCQ/FILL_IN_THE_BLANKS
    return {
      ...question,
      options: (question.type === "MCQ" || question.type === "FILL_IN_THE_BLANKS") ? question.options : undefined,
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

    // Handle MCQ questions
    if (question.type === "MCQ" && answer.selectedOption !== undefined) {
      isCorrect = answer.selectedOption === question.correctOption
      marksObtained = isCorrect ? questionMarks : 0
    }

    // Handle FILL_IN_THE_BLANKS with multiple choice options
    if (question.type === "FILL_IN_THE_BLANKS" && answer.selectedOption !== undefined && question.options) {
      const options = Array.isArray(question.options) ? question.options : []
      isCorrect = answer.selectedOption === question.correctOption && options.length > 0
      marksObtained = isCorrect ? questionMarks : 0
    }

    // Handle TEXT question type by calling OpenAI to evaluate answer liberally
    if (question.type === "TEXT" && answer.answerText !== undefined && answer.answerText !== null) {
      console.log(`[TEXT Question] Processing answer for question ${questionId}`, {
        answerLength: String(answer.answerText).length,
        questionMarks: questionMarks,
      })
      try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY
        if (OPENAI_API_KEY) {
          let aiEvaluationFailed = false
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

          try {
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
                aiEvaluationFailed = true
              }
            } else {
              aiEvaluationFailed = true
              const errorText = await resp.text()
              console.error("[OpenAI API Error]", {
                attemptId,
                questionId: question.id,
                status: resp.status,
                statusText: resp.statusText,
                response: errorText.substring(0, 500),
              })
            }
          } catch (fetchError: any) {
            aiEvaluationFailed = true
            console.error("[OpenAI Fetch Error]", {
              attemptId,
              questionId: question.id,
              errorType: fetchError?.name,
              errorMessage: fetchError?.message,
            })
          }

          // If AI evaluation failed, use fallback and notify admin
          if (aiEvaluationFailed) {
            console.warn("[AI Evaluation Fallback]", {
              attemptId,
              questionId: question.id,
              studentId,
              questionMarks,
              message: "OpenAI evaluation failed, using word-similarity fallback",
            })

            // Send notification to admin
            try {
              const adminEmail = process.env.SMTP_USER || "support@lernen-hub.com"
              const subject = "[HubX] TEXT Question Evaluation Failed"
              const html = `
                <p>OpenAI API evaluation failed for a TEXT type question.</p>
                <ul>
                  <li><strong>Attempt ID:</strong> ${attemptId}</li>
                  <li><strong>Question ID:</strong> ${question.id}</li>
                  <li><strong>Student ID:</strong> ${studentId}</li>
                  <li><strong>Max Marks:</strong> ${questionMarks}</li>
                  <li><strong>Student Answer:</strong> ${String(answer.answerText).substring(0, 200)}...</li>
                </ul>
                <p>The answer has been evaluated using a fallback word-similarity algorithm. Please review manually if needed.</p>
              `
              await sendEmail({ to: adminEmail, subject, html })
            } catch (emailError) {
              console.error("[Notification Error] Failed to send admin email", emailError)
            }

            // Use fallback word-similarity scoring
            const sol = (question.solutionText || "").toLowerCase()
            const ans = String(answer.answerText).toLowerCase()
            const solWords = sol.split(/\s+/).filter(Boolean)
            const common = solWords.filter((w) => ans.includes(w)).length
            const score = solWords.length > 0 ? common / solWords.length : 0
            marksObtained = Math.round(Math.min(questionMarks, Math.max(0, score * questionMarks)))
            isCorrect = marksObtained >= 1
          }
        }
      } catch (e) {
        // Catch any unexpected errors and use fallback
        console.error("[TEXT Evaluation Unexpected Error]", {
          attemptId,
          questionId: question.id,
          error: (e as any)?.message,
        })
        // Keep marksObtained as 0, will be caught as fallback above
      }
    }

    // Handle FILL_IN_THE_BLANKS - Two modes:
    // Mode 1: Free Text (no options) - Student types answer, marked as PENDING_REVIEW
    // Mode 2: Pipe-Separated Multiple Blanks (with options) - Auto-graded
    //
    // Example of Mode 2:
    // Question: "The brain is the _____ and performs all _____ operations."
    // Correct: [["CPU", "cpu"], ["processing", "Processing"]]
    // Student: "CPU|Processing"
    // Result: Both match (case insensitive) → Correct ✅
    if (question.type === "FILL_IN_THE_BLANKS" && answer.answerText !== undefined && answer.answerText !== null) {
      const hasOptions = Array.isArray(question.options) && question.options.length > 0

      if (!hasOptions) {
        // MODE 1: Free text entry - no options provided by teacher
        // Verification: Mark as pending review since manual verification is needed
        isCorrect = null // Unknown until teacher reviews
        marksObtained = 0 // No marks until verified
      } else {
        // MODE 2: Pipe-separated format with multiple correct answers per blank
        // Each element in options array is an array of acceptable answers for that blank
        const studentParts = String(answer.answerText).split("|").map((s) => s.trim())
        const correctArrays: any = question.options || []

        let allMatched = true

        if (!Array.isArray(correctArrays) || correctArrays.length === 0) {
          allMatched = false
        } else {
          // Check each blank against its corresponding correct answers
          for (let i = 0; i < correctArrays.length; i++) {
            const possibleAnswers = Array.isArray(correctArrays[i]) ? correctArrays[i] : []
            const studentAns = studentParts[i] ?? ""

            // Check if student's answer matches ANY of the possible correct answers
            const matched = possibleAnswers.some((ans: any) => {
              if (typeof ans !== "string") return false
              if (question.caseSensitive) {
                return ans.trim() === studentAns
              }
              // Case-insensitive comparison (default)
              return ans.trim().toLowerCase() === studentAns.trim().toLowerCase()
            })

            if (!matched) {
              allMatched = false
              break // If any blank doesn't match, entire answer is wrong
            }
          }
        }

        isCorrect = allMatched
        marksObtained = isCorrect ? questionMarks : 0
      }
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

    // Log answer result
    console.log(`[Answer Saved] Question Type: ${question.type}`, {
      questionId,
      isCorrect,
      marksObtained,
      attemptId,
      questionType: question.type,
      answerProvided: !!answer.answerText || answer.selectedOption !== undefined,
    })

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
   * Uses database transaction for atomicity
   */
  private async calculateAndSubmitExam(
    attemptId: string,
    studentId: string,
    isAutoSubmit: boolean = false
  ) {
    // Fetch data first (outside transaction)
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

    try {
      // Use transaction to ensure atomic updates
      const submittedAttempt = await prisma.$transaction(async (tx) => {
        // Update attempt with calculated scores
        const updated = await tx.examAttempt.update({
          where: { id: attemptId },
          data: {
            status: isAutoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
            submittedAt: new Date(),
            totalScore,
            percentage,
            timeSpent,
          },
        })

        // Update paper statistics (aggregated) within same transaction
        const allAttempts = await tx.examAttempt.findMany({
          where: {
            paperId: attempt.paperId,
            status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] }
          },
        })

        const averageScore =
          allAttempts.length > 0 ? allAttempts.reduce((sum, a) => sum + a.totalScore, 0) / allAttempts.length : 0

        await tx.paper.update({
          where: { id: attempt.paperId },
          data: {
            totalAttempts: allAttempts.length,
            averageScore,
          },
        })

        return updated
      })

      // Clear Redis timer (outside transaction, non-critical)
      const timerKey = `timer:${attemptId}`
      await redis.del(timerKey).catch(() => { }) // Fail silently if key doesn't exist

      // PERFORMANCE: Invalidate rankings cache since scores have changed (non-critical)
      studentService.invalidateRankingsCache().catch((err) => {
        console.error("Failed to invalidate rankings cache:", err)
      })

      console.log(`[Exam Submission] Successfully submitted attempt ${attemptId} with score ${totalScore}/${attempt.totalMarks}`)

      return submittedAttempt
    } catch (error) {
      console.error(`[Exam Submission] Transaction failed for attempt ${attemptId}:`, error)
      throw new AppError(500, "Failed to submit exam. Please try again.")
    }
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

    const submittedAttempt = await this.calculateAndSubmitExam(attemptId, studentId, false)

    // Fetch enriched result data for immediate frontend display
    const answers = await prisma.studentAnswer.findMany({
      where: { attemptId },
      include: { question: true },
    })

    const totalQuestions = await prisma.question.count({
      where: { paperId: attempt.paperId },
    })

    const answeredCount = answers.filter(
      (a) => a.selectedOption !== null || (a.answerText !== null && String(a.answerText).trim() !== "")
    ).length
    const correctCount = answers.filter((a) => a.isCorrect === true).length
    const incorrectCount = answers.filter((a) => a.isCorrect === false).length

    return {
      ...submittedAttempt,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unanswered: Math.max(0, totalQuestions - answeredCount),
      totalQuestions,
    }
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
    if (attempt.status === "ONGOING" && attempt.paper.type === "TIME_BOUND" && !attempt.noTimeLimit) {
      const timerKey = `timer:${attemptId}`
      const timerData = await redis.get(timerKey)
      if (timerData) {
        const timer = JSON.parse(timerData)
        timeRemaining = Math.ceil((timer.endTime - Date.now()) / 1000)
      }
    }

    return {
      attempt: {
        id: attempt.id,
        paperId: attempt.paperId,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        totalScore: attempt.totalScore,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        answers: attempt.answers,
        // Return test settings to frontend
        noTimeLimit: attempt.noTimeLimit,
        showAnswerAfterWrong: attempt.showAnswerAfterWrong,
        enableSolutionView: attempt.enableSolutionView,
      },
      paper: {
        id: attempt.paper.id,
        title: attempt.paper.title,
        type: attempt.paper.type,
        duration: attempt.paper.duration,
        status: attempt.paper.status,
        questions: attempt.paper.questions.map(q => ({
          id: q.id,
          type: q.type,
          difficulty: q.difficulty,
          questionText: q.questionText,
          questionImage: q.questionImage,
          options: q.options || [],
          marks: q.marks,
          order: q.order,
        })),
      },
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
      options: (question.type === "MCQ" || question.type === "FILL_IN_THE_BLANKS") ? question.options : null,
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
      options: (question.type === "MCQ" || question.type === "FILL_IN_THE_BLANKS") ? question.options : null,
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
    const detailedAnswers = attempt.answers.map((answer) => {
      // Determine correct answer display based on question type
      let correctAnswer: any
      if (answer.question.type === "MCQ") {
        correctAnswer = answer.question.correctOption
      } else if (answer.question.type === "FILL_IN_THE_BLANKS" && answer.question.options && Array.isArray(answer.question.options) && answer.question.options.length > 0) {
        // For FILL_IN_THE_BLANKS with options, show the correct option index
        correctAnswer = answer.question.correctOption
      } else {
        // For free text or TEXT questions, show solution
        correctAnswer = answer.question.solutionText
      }

      return {
        questionId: answer.questionId,
        questionNumber: questionIndexMap[answer.questionId] || null,
        questionText: answer.question.questionText,
        questionImage: answer.question.questionImage,
        type: answer.question.type,
        difficulty: answer.question.difficulty,
        marks: answer.question.marks,
        studentAnswer:
          answer.selectedOption !== null && answer.selectedOption !== undefined ? answer.selectedOption : answer.answerText,
        correctAnswer: correctAnswer,
        isCorrect: answer.isCorrect,
        marksObtained: typeof answer.marksObtained === "number" ? answer.marksObtained : answer.isCorrect ? answer.question.marks : 0,
        markedForReview: answer.markedForReview,
        status: answer.isCorrect === null ? "PENDING_REVIEW" : answer.isCorrect ? "CORRECT" : "INCORRECT",
      }
    })

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
