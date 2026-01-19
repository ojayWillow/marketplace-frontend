import apiClient from './client';
import { Review } from './types';

export const reviewsApi = {
  // Update a review (only by the reviewer)
  update: async (reviewId: number, data: { rating?: number; content?: string }) => {
    const response = await apiClient.put(`/api/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review (only by the reviewer)
  delete: async (reviewId: number) => {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },

  // Get reviews for a user
  getUserReviews: async (userId: number) => {
    const response = await apiClient.get(`/api/auth/users/${userId}/reviews`);
    return response.data;
  },
};
