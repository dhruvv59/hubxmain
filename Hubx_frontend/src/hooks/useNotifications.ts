/**
 * useNotifications Hook
 * 
 * Production-ready React hook for notification management.
 * Provides simple, declarative API for consuming notifications.
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { notifications, unreadCount, markAsRead, refresh, isLoading } = useNotifications();
 *   
 *   return (
 *     <div>
 *       <span>Unread: {unreadCount}</span>
 *       {notifications.map(n => (
 *         <div key={n.id} onClick={() => markAsRead(n.id)}>{n.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    Notification,
    NotificationFilters,
    NotificationStats,
    NotificationState,
    NotificationActions,
} from '@/types/notification';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from '@/services/notification';

/**
 * Hook configuration options
 */
export interface UseNotificationsOptions {
    /** Initial filters to apply */
    initialFilters?: NotificationFilters;

    /** Auto-refresh interval in milliseconds (0 = disabled) */
    refreshInterval?: number;

    /** Enable real-time updates via WebSocket */
    enableRealtime?: boolean;

    /** When false, skips fetching (e.g. when user is not authenticated). Default: true */
    enabled?: boolean;

    /** Callback when new notification arrives */
    onNewNotification?: (notification: Notification) => void;

    /** Callback on error */
    onError?: (error: Error) => void;
}

/**
 * Combined return type for the hook
 */
export interface UseNotificationsReturn extends NotificationState, NotificationActions {
    unreadCount: number;
    isRefreshing: boolean;
}

