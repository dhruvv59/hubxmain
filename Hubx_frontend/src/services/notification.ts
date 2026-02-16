/**
 * Notification Service
 *
 * Production-ready service layer for notification management.
 * Handles all API communication for notifications.
 *
 * @module services/notification
 */

import { http, ApiError, NetworkError } from '@/lib/http-client';
import { API_BASE_URL } from '@/lib/api-config';
import type {
    Notification,
    NotificationFilters,
    NotificationStats,
    GetNotificationsResponse,
    MarkAsReadResponse,
    BulkActionResponse,
} from '@/types/notification';

/**
 * API Endpoints
 *
 * IMPORTANT: Only includes endpoints that actually exist in backend
 * Removed: archive, preferences (not implemented in backend)
 */
const ENDPOINTS = {
    getNotifications: (params?: string) =>
        `${API_BASE_URL}/notifications${params ? `?${params}` : ''}`,
    getNotification: (id: string) =>
        `${API_BASE_URL}/notifications/${id}`,
    markAsRead: (id: string) =>
        `${API_BASE_URL}/notifications/${id}/read`,
    markAllAsRead: () =>
        `${API_BASE_URL}/notifications/mark-all-read`,
    deleteNotification: (id: string) =>
        `${API_BASE_URL}/notifications/${id}`,
    getStats: () =>
        `${API_BASE_URL}/notifications/stats`,
} as const;

/**
 * ============================================
 * PUBLIC API - SERVICE FUNCTIONS
 * ============================================
 */

/**
 * Get notifications with optional filters
 *
 * @param filters - Optional filters to apply
 * @param cursor - Pagination cursor
 * @returns Promise<GetNotificationsResponse>
 *
 * @example
 * const result = await getNotifications({ isRead: false, types: ['assignment'] });
 */
export async function getNotifications(
    filters?: NotificationFilters,
    cursor?: string
): Promise<GetNotificationsResponse> {
    try {
        const params = new URLSearchParams();

        if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
        if (filters?.types?.length) params.append('types', filters.types.join(','));
        if (filters?.priorities?.length) params.append('priorities', filters.priorities.join(','));
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.search) params.append('search', filters.search);
        if (cursor) params.append('cursor', cursor);

        const response = await http.get<GetNotificationsResponse>(
            ENDPOINTS.getNotifications(params.toString())
        );

        return response;
    } catch (error) {
        console.error('[Notification Service] Failed to fetch notifications:', error);
        throw error;
    }
}

/**
 * Get single notification by ID
 *
 * @param id - Notification ID
 * @returns Promise<Notification>
 */
export async function getNotificationById(id: string): Promise<Notification> {
    try {
        const response = await http.get<{ success: boolean; data: Notification }>(
            ENDPOINTS.getNotification(id)
        );
        return response.data;
    } catch (error) {
        console.error(`[Notification Service] Failed to fetch notification ${id}:`, error);
        throw error;
    }
}

/**
 * Mark a notification as read
 *
 * @param id - Notification ID
 * @returns Promise<MarkAsReadResponse>
 */
export async function markNotificationAsRead(id: string): Promise<MarkAsReadResponse> {
    try {
        const response = await http.patch<MarkAsReadResponse>(
            ENDPOINTS.markAsRead(id)
        );
        return response;
    } catch (error) {
        console.error(`[Notification Service] Failed to mark notification ${id} as read:`, error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 *
 * @returns Promise<BulkActionResponse>
 */
export async function markAllNotificationsAsRead(): Promise<BulkActionResponse> {
    try {
        const response = await http.patch<BulkActionResponse>(
            ENDPOINTS.markAllAsRead()
        );
        return response;
    } catch (error) {
        console.error('[Notification Service] Failed to mark all notifications as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 *
 * @param id - Notification ID
 * @returns Promise<{ success: boolean }>
 */
export async function deleteNotification(id: string): Promise<{ success: boolean }> {
    try {
        await http.delete(ENDPOINTS.deleteNotification(id));
        return { success: true };
    } catch (error) {
        console.error(`[Notification Service] Failed to delete notification ${id}:`, error);
        throw error;
    }
}

/**
 * Get notification statistics
 *
 * @returns Promise<NotificationStats>
 */
export async function getNotificationStats(): Promise<NotificationStats> {
    try {
        const response = await http.get<NotificationStats>(
            ENDPOINTS.getStats()
        );
        return response;
    } catch (error) {
        console.error('[Notification Service] Failed to fetch notification stats:', error);
        throw error;
    }
}

/**
 * ============================================
 * REMOVED FEATURES (Backend not implemented)
 * ============================================
 *
 * The following functions have been removed because backend endpoints don't exist:
 *
 * - archiveNotification(id: string)
 *   → Use deleteNotification() instead
 *
 * - getNotificationPreferences()
 * - updateNotificationPreferences(preferences)
 *   → Preferences feature not available
 *
 * If you need these features:
 * 1. Implement backend endpoints first
 * 2. Add functions back to this service
 * 3. Update UI components
 */
