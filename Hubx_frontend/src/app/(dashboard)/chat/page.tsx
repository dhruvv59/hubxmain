"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Search,
    MessageSquare,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Smile,
    Send,
    Check,
    CheckCheck,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatService, ChatRoom, ChatMessage } from "@/services/chat";
import { socketService } from "@/services/socket-service";
import { getCurrentUser } from "@/services/auth";
import { getAccessToken } from "@/lib/http-client";

export default function ChatPage() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Initialize: Load rooms and connect to socket
    useEffect(() => {
        loadRooms();
        fetchCurrentUser();
        initializeSocket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // WebSocket: Listen for real-time messages and room changes
    useEffect(() => {
        if (!selectedRoom || !isSocketConnected) return;

        // Join the chat room via WebSocket
        socketService.joinRoom(selectedRoom.paperId);

        // Load initial messages (for history)
        loadMessages(selectedRoom.paperId);

        // Listen for new messages in REAL-TIME (no polling!)
        socketService.onReceiveMessage((message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for typing indicators
        socketService.onUserTyping((data: { userId: string; paperId: string }) => {
            if (data.paperId === selectedRoom.paperId) {
                setTypingUsers((prev) => new Set([...prev, data.userId]));
                // Auto-remove typing indicator after 3 seconds
                setTimeout(() => {
                    setTypingUsers((prev) => {
                        const updated = new Set(prev);
                        updated.delete(data.userId);
                        return updated;
                    });
                }, 3000);
            }
        });

        // Cleanup: Leave room and stop listening
        return () => {
            socketService.leaveRoom(selectedRoom.paperId);
            socketService.offReceiveMessage();
            socketService.offUserTyping();
        };
    }, [selectedRoom, isSocketConnected]);

    const fetchCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUserId(user.id);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const initializeSocket = () => {
        try {
            const token = getAccessToken();
            if (!token) {
                console.warn("No auth token found. Cannot connect to WebSocket");
                return;
            }

            const socket = socketService.connect(token);

            socket.on("connect", () => {
                console.log("✅ WebSocket connected for chat");
                setIsSocketConnected(true);
            });

            socket.on("disconnect", () => {
                console.log("❌ WebSocket disconnected");
                setIsSocketConnected(false);
            });

            socket.on("error", (error) => {
                console.error("❌ WebSocket error:", error);
            });

            // Cleanup on unmount
            return () => {
                socketService.disconnect();
            };
        } catch (error) {
            console.error("Failed to initialize WebSocket:", error);
        }
    };

    const loadRooms = async () => {
        setIsLoadingRooms(true);
        try {
            const data = await chatService.getRooms();
            setRooms(data);
        } catch (error) {
            console.error("Failed to load chat rooms:", error);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const loadMessages = async (paperId: string, silent = false) => {
        if (!silent) setIsLoadingMessages(true);
        try {
            const data = await chatService.getMessages(paperId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            if (!silent) setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom) return;

        // Show optimistic message immediately
        const tempMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            content: newMessage,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            isRead: false,
            sender: {
                name: "You",
            }
        };

        setMessages(prev => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage("");

        try {
            if (isSocketConnected) {
                // Use WebSocket for real-time message sending
                socketService.sendMessage(selectedRoom.paperId, messageToSend);
                // Message will arrive via socketService.onReceiveMessage listener
            } else {
                // Fallback to HTTP if WebSocket not available
                await chatService.sendMessage(selectedRoom.paperId, messageToSend);
                // Reload messages to get the sent message
                await loadMessages(selectedRoom.paperId);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            // Re-add the unsent message to input
            setNewMessage(messageToSend);
        }
    };

    const handleTyping = () => {
        if (selectedRoom && isSocketConnected) {
            socketService.notifyTyping(selectedRoom.paperId);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Sidebar - Rooms List */}
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] bg-white border-r border-gray-100 flex flex-col",
                selectedRoom ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                        />
                    </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoadingRooms ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin h-6 w-6 border-2 border-[#6366f1] border-t-transparent rounded-full" />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                className={cn(
                                    "w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50",
                                    selectedRoom?.id === room.id ? "bg-[#f5f6ff] hover:bg-[#f5f6ff]" : ""
                                )}
                            >
                                <div className="h-12 w-12 rounded-full bg-[#e0e7ff] flex items-center justify-center shrink-0">
                                    <span className="text-[#6366f1] font-bold text-lg">
                                        {room.paperTitle.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate pr-2">
                                            {room.paperTitle}
                                        </h3>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 truncate pr-2">
                                            {room.lastMessage || "Start a conversation"}
                                        </p>
                                        {room.unreadCount > 0 && (
                                            <span className="h-5 w-5 rounded-full bg-[#6366f1] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#fafafa]",
                !selectedRoom ? "hidden md:flex" : "flex"
            )}>
                {selectedRoom ? (
                    <>
                        {/* Header */}
                        <div className="h-[72px] px-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedRoom(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="h-10 w-10 rounded-full bg-[#e0e7ff] flex items-center justify-center">
                                    <span className="text-[#6366f1] font-bold">
                                        {selectedRoom.paperTitle.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{selectedRoom.paperTitle}</h2>
                                    <span className={cn(
                                        "text-xs flex items-center gap-1 font-medium",
                                        isSocketConnected ? "text-green-500" : "text-orange-500"
                                    )}>
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            isSocketConnected ? "bg-green-500" : "bg-orange-500"
                                        )} />
                                        {isSocketConnected ? "Connected" : "Connecting..."}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-gray-400 hover:text-[#6366f1] hover:bg-[#f5f6ff] rounded-full transition-colors">
                                    <Phone className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-[#6366f1] hover:bg-[#f5f6ff] rounded-full transition-colors">
                                    <Video className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-[#6366f1] hover:bg-[#f5f6ff] rounded-full transition-colors">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin h-6 w-6 border-2 border-[#6366f1] border-t-transparent rounded-full" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === currentUserId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex gap-3 max-w-[80%]",
                                                    isMe ? "ml-auto flex-row-reverse" : ""
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                                    isMe ? "bg-[#6366f1] text-white" : "bg-gray-200 text-gray-600"
                                                )}>
                                                    {msg.sender.name.charAt(0)}
                                                </div>
                                                <div className={cn(
                                                    "rounded-2xl p-4 shadow-sm",
                                                    isMe
                                                        ? "bg-[#6366f1] text-white rounded-tr-none"
                                                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                                )}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <div className={cn(
                                                        "flex items-center gap-1 mt-1 text-[10px]",
                                                        isMe ? "text-indigo-200 justify-end" : "text-gray-400"
                                                    )}>
                                                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && (
                                                            msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Typing Indicators */}
                                    {typingUsers.size > 0 && (
                                        <div className="flex gap-3 max-w-[80%]">
                                            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-gray-200 text-gray-600">
                                                T
                                            </div>
                                            <div className="rounded-2xl p-4 shadow-sm bg-white text-gray-800 rounded-tl-none border border-gray-100">
                                                <div className="flex gap-1">
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[#6366f1] focus-within:ring-1 focus-within:ring-[#6366f1] transition-all">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400 px-2"
                                />
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Smile className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-[#6366f1] text-white rounded-xl hover:bg-[#4f4fbe] transition-colors disabled:opacity-50 disabled:hover:bg-[#6366f1]"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="h-16 w-16 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                        <p className="max-w-md text-center">
                            Choose a chat from the sidebar to start messaging with your teachers or peers about specific papers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
