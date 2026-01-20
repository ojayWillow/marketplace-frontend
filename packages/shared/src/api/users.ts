import api from './client';

export interface PublicUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  bio?: string;
  city?: string;
  country?: string;
  is_verified: boolean;
  is_helper?: boolean;
  skills?: string[];
  hourly_rate?: number;
  reputation_score: number;
  completion_rate: number;
  reviews_count: number;
  average_rating: number;
  completed_tasks_count?: number;
  created_at: string;
}

export interface UserReview {
  id: number;
  rating: number;
  content: string;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewer?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  created_at: string;
}

/**
 * Get public profile of a user
 */
export const getPublicUser = async (userId: number): Promise<PublicUser> => {
  const response = await api.get(`/api/auth/users/${userId}`);
  return response.data;
};

/**
 * Alias for getPublicUser - Get public profile of a user
 */
export const getUserProfile = getPublicUser;

/**
 * Get reviews for a user
 */
export const getUserReviews = async (userId: number): Promise<{ reviews: UserReview[]; total: number }> => {
  const response = await api.get(`/api/auth/users/${userId}/reviews`);
  return response.data;
};
