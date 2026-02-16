import type { Response } from "express"
import { notificationService } from "./notification.service"
import { sendResponse } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"
import { AppError } from "@utils/errors"

export class NotificationController {
  /**
   * GET /api/notifications
   * Get user's notifications with pagination and filters
   */
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const unreadOnly = req.query.unreadOnly === "true"

    const result = await notificationService.getNotifications(userId, {
      page,
      limit,
      unreadOnly,
    })

    sendResponse(res, 200, "Notifications fetched successfully", result)
  })

  /**
   * GET /api/notifications/stats
   * Get notification statistics
   */
  getNotificationStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId
    const stats = await notificationService.getNotificationStats(userId)
    sendResponse(res, 200, "Notification stats fetched successfully", stats)
  })

  /**
   * GET /api/notifications/:id
   * Get specific notification by ID
   */
  getNotificationById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user!.userId

    const notification = await notificationService.getNotificationById(id, userId)
    sendResponse(res, 200, "Notification fetched successfully", notification)
  })

  /**
   * PATCH /api/notifications/:id/read
   * Mark notification as read
   */
  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user!.userId

    const notification = await notificationService.markAsRead(id, userId)
    sendResponse(res, 200, "Notification marked as read", notification)
  })

  /**
   * PATCH /api/notifications/mark-all-read
   * Mark all user's notifications as read
   */
  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId

    const result = await notificationService.markAllAsRead(userId)
    sendResponse(res, 200, "All notifications marked as read", result)
  })

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user!.userId

    await notificationService.deleteNotification(id, userId)
    sendResponse(res, 200, "Notification deleted successfully", null)
  })

  /**
   * POST /api/notifications
   * Create notification (Admin/Teacher only)
   */
  createNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId, title, message, type, actionUrl } = req.body

    // Validation
    if (!userId || !title || !message || !type) {
      throw new AppError(400, "userId, title, message, and type are required")
    }

    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      actionUrl,
    })

    sendResponse(res, 201, "Notification created successfully", notification)
  })
}

export const notificationController = new NotificationController()
