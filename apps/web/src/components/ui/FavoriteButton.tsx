/**
 * FavoriteButton - A reusable heart button for favoriting items
 * Uses batched favorites store to minimize API calls
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useToggleFavorite } from '../../hooks/useFavorites';
import { FavoriteItemType } from '../../api/favorites';

interface FavoriteButtonProps {
  itemType: FavoriteItemType;
  itemId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  initialFavorited?: boolean;
}

export default function FavoriteButton({
  itemType,
  itemId,
  className = '',
  size = 'md',
  showText = false,
  initialFavorited
}: FavoriteButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const toggleFavorite = useToggleFavorite();
  const { checkFavorite, setFavorite, cache } = useFavoritesStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(initialFavorited !== undefined);

  // Get favorite status from cache or initial value
  const cacheKey = `${itemType}:${itemId}`;
  const cachedValue = cache.get(cacheKey);
  const isFavorited = cachedValue ?? initialFavorited ?? false;

  // Check initial favorite status using batched store
  useEffect(() => {
    if (!isAuthenticated || hasChecked || initialFavorited !== undefined) return;

    // Use batched check - this will be combined with other checks
    checkFavorite(itemType, itemId).then(() => {
      setHasChecked(true);
    });
  }, [isAuthenticated, itemType, itemId, hasChecked, initialFavorited, checkFavorite]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleFavorite.mutateAsync({ itemType, itemId });
      // Update the store cache
      setFavorite(itemType, itemId, result.is_favorited);
      toast.success(result.message);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center gap-1
        rounded-full transition-all duration-200
        ${isFavorited
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${showText ? 'px-3 py-1.5' : sizeClasses[size]}
        shadow-sm hover:shadow
        ${className}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <svg
          className={`animate-spin ${iconSizeClasses[size]}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className={iconSizeClasses[size]}
          fill={isFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {showText && (
        <span className="text-sm font-medium">
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
