import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPublicUser, getUserReviews, PublicUser, UserReview } from '@marketplace/shared/src/api/users';
import { startConversation, Conversation } from '@marketplace/shared/src/api/messages';

// Query keys for cache management
export const userKeys = {
  all: ['users'] as const,
  profile: (id: number) => [...userKeys.all, 'profile', id] as const,
  reviews: (id: number) => [...userKeys.all, 'reviews', id] as const,
};

/**
 * Fetch public user profile by ID
 */
export const useUserProfile = (userId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => getPublicUser(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId && options?.enabled !== false,
  });
};

/**
 * Fetch user reviews
 */
export const useUserReviews = (userId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userKeys.reviews(userId),
    queryFn: () => getUserReviews(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId && options?.enabled !== false,
  });
};

/**
 * Start a conversation with a user
 */
export const useStartConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => startConversation(userId),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });
};
