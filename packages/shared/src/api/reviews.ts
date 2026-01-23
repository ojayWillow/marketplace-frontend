import apiClient from './client';
import { Review } from './types';

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  review_type?: 'client_review' | 'worker_review';
  reviewee?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  task?: any;
  existing_review?: Review;
  min_content_length?: number;
}

export interface CreateReviewData {
  rating: number;
  content: string;
}

export interface TaskReviewsResponse {
  reviews: Review[];
  total: number;
}

export interface UserReviewStats {
  user_id: number;
  total_reviews: number;
  average_rating: number | null;
  rating_breakdown: Record<number, number>;
  as_worker: {
    count: number;
    average: number | null;
  };
  as_client: {
    count: number;
    average: number | null;
  };
}

/**
 * Check if current user can review a task
 */
export const canReviewTask = async (taskId: number): Promise<CanReviewResponse> => {
  const response = await apiClient.get(`/api/reviews/task/${taskId}/can-review`);
  return response.data;
};

/**
 * Create a review for a completed task
 */
export const createTaskReview = async (taskId: number, data: CreateReviewData): Promise<Review> => {
  const response = await apiClient.post(`/api/reviews/task/${taskId}`, data);
  return response.data.review;
};

/**
 * Get all reviews for a task
 */
export const getTaskReviews = async (taskId: number): Promise<TaskReviewsResponse> => {
  const response = await apiClient.get(`/api/reviews/task/${taskId}`);
  return response.data;
};

/**
 * Get review statistics for a user
 */
export const getUserReviewStats = async (userId: number): Promise<UserReviewStats> => {
  const response = await apiClient.get(`/api/reviews/user/${userId}/stats`);
  return response.data;
};

export const reviewsApi = {
  // Update a review (only by the reviewer, within 24 hours)
  update: async (reviewId: number, data: { rating?: number; content?: string }) => {
    const response = await apiClient.put(`/api/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review (only by the reviewer, within 24 hours)
  delete: async (reviewId: number) => {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },

  // Get reviews for a user
  getUserReviews: async (userId: number) => {
    const response = await apiClient.get(`/api/auth/users/${userId}/reviews`);
    return response.data;
  },

  // Check if can review a task
  canReviewTask,

  // Create task review
  createTaskReview,

  // Get task reviews
  getTaskReviews,

  // Get user review stats
  getUserReviewStats,
};
