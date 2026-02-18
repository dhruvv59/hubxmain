import { Request, Response } from "express"
import { chatService } from "./chat.service"
import { AuthRequest } from "@middlewares/auth"

export class ChatController {
    /**
     * Get or create chat room for a paper
     * GET /api/chat/rooms/:paperId
     */
    async getChatRoom(req: AuthRequest, res: Response) {
        try {
            const { paperId } = req.params
            const userId = req.user!.userId
            const userRole = req.user!.role

            const chatRoom = await chatService.getChatRoom(paperId, userId, userRole)

            res.json({
                success: true,
                data: chatRoom,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get messages for a paper with role-based filtering and pagination
     * GET /api/chat/messages/:paperId?limit=20&offset=0
     */
    async getMessages(req: AuthRequest, res: Response) {
        try {
            const { paperId } = req.params
            const userId = req.user!.userId
            const userRole = req.user!.role
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100) // Max 100
            const offset = parseInt(req.query.offset as string) || 0

            const { messages, totalCount, hasMore } = await chatService.getMessages(
                paperId,
                userId,
                userRole,
                limit,
                offset
            )

            // Transform data to match frontend expectations
            const transformedMessages = messages.map((msg: any) => ({
                id: msg.id,
                content: msg.message, // Convert 'message' to 'content'
                senderId: msg.senderId,
                createdAt: msg.createdAt,
                isRead: msg.isRead,
                sender: {
                    name: `${msg.sender.firstName} ${msg.sender.lastName}`.trim(),
                    avatar: undefined,
                },
            }))

            res.json({
                success: true,
                data: transformedMessages,
                pagination: {
                    totalCount,
                    limit,
                    offset,
                    hasMore,
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
     * Send a message
     * POST /api/chat/messages
     * Body: { paperId, message, receiverId? }
     */
    async sendMessage(req: AuthRequest, res: Response) {
        try {
            const { paperId, message, receiverId } = req.body
            const userId = req.user!.userId
            const userRole = req.user!.role

            if (!paperId || !message) {
                return res.status(400).json({
                    success: false,
                    message: "paperId and message are required",
                })
            }

            const chatMessage = await chatService.sendMessage(
                paperId,
                userId,
                userRole,
                message,
                receiverId,
            )

            // Transform data to match frontend expectations
            const transformedMessage = {
                id: chatMessage.id,
                content: chatMessage.message, // Convert 'message' to 'content'
                senderId: chatMessage.senderId,
                createdAt: chatMessage.createdAt,
                isRead: chatMessage.isRead,
                sender: {
                    name: `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`.trim(),
                    avatar: undefined,
                },
            }

            res.status(201).json({
                success: true,
                data: transformedMessage,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get unread message count
     * GET /api/chat/unread/:paperId
     */
    async getUnreadCount(req: AuthRequest, res: Response) {
        try {
            const { paperId } = req.params
            const userId = req.user!.userId
            const userRole = req.user!.role

            const count = await chatService.getUnreadCount(paperId, userId, userRole)

            res.json({
                success: true,
                data: { unreadCount: count },
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Mark messages as read for a paper/room
     * PUT /api/chat/rooms/:paperId/mark-read
     */
    async markRoomMessagesAsRead(req: AuthRequest, res: Response) {
        try {
            const { paperId } = req.params
            const userId = req.user!.userId

            await chatService.markRoomMessagesAsRead(paperId, userId)

            res.json({
                success: true,
                message: "Messages marked as read",
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Mark message as read
     * PUT /api/chat/messages/:messageId/read
     */
    async markAsRead(req: AuthRequest, res: Response) {
        try {
            const { messageId } = req.params
            const userId = req.user!.userId

            const message = await chatService.markAsRead(messageId, userId)

            res.json({
                success: true,
                data: message,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    /**
     * Get all chat rooms for current user
     * GET /api/chat/rooms
     */
    async getChatRooms(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId
            const userRole = req.user!.role

            let chatRooms

            if (userRole === "TEACHER") {
                chatRooms = await chatService.getTeacherChatRooms(userId)
            } else {
                chatRooms = await chatService.getStudentChatRooms(userId)
            }

            // Get unread counts for each room
            const transformedRooms = await Promise.all(
                chatRooms.map(async (room: any) => {
                    const unreadCount = await chatService.getUnreadCount(
                        room.paperId,
                        userId,
                        userRole
                    );
                    return {
                        id: room.id,
                        paperId: room.paperId,
                        paperTitle: room.paper?.title || "Untitled",
                        lastMessage: room.messages[0]?.message || undefined,
                        lastMessageAt: room.messages[0]?.createdAt || undefined,
                        unreadCount,
                    };
                })
            )

            res.json({
                success: true,
                data: transformedRooms,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }
}

export const chatController = new ChatController()
