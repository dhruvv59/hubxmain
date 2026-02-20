/**
 * Authentication Service
 * Handles login, register, profile, and token management
 */

import { http, setTokens, clearTokens } from '@/lib/http-client';
import { AUTH_ENDPOINTS } from '@/lib/api-config';

// --- Backend Response Types ---

interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN';
    avatar?: string | null;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
    };
}

interface ProfileResponse {
    success: boolean;
    message: string;
    data: AuthUser;
}

interface RefreshTokenResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

// --- Public API ---

export interface LoginCredentials {
    email: string;
    password: string;
    role?: 'student' | 'organisation';
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'TEACHER';
}

export interface CurrentUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN';
}

/**
 * Login user and store tokens
 */
export async function login(credentials: LoginCredentials): Promise<CurrentUser> {
    const response = await http.post<AuthResponse>(
        AUTH_ENDPOINTS.login(),
        credentials,
        { skipAuth: true }
    );

    const { user, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
    };
}

/**
 * Register new user and store tokens
 */
export async function register(data: RegisterData): Promise<CurrentUser> {
    const response = await http.post<AuthResponse>(
        AUTH_ENDPOINTS.register(),
        data,
        { skipAuth: true }
    );

    const { user, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
    };
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<CurrentUser> {
    const response = await http.get<ProfileResponse>(AUTH_ENDPOINTS.profile());
    const user = response.data;

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<void> {
    const { getRefreshToken } = await import('@/lib/http-client');
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await http.post<RefreshTokenResponse>(
        AUTH_ENDPOINTS.refreshToken(),
        { refreshToken: currentRefreshToken },
        { skipAuth: true }
    );

    setTokens(response.data.accessToken, response.data.refreshToken);
}

/**
 * Logout user - notify backend and clear all tokens
 */
export async function logout(): Promise<void> {
    try {
        // Optional: Notify backend for logging/analytics
        // Don't block logout if API call fails
        await http.post(AUTH_ENDPOINTS.logout(), {});
    } catch (error) {
        // Don't block logout on API failure
        console.error('[Auth] Logout API failed:', error);
    } finally {
        // Always clear local tokens
        clearTokens();
    }
}

/**
 * Change user password
 */
export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
    const response = await http.post<any>(
        AUTH_ENDPOINTS.changePassword(),
        {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }
    );

    return {
        success: response.success,
        message: response.message || 'Password changed successfully',
    };
}
