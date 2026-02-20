"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    MessageSquare,
    MoreVertical,
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

export function ChatInterface() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [messageOffset, setMessageOffset] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showRoomMenu, setShowRoomMenu] = useState(false);
    const messagesContainerRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Initialize: Load rooms and connect to socket
    useEffect(() => {
        loadRooms();
        fetchCurrentUser();

        // Initialize socket with proper cleanup
        const cleanup = initializeSocket();

        return () => {
            if (cleanup) cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // WebSocket: Listen for real-time messages and room changes
    useEffect(() => {
        if (!selectedRoom || !isSocketConnected) return;

        // Join the chat room via WebSocket
        socketService.joinRoom(selectedRoom.paperId);

        // Mark all messages in this room as read
        chatService.markRoomAsRead(selectedRoom.paperId);

        // Load initial messages (for history)
        loadMessages(selectedRoom.paperId);

        // Listen for new messages in REAL-TIME (no polling!)
        socketService.onReceiveMessage((message: ChatMessage & { message?: string }) => {
            // Normalize: backend socket sends 'message', REST API sends 'content'
            const normalized: ChatMessage = {
                ...message,
                content: message.content ?? message.message ?? "",
                sender: {
                    name: message.sender?.name ?? (message.sender as { firstName?: string; lastName?: string })
                        ? `${(message.sender as { firstName?: string }).firstName ?? ""} ${(message.sender as { lastName?: string }).lastName ?? ""}`.trim()
                        : "Unknown",
                },
            };
            setMessages((prev) => [...prev, normalized]);
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
            let connectionTimeout: NodeJS.Timeout;

            socket.on("connect", () => {
                console.log("✅ WebSocket connected for chat");
                clearTimeout(connectionTimeout);
                setIsSocketConnected(true);
            });

            socket.on("disconnect", () => {
                console.log("❌ WebSocket disconnected");
                setIsSocketConnected(false);
            });

            socket.on("error", (error) => {
                console.error("❌ WebSocket error:", error);
            });

            // Set timeout for connection attempt (10 seconds)
            connectionTimeout = setTimeout(() => {
                if (!socket.connected) {
                    console.warn("⏱️ Socket connection timeout, will retry on next action");
                    setIsSocketConnected(false);
                }
            }, 10000);

            // Cleanup on unmount
            return () => {
                clearTimeout(connectionTimeout);
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
        setMessageOffset(0);
        try {
            const { messages: data, pagination } = await chatService.getMessages(paperId, 20, 0);
            setMessages(data);
            setHasMoreMessages(pagination.hasMore);
            setMessageOffset(20);
        } catch (error: unknown) {
            console.error("Failed to load messages:", error);
            if (!silent) {
                alert("Failed to load messages. Please try again.");
            }
            setMessages([]); // Clear messages on error
        } finally {
            if (!silent) setIsLoadingMessages(false);
        }
    };

    const loadOlderMessages = async (paperId: string) => {
        if (isLoadingMoreMessages || !hasMoreMessages) return;
        setIsLoadingMoreMessages(true);
        try {
            const { messages: olderMessages, pagination } = await chatService.getMessages(
                paperId,
                20,
                messageOffset
            );
            setMessages((prev) => [...olderMessages, ...prev]);
            setHasMoreMessages(pagination.hasMore);
            setMessageOffset((prev) => prev + 20);
        } catch (error: unknown) {
            console.error("Failed to load older messages:", error);
            alert("Failed to load older messages. Please try again.");
        } finally {
            setIsLoadingMoreMessages(false);
        }
    };

    const handleMessagesScroll = () => {
        if (!messagesContainerRef.current || !selectedRoom) return;
        const { scrollTop } = messagesContainerRef.current;

        // Load older messages when user scrolls to top (within 100px)
        if (scrollTop < 100 && hasMoreMessages && !isLoadingMoreMessages) {
            loadOlderMessages(selectedRoom.paperId);
        }
    };

    const handleSendMessage = async () => {
        // Prevent double-send (rate limiting)
        if (isSendingMessage) return;

        // Validation
        if (!selectedRoom) {
            console.error("No room selected");
            return;
        }

        const trimmedMessage = newMessage.trim();
        const MAX_MESSAGE_LENGTH = 2000;

        if (!trimmedMessage) {
            console.warn("Cannot send empty message");
            return;
        }

        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            alert(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
            return;
        }

        // Show optimistic message immediately
        const tempMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            content: trimmedMessage,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            isRead: false,
            sender: {
                name: "You",
            }
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage("");
        setIsSendingMessage(true);

        try {
            if (isSocketConnected) {
                // Use WebSocket for real-time message sending
                socketService.sendMessage(selectedRoom.paperId, trimmedMessage);
                // Message will arrive via socketService.onReceiveMessage listener
            } else {
                // Fallback to HTTP if WebSocket not available
                await chatService.sendMessage(selectedRoom.paperId, trimmedMessage);
                // Reload messages to get the sent message
                await loadMessages(selectedRoom.paperId);
            }
        } catch (error: unknown) {
            console.error("Failed to send message:", error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            // Re-add the unsent message to input
            setNewMessage(trimmedMessage);
            // Show error to user
            const errorMsg = error instanceof Error ? error.message : "Failed to send message. Please try again.";
            alert(errorMsg);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleTyping = () => {
        if (selectedRoom && isSocketConnected) {
            socketService.notifyTyping(selectedRoom.paperId);
        }
    };

    const handleDeleteRoom = () => {
        if (!selectedRoom) return;
        const confirmed = confirm(
            `Delete conversation "${selectedRoom.paperTitle}"? This cannot be undone.`
        );
        if (confirmed) {
            setRooms(rooms.filter(r => r.id !== selectedRoom.id));
            setSelectedRoom(null);
            setShowRoomMenu(false);
        }
    };

    const handleMuteRoom = () => {
        if (!selectedRoom) return;
        alert(`Muted notifications for "${selectedRoom.paperTitle}"`);
        setShowRoomMenu(false);
    };

    const handleArchiveRoom = () => {
        if (!selectedRoom) return;
        alert(`Archived "${selectedRoom.paperTitle}"`);
        setRooms(rooms.filter(r => r.id !== selectedRoom.id));
        setSelectedRoom(null);
        setShowRoomMenu(false);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowRoomMenu(false);
            }
        };

        if (showRoomMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showRoomMenu]);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Sidebar - Rooms List */}
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] bg-white border-r border-gray-100 flex flex-col",
                selectedRoom && !isLoadingRooms ? "hidden md:flex" : "flex"
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
                                        {(room.paperTitle || "U").charAt(0)}
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
                                        {(selectedRoom.paperTitle || "U").charAt(0)}
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
                            <div className="flex items-center gap-1 relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowRoomMenu(!showRoomMenu)}
                                    className="p-2 text-gray-400 hover:text-[#6366f1] hover:bg-[#f5f6ff] rounded-full transition-colors"
                                    title="More options"
                                >
                                    <MoreVertical className="h-5 w-5" />
                                </button>

                                {/* Dropdown Menu */}
                                {showRoomMenu && (
                                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <button
                                            onClick={handleMuteRoom}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                                        >
                                            🔇 Mute Notifications
                                        </button>
                                        <button
                                            onClick={handleArchiveRoom}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                                        >
                                            📦 Archive
                                        </button>
                                        <button
                                            onClick={handleDeleteRoom}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            🗑️ Delete Conversation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleMessagesScroll}
                            className="flex-1 overflow-y-auto p-6 space-y-6"
                        >
                            {isLoadingMoreMessages && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin h-5 w-5 border-2 border-[#6366f1] border-t-transparent rounded-full" />
                                </div>
                            )}
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
                                                    "rounded-2xl p-4 shadow-sm max-w-xs",
                                                    isMe
                                                        ? "bg-[#6366f1] text-white rounded-tr-none"
                                                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                                )}>
                                                    {!isMe && (
                                                        <p className="text-xs font-semibold mb-1 text-gray-600">
                                                            {msg.sender.name}
                                                        </p>
                                                    )}
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
                                    disabled={!newMessage.trim() || isSendingMessage}
                                    title={isSendingMessage ? "Sending message..." : "Send message"}
                                    className="p-2 bg-[#6366f1] text-white rounded-xl hover:bg-[#4f4fbe] transition-colors disabled:opacity-50 disabled:hover:bg-[#6366f1]"
                                >
                                    {isSendingMessage ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            {isLoadingRooms ? (
                                <div className="animate-spin h-12 w-12 border-3 border-[#6366f1] border-t-transparent rounded-full" />
                            ) : !isSocketConnected ? (
                                <div className="animate-pulse h-16 w-16 text-gray-300">📡</div>
                            ) : (
                                <MessageSquare className="h-16 w-16 text-gray-300" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isLoadingRooms ? "Loading Conversations..." : !isSocketConnected ? "Connecting..." : "Select a Conversation"}
                        </h3>
                        <p className="max-w-md text-center">
                            {isLoadingRooms
                                ? "Please wait while we load your chat rooms."
                                : !isSocketConnected
                                ? "Establishing real-time connection..."
                                : "Choose a chat from the sidebar to start messaging with your students about specific papers."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
