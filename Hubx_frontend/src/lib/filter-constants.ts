/**
 * Filter Constants and Defaults
 * Centralized configuration for all filter options and defaults
 */

import type { NotificationType } from '@/types/notification';
import type { PrivatePaperFilters } from '@/types/private-paper';

/**
 * Private Paper Filter Defaults
 */
export const PRIVATE_PAPER_DEFAULT_FILTERS: PrivatePaperFilters = {
    subject: "All",
    std: "All",
    difficulty: "All",
    search: "",
    sortBy: "Most Recent",
    page: 1,
    limit: 10
};

/**
 * Sort Options for Private Papers
 */
export const PRIVATE_PAPER_SORT_OPTIONS = [
    "Most Recent",
    "Most Popular",
    "Highest Rated"
] as const;

/**
 * Notification Filter Types
 */
export const NOTIFICATION_FILTER_TYPES: Array<NotificationType | 'all'> = [
    'all',
    'assignment',
    'test',
    'feedback',
    'announcement',
    'reminder',
    'system'
] as const;

/**
 * Helper function to get readable label for notification filter
 */
export function getNotificationFilterLabel(type: NotificationType | 'all'): string {
    if (type === 'all') return 'All';
    return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Difficulty Options for Papers
 */
export const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;
