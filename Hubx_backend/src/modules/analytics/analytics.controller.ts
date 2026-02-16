import type { Response } from "express"
import { analyticsService } from "./analytics.service"
import { sendResponse } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class AnalyticsController {
  getTeacherAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const analytics = await analyticsService.getTeacherAnalytics(req.user!.userId)
    sendResponse(res, 200, "Teacher analytics fetched successfully", analytics)
  })

  getStudentAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const analytics = await analyticsService.getStudentAnalytics(req.user!.userId)
    sendResponse(res, 200, "Student analytics fetched successfully", analytics)
  })

  getPaperAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params
    const analytics = await analyticsService.getPaperAnalytics(paperId, req.user!.userId, req.user!.role)
    sendResponse(res, 200, "Paper analytics fetched successfully", analytics)
  })
}

export const analyticsController = new AnalyticsController()
