import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites, useRemoveFavorite } from '../../../../hooks/useFavorites';
import { useToastStore, FavoriteItemType, Favorite } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';

type FilterType = 'all' | FavoriteItemType;

const getItemLink = (item: Favorite['item']) => {
  switch (item.type) {
    case 'task': return `/tasks/${item.id}`;
    case 'offering': return `/offerings/${item.id}`;
    case 'listing': return `/listings/${item.id}`;
    default: return '#';
  }
};

const getTypeBadgeColor = (type: FavoriteItemType) => {
  switch (type) {
    case 'task': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'offering': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'listing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

const MAX_VISIBLE = 10;

export const MobileFavoritesSection = () => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading } = useFavorites(
    filter === 'all' ? undefined : filter
  );
  const removeFavorite = useRemoveFavorite();

  const getTypeLabel = (type: FavoriteItemType) => {
    switch (type) {
      case 'task': return t('favorites.typeJob', 'Job');
      case 'offering': return t('favorites.typeService', 'Service');
      case 'listing': return t('favorites.typeListing', 'Listing');
      default: return type;
    }
  };

  const filterTabs: { value: FilterType; label: string; icon: string }[] = [
    { value: 'all', label: t('favorites.filterAll', 'All'), icon: '❤️' },
    { value: 'task', label: t('favorites.filterJobs', 'Jobs'), icon: '💼' },
    { value: 'offering', label: t('favorites.filterServices', 'Services'), icon: '🛠️' },
    { value: 'listing', label: t('favorites.filterListings', 'Listings'), icon: '🏪' },
  ];

  const handleRemove = async (e: React.MouseEvent, favoriteId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite.mutateAsync(favoriteId);
      toast.success(t('favorites.removed', 'Removed from favorites'));
    } catch {
      toast.error(t('favorites.removeFailed', 'Failed to remove'));
    }
  };

  const favorites = data?.favorites || [];
  const total = data?.total || 0;
  const displayFavorites = favorites.slice(0, MAX_VISIBLE);
  const hasMore = total > MAX_VISIBLE;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      {/* Header — tap to collapse/expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-1.5">
          <span className="text-red-500">❤️</span>
          {t('favorites.title', 'Favorites')}
          {total > 0 && (
            <span className="text-gray-400 dark:text-gray-500 font-normal">({total})</span>
          )}
        </h3>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <>
          {/* Filter pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  flex items-center gap-1
                  ${filter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && favorites.length === 0 && (
            <div className="text-center py-5">
              <span className="text-2xl">💔</span>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {filter === 'all'
                  ? t('favorites.empty', 'No favorites yet')
                  : t('favorites.emptyFilter', 'No {{type}} saved', {
                      type: getTypeLabel(filter as FavoriteItemType).toLowerCase() + 's',
                    })}
              </p>
            </div>
          )}

          {/* Favorites list */}
          {!isLoading && favorites.length > 0 && (
            <div className="space-y-1">
              {displayFavorites.map((fav) => (
                <Link
                  key={fav.favorite_id}
                  to={getItemLink(fav.item)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  {/* Type badge (compact) */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${getTypeBadgeColor(fav.item.type)}`}>
                    {fav.item.type === 'task' ? '💼' : fav.item.type === 'offering' ? '🛠️' : '🏪'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeBadgeColor(fav.item.type)}`}>
                        {getTypeLabel(fav.item.type)}
                      </span>
                      {fav.item.category && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                          {getCategoryIcon(fav.item.category)} {t(`tasks.categories.${fav.item.category}`, getCategoryLabel(fav.item.category))}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {fav.item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {fav.item.location && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          📍 {fav.item.location.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(fav.item.budget || fav.item.price) && (
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        €{fav.item.budget || fav.item.price}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleRemove(e, fav.favorite_id)}
                      className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title={t('favorites.remove', 'Remove')}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* See all link */}
          {hasMore && (
            <Link
              to="/favorites"
              className="block w-full mt-3 py-2 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('favorites.seeAll', 'See all {{count}} favorites →', { count: total })}
            </Link>
          )}
        </>
      )}
    </div>
  );
};
