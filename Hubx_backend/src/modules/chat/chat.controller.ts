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
     * Get messages for a paper with role-based filtering
     * GET /api/chat/messages/:paperId
     */
    async getMessages(req: AuthRequest, res: Response) {
        try {
            const { paperId } = req.params
            const userId = req.user!.userId
            const userRole = req.user!.role

            const messages = await chatService.getMessages(paperId, userId, userRole)

            res.json({
                success: true,
                data: messages,
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

            res.status(201).json({
                success: true,
                data: chatMessage,
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

            res.json({
                success: true,
                data: chatRooms,
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
