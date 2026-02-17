import { Request, Response } from "express"
import { doubtService } from "./doubt.service"

export class DoubtController {
    /**
     * Get all doubts for a paper
     */
    async getAllDoubts(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const teacherId = (req as any).user.userId
            const resolved = req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : undefined

            const result = await doubtService.getAllDoubtsForPaper(paperId, teacherId, resolved)

            // Transform doubts to match frontend interface
            const transformedDoubts = result.doubts.map((doubt: any) => ({
                id: doubt.id,
                studentId: doubt.studentId,
                questionId: doubt.questionId,
                paperId: paperId,
                content: doubt.doubtText,
                status: doubt.isResolved ? "RESOLVED" : "OPEN",
                createdAt: doubt.createdAt.toISOString(),
                student: {
                    name: `${doubt.student.firstName} ${doubt.student.lastName}`,
                },
                replies: doubt.teacherReply ? [{
                    id: `${doubt.id}-reply`,
                    doubtId: doubt.id,
                    teacherId: doubt.repliedBy || "",
                    content: doubt.teacherReply,
                    createdAt: doubt.repliedAt?.toISOString() || "",
                    teacher: doubt.teacher ? {
                        name: `${doubt.teacher.firstName} ${doubt.teacher.lastName}`,
                    } : { name: "" },
                }] : [],
            }))

            res.json({
                success: true,
                data: transformedDoubts,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get doubts for a specific question
     */
    async getQuestionDoubts(req: Request, res: Response) {
        try {
            const { questionId } = req.params
            const teacherId = (req as any).user.userId

            const result = await doubtService.getQuestionDoubts(questionId, teacherId)

            // Transform doubts to match frontend interface
            const transformedDoubts = result.doubts.map((doubt: any) => ({
                id: doubt.id,
                studentId: doubt.studentId,
                questionId: doubt.questionId,
                paperId: doubt.attempt.paperId,
                content: doubt.doubtText,
                status: doubt.isResolved ? "RESOLVED" : "OPEN",
                createdAt: doubt.createdAt.toISOString(),
                student: {
                    name: `${doubt.student.firstName} ${doubt.student.lastName}`,
                },
                replies: doubt.teacherReply ? [{
                    id: `${doubt.id}-reply`,
                    doubtId: doubt.id,
                    teacherId: doubt.repliedBy || "",
                    content: doubt.teacherReply,
                    createdAt: doubt.repliedAt?.toISOString() || "",
                    teacher: doubt.teacher ? {
                        name: `${doubt.teacher.firstName} ${doubt.teacher.lastName}`,
                    } : { name: "" },
                }] : [],
            }))

            res.json({
                success: true,
                data: {
                    ...result,
                    doubts: transformedDoubts,
                },
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Reply to a doubt
     */
    async replyToDoubt(req: Request, res: Response) {
        try {
            const { doubtId } = req.params
            const { content, reply } = req.body
            const replyText = content || reply
            const teacherId = (req as any).user.userId

            if (!replyText || replyText.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Reply text is required",
                })
            }

            const result = await doubtService.replyToDoubt(doubtId, teacherId, replyText)

            // Transform to frontend interface
            const transformedReply = {
                id: `${result.id}-reply`,
                doubtId: result.id,
                teacherId: result.repliedBy || "",
                content: result.teacherReply,
                createdAt: result.repliedAt?.toISOString() || "",
                teacher: result.teacher ? {
                    name: `${result.teacher.firstName} ${result.teacher.lastName}`,
                } : { name: "" },
            }

            res.json({
                success: true,
                message: "Reply sent successfully",
                data: transformedReply,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get doubt statistics
     */
    async getDoubtStats(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const teacherId = (req as any).user.userId

            const result = await doubtService.getDoubtStatistics(paperId, teacherId)

            res.json({
                success: true,
                data: result,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get question difficulty statistics
     */
    async getDifficultyStats(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const teacherId = (req as any).user.userId

            const result = await doubtService.getDifficultyStatistics(paperId, teacherId)

            res.json({
                success: true,
                data: result,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }
}

export const doubtController = new DoubtController()
