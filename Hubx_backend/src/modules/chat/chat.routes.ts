import { Router } from "express"
import { chatController } from "./chat.controller"
import { authenticate } from "@middlewares/auth"

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get all chat rooms for current user
router.get("/rooms", chatController.getChatRooms.bind(chatController))

// Get or create chat room for a paper
router.get("/rooms/:paperId", chatController.getChatRoom.bind(chatController))

// Mark all messages in room as read
router.put("/rooms/:paperId/mark-read", chatController.markRoomMessagesAsRead.bind(chatController))

// Get messages for a paper
router.get("/messages/:paperId", chatController.getMessages.bind(chatController))

// Send a message
router.post("/messages", chatController.sendMessage.bind(chatController))

// Get unread message count
router.get("/unread/:paperId", chatController.getUnreadCount.bind(chatController))

// Mark message as read
router.put("/messages/:messageId/read", chatController.markAsRead.bind(chatController))

export default router
