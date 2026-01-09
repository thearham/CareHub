import { apiClient } from '../client';
import { AUTH_ENDPOINTS } from '../endpoints';
import {
  LoginRequest,
  LoginResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from '@/types/api/auth.types';

export const authService = {
  /**
   * Login user and obtain JWT tokens
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post<TokenRefreshResponse>(
      AUTH_ENDPOINTS.REFRESH,
      { refresh: refreshToken } as TokenRefreshRequest
    );
    return response.data;
  },
};