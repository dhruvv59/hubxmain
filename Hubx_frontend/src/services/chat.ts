import { http } from "@/lib/http-client";
import { CHAT_ENDPOINTS } from "@/lib/api-config";

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
    sender: {
        name: string;
        avatar?: string;
    };
}

export interface ChatRoom {
    id: string;
    paperId: string;
    paperTitle: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

export interface ChatRoomsResponse {
    success: boolean;
    data: ChatRoom[];
}

export interface ChatMessagesResponse {
    success: boolean;
    data: ChatMessage[];
}

export const chatService = {
    /**
     * Get all chat rooms for the user
     */
    getRooms: async () => {
        try {
            const response = await http.get<ChatRoomsResponse>(CHAT_ENDPOINTS.getRooms());
            return response.data;
        } catch (error) {
            console.error("[Chat] Failed to fetch rooms:", error);
            throw error;
        }
    },

    /**
     * Get a specific chat room by paper ID
     */
    getRoom: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: ChatRoom }>(
                CHAT_ENDPOINTS.getRoom(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[Chat] Failed to fetch room:", error);
            throw error;
        }
    },

    /**
     * Get messages for a specific paper/room
     */
    getMessages: async (paperId: string) => {
        try {
            const response = await http.get<ChatMessagesResponse>(
                CHAT_ENDPOINTS.getMessages(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[Chat] Failed to fetch messages:", error);
            throw error;
        }
    },

    /**
     * Send a message
     */
    sendMessage: async (paperId: string, content: string) => {
        try {
            const response = await http.post<any>(CHAT_ENDPOINTS.sendMessage(), {
                paperId,
                content
            });
            return response;
        } catch (error) {
            console.error("[Chat] Failed to send message:", error);
            throw error;
        }
    },

    /**
     * Get unread message count for a paper
     */
    getUnreadCount: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: { count: number } }>(
                CHAT_ENDPOINTS.getUnreadCount(paperId)
            );
            return response.data.count;
        } catch (error) {
            console.error("[Chat] Failed to fetch unread count:", error);
            return 0;
        }
    },

    /**
     * Mark a message as read
     */
    markAsRead: async (messageId: string) => {
        try {
            await http.put(CHAT_ENDPOINTS.markAsRead(messageId));
        } catch (error) {
            console.error("[Chat] Failed to mark as read:", error);
        }
    }
};
