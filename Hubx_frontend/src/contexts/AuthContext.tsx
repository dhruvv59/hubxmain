"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout as logoutService, type CurrentUser } from '@/services/auth';
import { getAccessToken, ApiError } from '@/lib/http-client';

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: CurrentUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Handle different types of errors gracefully
      if (error instanceof ApiError) {
        if (error.statusCode === 401 || error.statusCode === 404) {
          // Token expired, invalid, or endpoint not found
          console.warn('[AuthContext] Authentication failed:', error.message);
        } else {
          console.error('[AuthContext] Unexpected API error:', error.message);
        }
      } else {
        console.error('[AuthContext] Failed to load user:', error);
      }

      // Always clear tokens on auth failure
      try {
        await logoutService();
      } catch (logoutError) {
        console.debug('[AuthContext] Logout cleanup failed (non-critical):', logoutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: CurrentUser) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);

    // Redirect based on current path
    if (pathname.startsWith('/teacher')) {
      router.push('/login');
    } else {
      router.push('/login');
    }
  };

  const refresh = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
