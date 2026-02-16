import prisma from "@config/database"

export class NotificationService {
    async getNotifications(userId: string, limit = 10) {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        })

        return notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            createdAt: n.createdAt,
            actionUrl: n.actionUrl,
        }))
    }

    async markAsRead(notificationId: string, userId: string) {
        return prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true },
        })
    }
}

export const notificationService = new NotificationService()
