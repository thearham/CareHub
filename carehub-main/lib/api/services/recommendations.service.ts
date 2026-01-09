import { apiClient } from '../client';
import { RECOMMENDATIONS_ENDPOINTS } from '../endpoints';
import {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationStats,
} from '@/types/api/recommendation.types';

export const recommendationsService = {
  /**
   * Get medicine recommendations (AI-powered)
   */
  getMedicineRecommendations: async (data: RecommendationRequest): Promise<RecommendationResponse> => {
    const response = await apiClient.post<RecommendationResponse>(
      RECOMMENDATIONS_ENDPOINTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get recommendation history
   */
  getHistory: async (): Promise<RecommendationResponse[]> => {
    const response = await apiClient.get<RecommendationResponse[]>(
      RECOMMENDATIONS_ENDPOINTS.HISTORY
    );
    return response.data;
  },

  /**
   * Get specific recommendation details
   */
  getById: async (id: number): Promise<RecommendationResponse> => {
    const response = await apiClient.get<RecommendationResponse>(
      RECOMMENDATIONS_ENDPOINTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Clear recommendation cache (Admin only)
   */
  clearCache: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      RECOMMENDATIONS_ENDPOINTS.CLEAR_CACHE
    );
    return response.data;
  },

  /**
   * Get recommendation statistics (Admin only)
   */
  getStats: async (): Promise<RecommendationStats> => {
    const response = await apiClient.get<RecommendationStats>(
      RECOMMENDATIONS_ENDPOINTS.STATS
    );
    return response.data;
  },
};
