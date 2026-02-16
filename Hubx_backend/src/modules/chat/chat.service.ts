import prisma from "@config/database"
import { AppError } from "@utils/errors"

export class ChatService {
    /**
     * Create a chat room for a paper (called automatically when paper is created)
     */
    async createChatRoom(paperId: string) {
        const paper = await prisma.paper.findUnique({
            where: { id: paperId },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found")
        }

        // Check if chat room already exists
        const existingRoom = await prisma.chatRoom.findUnique({
            where: { paperId },
        })

        if (existingRoom) {
            return existingRoom
        }

        const chatRoom = await prisma.chatRoom.create({
            data: {
                paperId,
            },
        })

        return chatRoom
    }

    /**
     * Get or create chat room for a paper
     */
    async getChatRoom(paperId: string, userId: string, userRole: string) {
        // Verify user has access to this paper
        const paper = await prisma.paper.findUnique({
            where: { id: paperId },
            include: {
                examAttempts: {
                    where: { studentId: userId },
                },
            },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found")
        }

        // Check access: teacher owns paper OR student has attempted it
        const hasAccess =
            (userRole === "TEACHER" && paper.teacherId === userId) ||
            (userRole === "STUDENT" && paper.examAttempts.length > 0)

        if (!hasAccess) {
            throw new AppError(403, "You don't have access to this chat room")
        }

        // Get or create chat room
        let chatRoom = await prisma.chatRoom.findUnique({
            where: { paperId },
            include: {
                paper: {
                    select: {
                        id: true,
                        title: true,
                        teacherId: true,
                    },
                },
            },
        })

        if (!chatRoom) {
            chatRoom = await prisma.chatRoom.create({
                data: { paperId },
                include: {
                    paper: {
                        select: {
                            id: true,
                            title: true,
                            teacherId: true,
                        },
                    },
                },
            })
        }

        return chatRoom
    }

    /**
     * Send a message in a chat room
     */
    async sendMessage(
        paperId: string,
        senderId: string,
        senderRole: string,
        message: string,
        receiverId?: string,
    ) {
        // Get chat room
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { paperId },
            include: { paper: true },
        })

        if (!chatRoom) {
            throw new AppError(404, "Chat room not found")
        }

        // Verify sender has access
        if (senderRole === "TEACHER" && chatRoom.paper.teacherId !== senderId) {
            throw new AppError(403, "You don't have access to this chat room")
        }

        if (senderRole === "STUDENT") {
            const attempt = await prisma.examAttempt.findUnique({
                where: { paperId_studentId: { paperId, studentId: senderId } },
            })
            if (!attempt) {
                throw new AppError(403, "You don't have access to this chat room")
            }
        }

        // Create message
        const chatMessage = await prisma.chatMessage.create({
            data: {
                roomId: chatRoom.id,
                senderId,
                receiverId: receiverId || null,
                message,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        })

        return chatMessage
    }

    /**
     * Get messages for a paper with role-based filtering
     * - Teachers see all messages
     * - Students see only their own messages and teacher's replies to them
     */
    async getMessages(paperId: string, userId: string, userRole: string) {
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { paperId },
            include: { paper: true },
        })

        if (!chatRoom) {
            throw new AppError(404, "Chat room not found")
        }

        // Verify access
        if (userRole === "TEACHER" && chatRoom.paper.teacherId !== userId) {
            throw new AppError(403, "You don't have access to this chat room")
        }

        if (userRole === "STUDENT") {
            const attempt = await prisma.examAttempt.findUnique({
                where: { paperId_studentId: { paperId, studentId: userId } },
            })
            if (!attempt) {
                throw new AppError(403, "You don't have access to this chat room")
            }
        }

        let messages

        if (userRole === "TEACHER") {
            // Teacher sees all messages in the room
            messages = await prisma.chatMessage.findMany({
                where: { roomId: chatRoom.id },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            })
        } else {
            // Student sees only:
            // 1. Their own messages
            // 2. Teacher's replies to them (receiverId = studentId)
            messages = await prisma.chatMessage.findMany({
                where: {
                    roomId: chatRoom.id,
                    OR: [
                        { senderId: userId }, // Student's own messages
                        {
                            // Teacher's replies to this student
                            senderId: chatRoom.paper.teacherId,
                            receiverId: userId,
                        },
                    ],
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            })
        }

        return messages
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId: string, userId: string) {
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
        })

        if (!message) {
            throw new AppError(404, "Message not found")
        }

        // Only the receiver can mark as read
        if (message.receiverId !== userId && message.senderId !== userId) {
            throw new AppError(403, "You cannot mark this message as read")
        }

        const updatedMessage = await prisma.chatMessage.update({
            where: { id: messageId },
            data: { isRead: true },
        })

        return updatedMessage
    }

    /**
     * Get unread message count for a user in a specific paper
     */
    async getUnreadCount(paperId: string, userId: string, userRole: string) {
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { paperId },
            include: { paper: true },
        })

        if (!chatRoom) {
            return 0
        }

        let unreadCount

        if (userRole === "TEACHER") {
            // Count unread messages from students
            unreadCount = await prisma.chatMessage.count({
                where: {
                    roomId: chatRoom.id,
                    senderId: { not: userId },
                    isRead: false,
                },
            })
        } else {
            // Count unread messages from teacher to this student
            unreadCount = await prisma.chatMessage.count({
                where: {
                    roomId: chatRoom.id,
                    receiverId: userId,
                    isRead: false,
                },
            })
        }

        return unreadCount
    }

    /**
     * Get all chat rooms for a teacher
     */
    async getTeacherChatRooms(teacherId: string) {
        const chatRooms = await prisma.chatRoom.findMany({
            where: {
                paper: {
                    teacherId,
                },
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: {
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        return chatRooms
    }

    /**
     * Get all chat rooms for a student
     */
    async getStudentChatRooms(studentId: string) {
        const attempts = await prisma.examAttempt.findMany({
            where: { studentId },
            select: { paperId: true },
        })

        const paperIds = attempts.map((a) => a.paperId)

        const chatRooms = await prisma.chatRoom.findMany({
            where: {
                paperId: { in: paperIds },
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    where: {
                        OR: [
                            { senderId: studentId },
                            { receiverId: studentId },
                        ],
                    },
                    include: {
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        return chatRooms
    }
}

export const chatService = new ChatService()
