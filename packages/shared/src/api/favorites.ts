/**
 * Favorites API client for managing saved items
 */

import apiClient from './client';

export type FavoriteItemType = 'task' | 'offering' | 'listing';

export interface FavoriteItem {
  id: number;
  type: FavoriteItemType;
  title: string;
  description?: string;
  category?: string;
  budget?: number;
  price?: number;
  price_type?: string;
  location?: string;
  status?: string;
  is_urgent?: boolean;
  deadline?: string;
  images?: string;
  created_at?: string;
  creator_name?: string;
  creator_id?: number;
  creator_avatar?: string;
  seller_name?: string;
  seller_id?: number;
}

export interface Favorite {
  favorite_id: number;
  favorited_at: string;
  item: FavoriteItem;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

export interface ToggleFavoriteResponse {
  is_favorited: boolean;
  message: string;
  favorite?: {
    id: number;
    user_id: number;
    item_type: FavoriteItemType;
    item_id: number;
    created_at: string;
  };
}

export interface FavoritesCheckResponse {
  favorites: Record<string, boolean>;
}

export interface FavoritesCountResponse {
  total: number;
  tasks: number;
  offerings: number;
  listings: number;
}

/**
 * Toggle favorite status for an item (add if not favorited, remove if already favorited)
 */
export const toggleFavorite = async (
  itemType: FavoriteItemType,
  itemId: number
): Promise<ToggleFavoriteResponse> => {
  const response = await apiClient.post('/api/favorites', {
    item_type: itemType,
    item_id: itemId
  });
  return response.data;
};

/**
 * Get all favorites for the current user
 */
export const getFavorites = async (
  itemType?: FavoriteItemType
): Promise<FavoritesResponse> => {
  const params = itemType ? { type: itemType } : {};
  const response = await apiClient.get('/api/favorites', { params });
  return response.data;
};

/**
 * Check if multiple items are favorited
 * @param items Array of { type, id } objects to check
 */
export const checkFavorites = async (
  items: Array<{ type: FavoriteItemType; id: number }>
): Promise<FavoritesCheckResponse> => {
  const itemsParam = items.map(item => `${item.type}:${item.id}`).join(',');
  const response = await apiClient.get('/api/favorites/check', {
    params: { items: itemsParam }
  });
  return response.data;
};

/**
 * Remove a favorite by its ID
 */
export const removeFavorite = async (favoriteId: number): Promise<void> => {
  await apiClient.delete(`/api/favorites/${favoriteId}`);
};

/**
 * Remove a favorite by item type and ID
 */
export const removeFavoriteByItem = async (
  itemType: FavoriteItemType,
  itemId: number
): Promise<void> => {
  await apiClient.delete(`/api/favorites/item/${itemType}/${itemId}`);
};

/**
 * Get count of user's favorites by type
 */
export const getFavoritesCount = async (): Promise<FavoritesCountResponse> => {
  const response = await apiClient.get('/api/favorites/count');
  return response.data;
};
