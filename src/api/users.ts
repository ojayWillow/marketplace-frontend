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
  reputation_score: number;
  completion_rate: number;
  reviews_count: number;
  average_rating: number;
  created_at: string;
}

export interface UserReview {
  id: number;
  rating: number;
  content: string;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  created_at: string;
}

/**
 * Get public profile of a user
 */
export const getPublicUser = async (userId: number): Promise<PublicUser> => {
  const response = await api.get(`/auth/users/${userId}`);
  return response.data;
};

/**
 * Get reviews for a user
 */
export const getUserReviews = async (userId: number): Promise<{ reviews: UserReview[]; total: number }> => {
  const response = await api.get(`/auth/users/${userId}/reviews`);
  return response.data;
};
