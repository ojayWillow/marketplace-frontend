/**
 * Favorites page - Shows all user's saved/favorited items
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { FavoriteItemType, Favorite } from '../api/favorites';
import { getImageUrl } from '../api/uploads';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type FilterType = 'all' | FavoriteItemType;

export default function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [filter, setFilter] = useState<FilterType>('all');
  
  const { data, isLoading, isError } = useFavorites(
    filter === 'all' ? undefined : filter
  );
  const removeFavorite = useRemoveFavorite();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to view your saved favorites
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      await removeFavorite.mutateAsync(favoriteId);
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const getItemLink = (item: Favorite['item']) => {
    switch (item.type) {
      case 'task':
        return `/tasks/${item.id}`;
      case 'offering':
        return `/offerings/${item.id}`;
      case 'listing':
        return `/listings/${item.id}`;
      default:
        return '#';
    }
  };

  const getTypeLabel = (type: FavoriteItemType) => {
    switch (type) {
      case 'task':
        return 'Job';
      case 'offering':
        return 'Service';
      case 'listing':
        return 'Listing';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: FavoriteItemType) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-700';
      case 'offering':
        return 'bg-green-100 text-green-700';
      case 'listing':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filterTabs: { value: FilterType; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '❤️' },
    { value: 'task', label: 'Jobs', icon: '💼' },
    { value: 'offering', label: 'Services', icon: '🛠️' },
    { value: 'listing', label: 'Listings', icon: '🏪' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-red-500">❤️</span>
            My Favorites
          </h1>
          <p className="text-gray-600 mt-2">
            Items you've saved for later
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                flex items-center gap-2
                ${filter === tab.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner className="py-16" size="lg" />
        ) : isError ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-600">Failed to load favorites</p>
          </div>
        ) : !data || data.favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't saved any items yet. Browse jobs, services, or listings and click the heart icon to save them!"
                : `You haven't saved any ${getTypeLabel(filter as FavoriteItemType).toLowerCase()}s yet.`}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/tasks"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💼 Browse Jobs
              </Link>
              <Link
                to="/tasks?tab=offerings"
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🛠️ Browse Services
              </Link>
              <Link
                to="/listings"
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🏪 Browse Listings
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-gray-600 mb-4">
              {data.total} {data.total === 1 ? 'item' : 'items'} saved
            </p>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.favorites.map((favorite) => (
                <div
                  key={favorite.favorite_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Card Header with Type Badge */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                              favorite.item.type
                            )}`}
                          >
                            {getTypeLabel(favorite.item.type)}
                          </span>
                          {favorite.item.category && (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              {getCategoryIcon(favorite.item.category)}
                              {getCategoryLabel(favorite.item.category)}
                            </span>
                          )}
                        </div>
                        <Link
                          to={getItemLink(favorite.item)}
                          className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 block"
                        >
                          {favorite.item.title}
                        </Link>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.favorite_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <Link to={getItemLink(favorite.item)} className="block p-4">
                    {/* Description */}
                    {favorite.item.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {favorite.item.description}
                      </p>
                    )}

                    {/* Price/Budget */}
                    <div className="flex items-center justify-between">
                      {(favorite.item.budget || favorite.item.price) && (
                        <span className="text-lg font-bold text-green-600">
                          €{favorite.item.budget || favorite.item.price}
                          {favorite.item.price_type === 'hourly' && (
                            <span className="text-sm font-normal text-gray-500">/hr</span>
                          )}
                        </span>
                      )}

                      {/* Status badges */}
                      <div className="flex items-center gap-2">
                        {favorite.item.is_urgent && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            ⚡ Urgent
                          </span>
                        )}
                        {favorite.item.status && favorite.item.status !== 'open' && favorite.item.status !== 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                            {favorite.item.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {favorite.item.location && (
                      <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                        <span>📍</span>
                        {favorite.item.location}
                      </p>
                    )}
                  </Link>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Saved {new Date(favorite.favorited_at).toLocaleDateString()}
                      </span>
                      <Link
                        to={getItemLink(favorite.item)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
