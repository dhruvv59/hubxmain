/**
 * GLOBAL API TYPES (Backend Contract)
 * 
 * These types define the standard envelope structure for all API responses.
 * Use these to ensure consistency across the entire application.
 */

// Standard Success Response Envelope
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

// Standard Pagination Meta
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Paginated Response Envelope
export interface PaginatedApiResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
    message?: string;
}

// Standard Error Response
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string; // e.g. "AUTH_001"
        message: string;
        details?: any;
    };
}
