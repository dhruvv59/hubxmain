import prisma from "@config/database"
import { AppError } from "@utils/errors"

export class DoubtService {
    /**
     * Get all doubts for a paper (teacher view)
     */
    async getAllDoubtsForPaper(paperId: string, teacherId: string, resolved?: boolean) {
        // Verify teacher owns the paper
        const paper = await prisma.paper.findFirst({
            where: { id: paperId, teacherId },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found or you don't have access")
        }

        // Build where clause
        const whereClause: any = {
            attempt: {
                paperId,
            },
        }

        if (resolved !== undefined) {
            whereClause.isResolved = resolved
        }

        // Get all doubts for this paper
        const doubts = await prisma.doubt.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                question: {
                    select: {
                        id: true,
                        questionText: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                attempt: {
                    select: {
                        id: true,
                        startedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Get counts
        const totalDoubts = await prisma.doubt.count({
            where: {
                attempt: {
                    paperId,
                },
            },
        })

        const resolvedDoubts = await prisma.doubt.count({
            where: {
                attempt: {
                    paperId,
                },
                isResolved: true,
            },
        })

        return {
            totalDoubts,
            resolvedDoubts,
            unresolvedDoubts: totalDoubts - resolvedDoubts,
            doubts,
        }
    }

    /**
     * Get all doubts for a specific question
     */
    async getQuestionDoubts(questionId: string, teacherId: string) {
        // Verify teacher owns the question's paper
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                paper: true,
            },
        })

        if (!question) {
            throw new AppError(404, "Question not found")
        }

        if (question.paper.teacherId !== teacherId) {
            throw new AppError(403, "You don't have access to this question")
        }

        const doubts = await prisma.doubt.findMany({
            where: { questionId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                attempt: {
                    select: {
                        id: true,
                        paperId: true,
                        startedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return {
            question: {
                id: question.id,
                questionText: question.questionText,
            },
            totalDoubts: doubts.length,
            resolvedDoubts: doubts.filter((d) => d.isResolved).length,
            doubts,
        }
    }

    /**
     * Reply to a student doubt
     */
    async replyToDoubt(doubtId: string, teacherId: string, reply: string) {
        // Get doubt with paper info
        const doubt = await prisma.doubt.findUnique({
            where: { id: doubtId },
            include: {
                question: {
                    include: {
                        paper: true,
                    },
                },
            },
        })

        if (!doubt) {
            throw new AppError(404, "Doubt not found")
        }

        // Verify teacher owns the paper
        if (doubt.question.paper.teacherId !== teacherId) {
            throw new AppError(403, "You don't have access to this doubt")
        }

        // Update doubt with reply
        const updatedDoubt = await prisma.doubt.update({
            where: { id: doubtId },
            data: {
                teacherReply: reply,
                repliedAt: new Date(),
                repliedBy: teacherId,
                isResolved: true,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                question: {
                    select: {
                        id: true,
                        questionText: true,
                    },
                },
            },
        })

        return updatedDoubt
    }

    /**
     * Get doubt statistics for a paper
     */
    async getDoubtStatistics(paperId: string, teacherId: string) {
        // Verify teacher owns the paper
        const paper = await prisma.paper.findFirst({
            where: { id: paperId, teacherId },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found or you don't have access")
        }

        // Get total counts
        const totalDoubts = await prisma.doubt.count({
            where: {
                attempt: {
                    paperId,
                },
            },
        })

        const resolvedDoubts = await prisma.doubt.count({
            where: {
                attempt: {
                    paperId,
                },
                isResolved: true,
            },
        })

        // Get doubts grouped by question
        const doubtsByQuestion = await prisma.doubt.groupBy({
            by: ["questionId"],
            where: {
                attempt: {
                    paperId,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
        })

        // Get question details for each group
        const doubtsByQuestionWithDetails = await Promise.all(
            doubtsByQuestion.map(async (group) => {
                const question = await prisma.question.findUnique({
                    where: { id: group.questionId },
                    select: {
                        id: true,
                        questionText: true,
                    },
                })

                const resolvedCount = await prisma.doubt.count({
                    where: {
                        questionId: group.questionId,
                        isResolved: true,
                    },
                })

                return {
                    questionId: group.questionId,
                    questionText: question?.questionText || "Unknown",
                    doubtCount: group._count.id,
                    resolvedCount,
                    unresolvedCount: group._count.id - resolvedCount,
                }
            }),
        )

        // Get recent doubts
        const recentDoubts = await prisma.doubt.findMany({
            where: {
                attempt: {
                    paperId,
                },
            },
            take: 10,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                question: {
                    select: {
                        questionText: true,
                    },
                },
            },
        })

        return {
            totalDoubts,
            resolvedDoubts,
            unresolvedDoubts: totalDoubts - resolvedDoubts,
            doubtsByQuestion: doubtsByQuestionWithDetails,
            recentDoubts: recentDoubts.map((d) => ({
                id: d.id,
                studentName: `${d.student.firstName} ${d.student.lastName}`,
                questionText: d.question.questionText.substring(0, 100) + "...",
                doubtText: d.doubtText.substring(0, 100) + "...",
                isResolved: d.isResolved,
                createdAt: d.createdAt,
            })),
        }
    }

    /**
     * Get question difficulty statistics for a paper
     */
    async getDifficultyStatistics(paperId: string, teacherId: string) {
        // Verify teacher owns the paper
        const paper = await prisma.paper.findFirst({
            where: { id: paperId, teacherId },
            include: {
                questions: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found or you don't have access")
        }

        // Get total attempts
        const totalAttempts = await prisma.examAttempt.count({
            where: { paperId },
        })

        // Get difficulty stats for each question
        const questionDifficulty = await Promise.all(
            paper.questions.map(async (question, index) => {
                // Count how many students marked this as too hard
                const markedHardCount = await prisma.studentAnswer.count({
                    where: {
                        questionId: question.id,
                        markedTooHard: true,
                    },
                })

                // Get average score for this question
                const answers = await prisma.studentAnswer.findMany({
                    where: { questionId: question.id },
                    select: { marksObtained: true },
                })

                const averageScore =
                    answers.length > 0
                        ? answers.reduce((sum, a) => sum + a.marksObtained, 0) / answers.length
                        : 0

                // Calculate percentage
                const markedHardPercentage = totalAttempts > 0 ? (markedHardCount / totalAttempts) * 100 : 0

                return {
                    questionId: question.id,
                    questionNumber: index + 1,
                    questionText: question.questionText.substring(0, 100) + "...",
                    markedHardCount,
                    totalAttempts,
                    markedHardPercentage: Math.round(markedHardPercentage * 10) / 10,
                    averageScore: Math.round(averageScore * 10) / 10,
                    marks: question.marks,
                }
            }),
        )

        // Sort by difficulty (highest percentage first)
        const hardestQuestions = [...questionDifficulty]
            .sort((a, b) => b.markedHardPercentage - a.markedHardPercentage)
            .slice(0, 5)

        return {
            totalAttempts,
            questionDifficulty,
            hardestQuestions: hardestQuestions.map((q) => ({
                questionNumber: q.questionNumber,
                questionText: q.questionText,
                hardPercentage: q.markedHardPercentage,
                averageScore: q.averageScore,
                marks: q.marks,
            })),
        }
    }
}

export const doubtService = new DoubtService()
