'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services/auth.service';
import { accountsService } from '@/lib/api/services/accounts.service';
import { User } from '@/types/api/common.types';
import { LoginRequest } from '@/types/api/auth.types';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  setStoredUser,
  getStoredUser,
  clearStoredUser,
} from '@/lib/utils/storage';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const storedUser = getStoredUser();

      console.log('[AuthContext] initAuth started', { hasToken: !!token, hasStoredUser: !!storedUser });

      if (token && storedUser) {
        // Token and user data exist, verify by fetching current user
        try {
          console.log('[AuthContext] Verifying token with getMe()...');
          const userData = await accountsService.getMe();
          console.log('[AuthContext] Token verified, user:', userData.username);
          setUser(userData);
          setStoredUser(userData); // Update stored user
        } catch (error) {
          // Token invalid or expired, clear everything
          console.error('[AuthContext] Token verification failed:', error);
          clearTokens();
          clearStoredUser();
          setUser(null);
        }
      } else if (token) {
        // Token exists but no stored user, fetch user data
        try {
          console.log('[AuthContext] Token exists, fetching user...');
          const userData = await accountsService.getMe();
          console.log('[AuthContext] User fetched:', userData.username);
          setUser(userData);
          setStoredUser(userData);
        } catch (error) {
          console.error('[AuthContext] Failed to fetch user:', error);
          clearTokens();
          setUser(null);
        }
      } else {
        console.log('[AuthContext] No token found');
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      // Call login API
      const response = await authService.login(data);

      // Store tokens
      setTokens(response.access, response.refresh);

      // Fetch user data
      const userData = await accountsService.getMe();
      setUser(userData);
      setStoredUser(userData);

      // Show success message
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);

      // Redirect based on role (convert to lowercase for matching)
      const dashboardRoutes: Record<string, string> = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        hospital: '/hospital/dashboard',
        admin: '/admin/dashboard',
      };

      const userType = userData.user_type.toLowerCase();
      const redirectPath = dashboardRoutes[userType] || '/';
      router.push(redirectPath);
    } catch (error: any) {
      // Don't show toast here - let the login page handle error display
      // Just re-throw the error so the login page can catch and display it
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    clearStoredUser();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    setStoredUser(userData);
  };

  const refreshUser = async () => {
    try {
      const userData = await accountsService.getMe();
      setUser(userData);
      setStoredUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
