import { apiClient } from '../client';
import { ACCOUNTS_ENDPOINTS } from '../endpoints';
import {
  PatientRegisterRequest,
  PatientRegisterResponse,
  OTPGenerateRequest,
  OTPGenerateResponse,
  OTPVerifyRequest,
  OTPVerifyResponse,
  DashboardStats,
} from '@/types/api/user.types';
import { User } from '@/types/api/common.types';
import { ChangePasswordRequest, ChangePasswordResponse } from '@/types/api/auth.types';

export const accountsService = {
  /**
   * Register a new patient (public endpoint)
   * Matches PatientRegistrationSerializer
   */
  registerPatient: async (data: PatientRegisterRequest): Promise<PatientRegisterResponse> => {
    const response = await apiClient.post<PatientRegisterResponse>(
      ACCOUNTS_ENDPOINTS.REGISTER_PATIENT,
      data
    );
    return response.data;
  },

  /**
   * Get current authenticated user's profile
   * Matches UserSerializer
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(ACCOUNTS_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Update current user's profile
   * Matches UserSerializer (partial update)
   */
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>(ACCOUNTS_ENDPOINTS.ME, data);
    return response.data;
  },

  /**
   * Change user password
   * Matches ChangePasswordSerializer
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>(
      ACCOUNTS_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Generate OTP for patient data access (Doctor/Hospital)
   * Matches OTPGenerateSerializer
   */
  generateOTP: async (data: OTPGenerateRequest): Promise<OTPGenerateResponse> => {
    const response = await apiClient.post<OTPGenerateResponse>(
      ACCOUNTS_ENDPOINTS.OTP_GENERATE,
      data
    );
    return response.data;
  },

  /**
   * Verify OTP code
   * Matches OTPVerifySerializer
   */
  verifyOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    const response = await apiClient.post<OTPVerifyResponse>(
      ACCOUNTS_ENDPOINTS.OTP_VERIFY,
      data
    );
    return response.data;
  },

  /**
   * List users (Admin only)
   */
  getUsers: async (filters?: { user_type?: string }): Promise<User[]> => {
    const response = await apiClient.get<User[]>(ACCOUNTS_ENDPOINTS.USERS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get dashboard statistics (Admin only)
   * Matches DashboardStatsSerializer
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>(ACCOUNTS_ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  },
};