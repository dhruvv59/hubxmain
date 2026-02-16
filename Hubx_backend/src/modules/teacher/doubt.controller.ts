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
     * Get doubts for a specific question
     */
    async getQuestionDoubts(req: Request, res: Response) {
        try {
            const { questionId } = req.params
            const teacherId = (req as any).user.userId

            const result = await doubtService.getQuestionDoubts(questionId, teacherId)

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
     * Reply to a doubt
     */
    async replyToDoubt(req: Request, res: Response) {
        try {
            const { doubtId } = req.params
            const { reply } = req.body
            const teacherId = (req as any).user.userId

            if (!reply || reply.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Reply text is required",
                })
            }

            const result = await doubtService.replyToDoubt(doubtId, teacherId, reply)

            res.json({
                success: true,
                message: "Reply sent successfully",
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
