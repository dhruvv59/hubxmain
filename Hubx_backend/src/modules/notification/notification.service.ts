import prisma from "@config/database"
import { AppError } from "@utils/errors"

interface GetNotificationsOptions {
  page: number
  limit: number
  unreadOnly: boolean
}

interface CreateNotificationData {
  userId: string
  title: string
  message: string
  type: string
  actionUrl?: string
}

export class NotificationService {
  /**
   * Get user's notifications with pagination and filters
   */
  async getNotifications(userId: string, options: GetNotificationsOptions) {
    const { page, limit, unreadOnly } = options
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = { userId }
    if (unreadOnly) {
      whereClause.isRead = false
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Get total count
    const total = await prisma.notification.count({
      where: whereClause,
    })

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string) {
    // Total notifications
    const total = await prisma.notification.count({
      where: { userId },
    })

    // Unread count
    const unread = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    // Group by type
    const byTypeData = await prisma.notification.groupBy({
      by: ["type"],
      where: { userId },
      _count: { id: true },
    })

    const byType = byTypeData.reduce(
      (acc, item) => {
        acc[item.type] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    // Today's notifications (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const todayCount = await prisma.notification.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    })

    // Week's notifications (last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weekCount = await prisma.notification.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
    })

    return {
      total,
      unread,
      byType,
      todayCount,
      weekCount,
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new AppError(404, "Notification not found")
    }

    // Verify ownership
    if (notification.userId !== userId) {
      throw new AppError(403, "Access denied")
    }

    return notification
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string) {
    // First verify ownership
    await this.getNotificationById(id, userId)

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return notification
  }

  /**
   * Mark all user's notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return {
      updatedCount: result.count,
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId: string) {
    // First verify ownership
    await this.getNotificationById(id, userId)

    await prisma.notification.delete({
      where: { id },
    })
  }

  /**
   * Create notification (Admin/System use)
   */
  async createNotification(data: CreateNotificationData) {
    const { userId, title, message, type, actionUrl } = data

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, "User not found")
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl: actionUrl || null,
      },
    })

    return notification
  }

  /**
   * Bulk create notifications for multiple users
   * Useful for system-wide announcements
   */
  async createBulkNotifications(
    userIds: string[],
    data: Omit<CreateNotificationData, "userId">
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      actionUrl: data.actionUrl || null,
    }))

    const result = await prisma.notification.createMany({
      data: notifications,
    })

    return {
      createdCount: result.count,
    }
  }
}

export const notificationService = new NotificationService()
