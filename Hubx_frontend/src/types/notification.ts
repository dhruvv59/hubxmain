/**
 * Notification System - Type Definitions
 * 
 * Production-ready types for the notification system.
 * These match the expected backend API contract.
 */

/**
 * Notification priority levels
 * Used for sorting and visual styling
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification types/categories
 * Each type has distinct visual styling and behavior
 */
export type NotificationType =
    | 'assignment'      // New assignments from teachers
    | 'test'           // Test reminders and results
    | 'achievement'    // Achievements, badges, milestones
    | 'feedback'       // Teacher feedback on submissions
    | 'announcement'   // School/class announcements
    | 'reminder'       // General reminders
    | 'system';        // System notifications

/**
 * Notification action types
 * Defines what happens when user clicks on notification
 */
export interface NotificationAction {
    type: 'navigate' | 'external' | 'modal' | 'none';
    url?: string;          // For navigate/external
    modalId?: string;      // For modal
    metadata?: any;        // Additional action data
}

/**
 * Core Notification Interface
 * Represents a single notification entity
 */
export interface Notification {
    id: string;
    userId: string;

    // Content
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;

    // State
    isRead: boolean;
    isArchived: boolean;

    // Timestamps
    createdAt: string;      // ISO 8601 format
    readAt?: string;        // When notification was read
    expiresAt?: string;     // Optional expiration

    // Additional data
    action?: NotificationAction;
    avatar?: string;        // URL to avatar image
    icon?: string;          // Icon identifier if no avatar
    metadata?: {
        authorId?: string;      // Teacher/system who created it
        authorName?: string;
        authorRole?: string;
        relatedEntityId?: string;  // Related test/assignment ID
        relatedEntityType?: string;
        tags?: string[];
        [key: string]: any;
    };
}

/**
 * Notification Filters
 * Used for filtering notification lists
 */
export interface NotificationFilters {
    types?: NotificationType[];
    priorities?: NotificationPriority[];
    isRead?: boolean;
    isArchived?: boolean;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

/**
 * Notification Preferences
 * User's notification settings
 */
export interface NotificationPreferences {
    userId: string;

    // Channel preferences
    email: {
        enabled: boolean;
        types: NotificationType[];
        frequency: 'instant' | 'daily' | 'weekly';
    };
    push: {
        enabled: boolean;
        types: NotificationType[];
    };
    inApp: {
        enabled: boolean;
        types: NotificationType[];
    };

    // Sound and visual
    soundEnabled: boolean;
    desktopNotifications: boolean;

    // Do not disturb
    quietHours?: {
        enabled: boolean;
        startTime: string;  // HH:mm format
        endTime: string;
    };
}

/**
 * Notification Statistics
 * Analytics data for notifications
 */
export interface NotificationStats {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    todayCount: number;
    weekCount: number;
}

/**
 * API Response Types
 */

export interface GetNotificationsResponse {
    notifications: Notification[];
    stats: NotificationStats;
    hasMore: boolean;
    nextCursor?: string;
}

export interface MarkAsReadResponse {
    success: boolean;
    notification: Notification;
}

export interface BulkActionResponse {
    success: boolean;
    affectedCount: number;
    failedIds?: string[];
}

/**
 * WebSocket Event Types
 * For real-time notification updates
 */
export interface NotificationWebSocketEvent {
    type: 'new' | 'update' | 'delete';
    notification?: Notification;
    notificationId?: string;
    timestamp: string;
}

/**
 * Notification Hook State
 * State returned by useNotifications hook
 */
export interface NotificationState {
    notifications: Notification[];
    stats: NotificationStats;
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
}

/**
 * Notification Hook Actions
 * Actions available from useNotifications hook
 */
export interface NotificationActions {
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    updateFilters: (filters: NotificationFilters) => void;
}

/**
 * Helper type for notification grouping
 */
export interface NotificationGroup {
    label: string;
    notifications: Notification[];
    date?: string;
}

/**
 * Type guards
 */
export function isHighPriority(notification: Notification): boolean {
    return notification.priority === 'high' || notification.priority === 'urgent';
}

export function isUnread(notification: Notification): boolean {
    return !notification.isRead;
}

export function isExpired(notification: Notification): boolean {
    if (!notification.expiresAt) return false;
    return new Date(notification.expiresAt) < new Date();
}

/**
 * Constants
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    assignment: 'Assignment',
    test: 'Test',
    achievement: 'Achievement',
    feedback: 'Feedback',
    announcement: 'Announcement',
    reminder: 'Reminder',
    system: 'System'
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
    urgent: 'Urgent'
};