/**
 * Main notification management hook
 * 
 * Handles fetching, state management, and actions for notifications.
 * Supports auto-refresh, real-time updates, and optimistic UI updates.
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
    const {
        initialFilters = {},
        refreshInterval = 0,
        enableRealtime = false,
        enabled = true,
        onNewNotification,
        onError,
    } = options;

    // State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
        byType: {
            assignment: 0,
            test: 0,
            achievement: 0,
            feedback: 0,
            announcement: 0,
            reminder: 0,
            system: 0
        },
        byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
        },
        todayCount: 0,
        weekCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [filters, setFilters] = useState<NotificationFilters>(initialFilters);
    const [cursor, setCursor] = useState<string | undefined>();

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const initialFetchDone = useRef(false);

    /**
     * Fetch notifications from API
     */
    const fetchNotifications = useCallback(async (showLoading = true, resetCursor = false) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }
            setError(null);

            const currentCursor = resetCursor ? undefined : cursor;
            const response = await getNotifications(filters, currentCursor);

            if (isMountedRef.current) {
                setNotifications(response.notifications || []);
                setStats(response.stats);
                setHasMore(response.hasMore);
                setCursor(response.nextCursor);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
            if (isMountedRef.current) {
                setError(error);
            }
            onError?.(error);
            console.error('[useNotifications] Fetch error:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [filters, cursor, onError]);

    /**
     * Refresh notifications (force reload)
     */
    const refresh = useCallback(async () => {
        setCursor(undefined);
        await fetchNotifications(false, true);
    }, [fetchNotifications]);

    /**
     * Load more notifications (pagination)
     */
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;
        await fetchNotifications(false, false);
    }, [hasMore, isLoading, fetchNotifications]);

    /**
     * Mark notification as read (with optimistic update)
     */
    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
        setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1)
        }));

        try {
            await markNotificationAsRead(id);
        } catch (err) {
            // Revert on error
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false, readAt: undefined } : n)
            );
            setStats(prev => ({
                ...prev,
                unread: prev.unread + 1
            }));

            const error = err instanceof Error ? err : new Error('Failed to mark as read');
            onError?.(error);
            console.error('[useNotifications] Mark as read error:', error);
        }
    }, [onError]);

    /**
     * Mark all notifications as read (with optimistic update)
     */
    const markAllAsRead = useCallback(async () => {
        const previousNotifications = notifications;
        const previousStats = stats;

        // Optimistic update
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setStats(prev => ({
            ...prev,
            unread: 0
        }));

        try {
            await markAllNotificationsAsRead();
        } catch (err) {
            // Revert on error
            setNotifications(previousNotifications);
            setStats(previousStats);

            const error = err instanceof Error ? err : new Error('Failed to mark all as read');
            onError?.(error);
            console.error('[useNotifications] Mark all as read error:', error);
        }
    }, [notifications, stats, onError]);

    /**
     * Delete notification (with optimistic update)
     */
    const deleteNotificationAction = useCallback(async (id: string) => {
        const deletedNotification = notifications.find(n => n.id === id);
        if (!deletedNotification) return;

        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));
        setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            unread: deletedNotification.isRead ? prev.unread : prev.unread - 1
        }));

        try {
            await deleteNotification(id);
        } catch (err) {
            // Revert on error
            setNotifications(prev => {
                const index = prev.findIndex(n => new Date(n.createdAt) < new Date(deletedNotification.createdAt));
                const newNotifications = [...prev];
                if (index === -1) {
                    newNotifications.push(deletedNotification);
                } else {
                    newNotifications.splice(index, 0, deletedNotification);
                }
                return newNotifications;
            });
            setStats(prev => ({
                ...prev,
                total: prev.total + 1,
                unread: deletedNotification.isRead ? prev.unread : prev.unread + 1
            }));

            const error = err instanceof Error ? err : new Error('Failed to delete notification');
            onError?.(error);
            console.error('[useNotifications] Delete error:', error);
        }
    }, [notifications, onError]);



    /**
     * Update filters
     */
    const updateFilters = useCallback((newFilters: NotificationFilters) => {
        setFilters(newFilters);
        setCursor(undefined);
    }, []);

    /**
     * Initial fetch on mount (only when enabled)
     */
    useEffect(() => {
        if (!enabled) return;
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchNotifications(true, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]); // Run when enabled changes

    /**
     * Fetch when filters change (but not on initial mount)
     */
    useEffect(() => {
        if (!enabled) return;
        if (initialFetchDone.current) {
            fetchNotifications(true, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, filters]); // When filters or enabled change

    /**
     * Setup WebSocket for real-time updates
     */
    useEffect(() => {
        if (!enableRealtime) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/notifications';

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[useNotifications] WebSocket connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'new' && data.notification) {
                        // Add new notification
                        setNotifications(prev => [data.notification, ...prev]);
                        setStats(prev => ({
                            ...prev,
                            total: prev.total + 1,
                            unread: prev.unread + 1
                        }));
                        onNewNotification?.(data.notification);
                    } else if (data.type === 'update' && data.notification) {
                        // Update existing notification
                        setNotifications(prev =>
                            prev.map(n => n.id === data.notification.id ? data.notification : n)
                        );
                    } else if (data.type === 'delete' && data.notificationId) {
                        // Remove notification
                        setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
                    }
                } catch (err) {
                    console.error('[useNotifications] WebSocket message parse error:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('[useNotifications] WebSocket error:', event);
            };

            ws.onclose = () => {
                console.log('[useNotifications] WebSocket disconnected');
            };
        } catch (err) {
            console.error('[useNotifications] WebSocket connection error:', err);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [enableRealtime, onNewNotification]);

    /**
     * Setup auto-refresh
     */
    useEffect(() => {
        if (refreshInterval <= 0 || !enabled) return;

        refreshTimerRef.current = setInterval(() => {
            fetchNotifications(false, true);
        }, refreshInterval);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshInterval, enabled]); // Don't include fetchNotifications to avoid recreating interval

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, []);

    return {
        // State
        notifications,
        stats,
        isLoading,
        error,
        hasMore,
        isRefreshing,
        unreadCount: stats?.unread || 0,

        // Actions
        refresh,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification: deleteNotificationAction,
        updateFilters,
    };
}

/**
 * Convenience hook for unread count only
 * Useful for displaying badge count without full notification UI
 */
export function useUnreadCount(): number {
    const { unreadCount } = useNotifications({
        initialFilters: { isRead: false },
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    return unreadCount;
}
