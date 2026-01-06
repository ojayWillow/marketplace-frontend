/**
 * React Query hooks for favorites
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFavorites,
  getFavoritesCount,
  toggleFavorite,
  checkFavorites,
  removeFavorite,
  FavoriteItemType,
  FavoritesResponse,
  FavoritesCountResponse,
  ToggleFavoriteResponse,
  FavoritesCheckResponse
} from '../api/favorites';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to get all favorites for the current user
 */
export const useFavorites = (itemType?: FavoriteItemType) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<FavoritesResponse>({
    queryKey: ['favorites', itemType],
    queryFn: () => getFavorites(itemType),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get favorites count by type
 */
export const useFavoritesCount = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<FavoritesCountResponse>({
    queryKey: ['favorites', 'count'],
    queryFn: getFavoritesCount,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to toggle favorite status
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    ToggleFavoriteResponse,
    Error,
    { itemType: FavoriteItemType; itemId: number }
  >({
    mutationFn: ({ itemType, itemId }) => toggleFavorite(itemType, itemId),
    onSuccess: () => {
      // Invalidate all favorites queries
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

/**
 * Hook to check if multiple items are favorited
 */
export const useCheckFavorites = (
  items: Array<{ type: FavoriteItemType; id: number }>
) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<FavoritesCheckResponse>({
    queryKey: ['favorites', 'check', items],
    queryFn: () => checkFavorites(items),
    enabled: isAuthenticated && items.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to remove a favorite
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
