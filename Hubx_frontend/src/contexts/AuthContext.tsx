"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout as logoutService, type CurrentUser } from '@/services/auth';
import { getAccessToken } from '@/lib/http-client';

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
      console.error('[AuthContext] Failed to load user:', error);
      // Token might be expired, clear it
      await logoutService();
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
