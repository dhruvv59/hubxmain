/**
 * HTTP Client Utility
 * Production-ready HTTP client with error handling, retries, and JWT auth
 */

import { API_CONFIG } from './api-config';

const TOKEN_KEY = 'hubx_access_token';
const REFRESH_TOKEN_KEY = 'hubx_refresh_token';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor(message: string, public originalError?: any) {
        super(message);
        this.name = 'NetworkError';
    }
}

interface RequestOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    skipAuth?: boolean;
}

/**
 * Token management utilities
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Main HTTP client with retry logic, error handling, and auth
 */
export async function apiClient<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        timeout = API_CONFIG.timeout,
        retries = API_CONFIG.retries,
        retryDelay = API_CONFIG.retryDelay,
        skipAuth = false,
        ...fetchOptions
    } = options;

    // Inject Authorization header if token exists and auth is not skipped
    const authHeaders: Record<string, string> = {};
    if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
            authHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                    ...fetchOptions.headers,
                },
            });

            clearTimeout(timeoutId);

            // Handle 401 - token expired (don't retry, clear tokens)
            if (response.status === 401) {
                clearTokens();
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.message || 'Authentication required. Please log in again.',
                    401,
                    'AUTH_EXPIRED',
                    errorData
                );
            }

            // Handle HTTP errors
            if (!response.ok) {
                let errorData: any = {};
                try {
                    errorData = await response.json();
                } catch {
                    // Response is not JSON
                }

                throw new ApiError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    errorData.code,
                    errorData.details
                );
            }

            // Parse successful response
            const data = await response.json();
            return data as T;

        } catch (error: any) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
                throw error;
            }

            // Don't retry on the last attempt
            if (attempt === retries) {
                break;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
    }

    // All retries failed
    if (lastError) {
        if (lastError instanceof ApiError) {
            throw lastError;
        }
        throw new NetworkError('Failed to fetch data after multiple retries', lastError);
    }

    throw new NetworkError('Unknown error occurred');
}

/**
 * Convenience methods
 */
export const http = {
    get: <T>(url: string, options?: RequestOptions) =>
        apiClient<T>(url, { ...options, method: 'GET' }),

    post: <T>(url: string, body?: any, options?: RequestOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(url: string, body?: any, options?: RequestOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(url: string, options?: RequestOptions) =>
        apiClient<T>(url, { ...options, method: 'DELETE' }),

    patch: <T>(url: string, body?: any, options?: RequestOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        }),
};
