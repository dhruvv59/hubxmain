import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

let socket: Socket | null = null;

export const socketService = {
    /**
     * Initialize and connect to the WebSocket server
     */
    connect: (token: string): Socket => {
        if (socket && socket.connected) {
            return socket;
        }

        socket = io(API_URL, {
            auth: {
                token: `Bearer ${token}`,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
            console.log("✅ [Socket] Connected to chat server");
        });

        socket.on("disconnect", () => {
            console.log("❌ [Socket] Disconnected from chat server");
        });

        socket.on("error", (error) => {
            console.error("⚠️ [Socket] Error:", error);
        });

        return socket;
    },

    /**
     * Emit an event to the server
     */
    emit: (event: string, data?: any): void => {
        if (!socket || !socket.connected) {
            console.warn(`[Socket] Not connected. Cannot emit "${event}"`);
            return;
        }
        socket.emit(event, data);
    },

    /**
     * Listen for an event from the server
     */
    on: (event: string, callback: (data?: any) => void): void => {
        if (!socket) {
            console.warn(`[Socket] Socket not initialized. Cannot listen for "${event}"`);
            return;
        }
        socket.on(event, callback);
    },

    /**
     * Listen for an event only once
     */
    once: (event: string, callback: (data?: any) => void): void => {
        if (!socket) {
            console.warn(`[Socket] Socket not initialized. Cannot listen for "${event}"`);
            return;
        }
        socket.once(event, callback);
    },

    /**
     * Stop listening for an event
     */
    off: (event: string, callback?: (data?: any) => void): void => {
        if (!socket) return;
        if (callback) {
            socket.off(event, callback);
        } else {
            socket.off(event);
        }
    },

    /**
     * Disconnect from the server
     */
    disconnect: (): void => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    /**
     * Get the current socket instance
     */
    getSocket: (): Socket | null => {
        return socket;
    },

    /**
     * Check if connected
     */
    isConnected: (): boolean => {
        return socket?.connected || false;
    },

    /**
     * Join a chat room
     */
    joinRoom: (paperId: string): void => {
        socketService.emit("join_room", { paperId });
    },

    /**
     * Leave a chat room
     */
    leaveRoom: (paperId: string): void => {
        socketService.emit("leave_room", { paperId });
    },

    /**
     * Send a message
     */
    sendMessage: (paperId: string, content: string): void => {
        socketService.emit("send_message", { paperId, content });
    },

    /**
     * Notify that user is typing
     */
    notifyTyping: (paperId: string): void => {
        socketService.emit("user_typing", { paperId });
    },

    /**
     * Listen for new messages
     */
    onReceiveMessage: (callback: (message: any) => void): void => {
        socketService.on("receive_message", callback);
    },

    /**
     * Listen for user typing indicators
     */
    onUserTyping: (callback: (data: any) => void): void => {
        socketService.on("user_is_typing", callback);
    },

    /**
     * Listen for room joined event
     */
    onJoinedRoom: (callback: (data: any) => void): void => {
        socketService.on("joined_room", callback);
    },

    /**
     * Stop listening for new messages
     */
    offReceiveMessage: (): void => {
        socketService.off("receive_message");
    },

    /**
     * Stop listening for typing indicators
     */
    offUserTyping: (): void => {
        socketService.off("user_is_typing");
    },
};
