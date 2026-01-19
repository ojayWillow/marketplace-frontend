/**
 * Favorites Store - Batched favorites checking to reduce API calls
 * 
 * Instead of each FavoriteButton making individual API calls,
 * this store collects all requests and batches them into a single call.
 */

import { create } from 'zustand';
import { checkFavorites, FavoriteItemType } from '../api/favorites';

interface FavoriteItem {
  type: FavoriteItemType;
  id: number;
}

interface FavoritesState {
  // Cache of checked favorites: "task:123" -> true/false
  cache: Map<string, boolean>;
  // Pending items to check (batched)
  pending: Map<string, FavoriteItem>;
  // Loading state
  isLoading: boolean;
  // Batch timeout ID
  batchTimeoutId: NodeJS.Timeout | null;
  
  // Actions
  checkFavorite: (type: FavoriteItemType, id: number) => Promise<boolean>;
  setFavorite: (type: FavoriteItemType, id: number, isFavorited: boolean) => void;
  clearCache: () => void;
}

const BATCH_DELAY_MS = 50; // Wait 50ms to collect all requests

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  cache: new Map(),
  pending: new Map(),
  isLoading: false,
  batchTimeoutId: null,

  checkFavorite: async (type: FavoriteItemType, id: number): Promise<boolean> => {
    const key = `${type}:${id}`;
    const { cache, pending, batchTimeoutId } = get();

    // Return cached value if available
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Add to pending batch
    pending.set(key, { type, id });

    // Clear existing timeout and set new one
    if (batchTimeoutId) {
      clearTimeout(batchTimeoutId);
    }

    // Return a promise that resolves when batch completes
    return new Promise((resolve) => {
      const newTimeoutId = setTimeout(async () => {
        const { pending: currentPending, cache: currentCache } = get();
        
        if (currentPending.size === 0) {
          resolve(false);
          return;
        }

        set({ isLoading: true, batchTimeoutId: null });

        try {
          // Convert pending map to array
          const items = Array.from(currentPending.values());
          
          // Clear pending before API call
          set({ pending: new Map() });

          // Make single batched API call
          const result = await checkFavorites(items);

          // Update cache with results
          const newCache = new Map(currentCache);
          for (const [itemKey, isFavorited] of Object.entries(result.favorites)) {
            newCache.set(itemKey, isFavorited);
          }

          set({ cache: newCache, isLoading: false });

          // Resolve with the value for this specific item
          resolve(newCache.get(key) ?? false);
        } catch (error) {
          console.error('Error batch checking favorites:', error);
          set({ isLoading: false });
          resolve(false);
        }
      }, BATCH_DELAY_MS);

      set({ batchTimeoutId: newTimeoutId });
    });
  },

  setFavorite: (type: FavoriteItemType, id: number, isFavorited: boolean) => {
    const key = `${type}:${id}`;
    const { cache } = get();
    const newCache = new Map(cache);
    newCache.set(key, isFavorited);
    set({ cache: newCache });
  },

  clearCache: () => {
    set({ cache: new Map(), pending: new Map() });
  },
}));
