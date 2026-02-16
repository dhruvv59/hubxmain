import { Server, Socket } from "socket.io"
import jwt from "jsonwebtoken"
import { chatService } from "./chat.service"
import prisma from "@config/database"

interface AuthenticatedSocket extends Socket {
    user?: {
        id: string
        role: string
        email: string
    }
}

export class SocketGateway {
    private io: Server

    constructor(io: Server) {
        this.io = io
        this.initialize()
    }

    private initialize() {
        // Authentication middleware
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1]

                if (!token) {
                    return next(new Error("Authentication error: No token provided"))
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
                socket.user = {
                    id: decoded.userId,  // Changed from decoded.id to decoded.userId
                    role: decoded.role,
                    email: decoded.email,
                }

                next()
            } catch (error) {
                next(new Error("Authentication error: Invalid token"))
            }
        })

        // Connection handler
        this.io.on("connection", (socket: AuthenticatedSocket) => {
            console.log(`User connected: ${socket.user?.id} (${socket.user?.role})`)

            // Join paper chat room
            socket.on("join_room", async (data: { paperId: string }) => {
                try {
                    const { paperId } = data
                    const userId = socket.user!.id
                    const userRole = socket.user!.role

                    // Verify access to chat room
                    await chatService.getChatRoom(paperId, userId, userRole)

                    // Join the room
                    socket.join(`paper:${paperId}`)

                    socket.emit("joined_room", {
                        success: true,
                        paperId,
                        message: "Successfully joined chat room",
                    })

                    console.log(`User ${userId} joined room: paper:${paperId}`)
                } catch (error: any) {
                    socket.emit("error", {
                        success: false,
                        message: error.message || "Failed to join room",
                    })
                }
            })

            // Leave paper chat room
            socket.on("leave_room", (data: { paperId: string }) => {
                const { paperId } = data
                socket.leave(`paper:${paperId}`)
                console.log(`User ${socket.user?.id} left room: paper:${paperId}`)
            })

            // Send message
            socket.on("send_message", async (data: { paperId: string; message: string; receiverId?: string }) => {
                try {
                    const { paperId, message, receiverId } = data
                    const userId = socket.user!.id
                    const userRole = socket.user!.role

                    // Save message to database
                    const chatMessage = await chatService.sendMessage(paperId, userId, userRole, message, receiverId)

                    // Get chat room to find teacher ID
                    const chatRoom = await prisma.chatRoom.findUnique({
                        where: { paperId },
                        include: { paper: true },
                    })

                    if (!chatRoom) {
                        throw new Error("Chat room not found")
                    }

                    const teacherId = chatRoom.paper.teacherId

                    // Emit to sender
                    socket.emit("message_sent", {
                        success: true,
                        data: chatMessage,
                    })

                    // Real-time message delivery based on role
                    if (userRole === "STUDENT") {
                        // Student sent a message - notify teacher
                        this.io.to(`paper:${paperId}`).except(socket.id).emit("receive_message", {
                            ...chatMessage,
                            isForMe: chatMessage.senderId !== userId, // Teacher receives it
                        })

                        // Send notification to teacher
                        this.io.to(`paper:${paperId}`).emit("message_notification", {
                            paperId,
                            senderId: userId,
                            senderName: `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`,
                            message: chatMessage.message,
                            timestamp: chatMessage.createdAt,
                        })
                    } else if (userRole === "TEACHER") {
                        // Teacher sent a reply - notify only the specific student
                        if (receiverId) {
                            // Private reply to specific student
                            this.io.to(`paper:${paperId}`).emit("receive_message", {
                                ...chatMessage,
                                isForMe: chatMessage.receiverId === userId || chatMessage.senderId === userId,
                            })

                            // Send notification to specific student
                            this.io.to(`paper:${paperId}`).emit("message_notification", {
                                paperId,
                                senderId: userId,
                                receiverId,
                                senderName: `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`,
                                message: chatMessage.message,
                                timestamp: chatMessage.createdAt,
                            })
                        } else {
                            // Broadcast to all in room
                            this.io.to(`paper:${paperId}`).except(socket.id).emit("receive_message", {
                                ...chatMessage,
                                isForMe: true,
                            })
                        }
                    }
                } catch (error: any) {
                    socket.emit("error", {
                        success: false,
                        message: error.message || "Failed to send message",
                    })
                }
            })

            // Typing indicator
            socket.on("typing", (data: { paperId: string; isTyping: boolean }) => {
                const { paperId, isTyping } = data
                const userId = socket.user!.id
                const userRole = socket.user!.role

                // Broadcast typing status to others in the room
                socket.to(`paper:${paperId}`).emit("user_typing", {
                    userId,
                    userRole,
                    isTyping,
                })
            })

            // Mark messages as read
            socket.on("mark_read", async (data: { messageId: string }) => {
                try {
                    const { messageId } = data
                    const userId = socket.user!.id

                    await chatService.markAsRead(messageId, userId)

                    socket.emit("marked_read", {
                        success: true,
                        messageId,
                    })
                } catch (error: any) {
                    socket.emit("error", {
                        success: false,
                        message: error.message || "Failed to mark as read",
                    })
                }
            })

            // Disconnect handler
            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.user?.id}`)
            })
        })
    }

    /**
     * Send notification to specific user
     */
    public sendNotificationToUser(userId: string, notification: any) {
        this.io.emit("notification", notification)
    }

    /**
     * Send message to specific room
     */
    public sendToRoom(roomId: string, event: string, data: any) {
        this.io.to(roomId).emit(event, data)
    }
}

export let socketGateway: SocketGateway

export const initializeSocketGateway = (io: Server) => {
    socketGateway = new SocketGateway(io)
    return socketGateway
}
