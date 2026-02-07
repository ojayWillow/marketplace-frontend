import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTasks, getOfferings } from '@marketplace/shared';
import { CATEGORIES } from '../constants/categories';
import { calculateDistance, formatDistance } from '../components/MobileTasksView/utils/distance';
import FilterSheet from '../components/MobileTasksView/components/FilterSheet';

type MainTab = 'all' | 'jobs' | 'services';

interface WorkItem {
  id: string;
  type: 'job' | 'service';
  title: string;
  description?: string;
  category: string;
  budget?: number;
  price?: number;
  creator_name?: string;
  created_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  difficulty?: string;
  creator_rating?: number;
  creator_review_count?: number;
}

const MAX_CATEGORIES = 5;
const LOCATION_TIMEOUT_MS = 3000;

// --- Pure utility functions (no state dependency) ---

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDifficultyColor = (difficulty?: string): string => {
  const diff = difficulty?.toLowerCase();
  if (diff === 'easy') return 'text-green-600';
  if (diff === 'hard') return 'text-red-600';
  return 'text-yellow-600';
};

const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

const mapTask = (task: any): WorkItem => ({
  id: task.id,
  type: 'job',
  title: task.title,
  description: task.description,
  category: task.category,
  budget: task.budget || task.reward,
  creator_name: task.creator_name,
  created_at: task.created_at,
  location: task.location,
  latitude: task.latitude,
  longitude: task.longitude,
  difficulty: task.difficulty,
  creator_rating: task.creator_rating,
  creator_review_count: task.creator_review_count,
});

const mapOffering = (offering: any): WorkItem => ({
  id: offering.id,
  type: 'service',
  title: offering.title,
  description: offering.description,
  category: offering.category,
  price: offering.price,
  creator_name: offering.creator_name,
  created_at: offering.created_at,
  location: offering.location,
  latitude: offering.latitude,
  longitude: offering.longitude,
  difficulty: offering.difficulty,
  creator_rating: offering.creator_rating,
  creator_review_count: offering.creator_review_count,
});

// --- Skeleton loader for perceived performance ---

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-l-4 border-l-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="w-16 h-3 bg-gray-200 rounded" />
      </div>
      <div className="w-12 h-5 bg-gray-200 rounded" />
    </div>
    <div className="w-3/4 h-4 bg-gray-200 rounded mb-3" />
    <div className="flex gap-2 mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex flex-col justify-center gap-1 flex-1">
        <div className="w-24 h-3 bg-gray-200 rounded" />
        <div className="w-32 h-3 bg-gray-100 rounded" />
      </div>
    </div>
    <div className="w-full h-3 bg-gray-100 rounded mb-1" />
    <div className="w-2/3 h-3 bg-gray-100 rounded mb-3" />
    <div className="flex items-center justify-between">
      <div className="w-14 h-3 bg-gray-200 rounded" />
      <div className="w-14 h-3 bg-gray-200 rounded" />
      <div className="w-14 h-3 bg-gray-200 rounded" />
    </div>
  </div>
);

// --- Main component ---

const WorkPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // --- Geolocation: runs in background, never blocks data ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    const timeoutId = setTimeout(() => {
      // Geolocation took too long — distances stay as "📍" until/if it resolves
    }, LOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(timeoutId);
        // Permission denied — distances will show location name instead
      },
      { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  // --- Data fetching: no location dependency ---
  const fetchData = useCallback(async (tab: MainTab, categories: string[]) => {
    setLoading(true);

    try {
      const fetchJobs = async (): Promise<WorkItem[]> => {
        if (tab === 'services') return [];
        const response = categories.length === 0
          ? await getTasks({ status: 'open' })
          : await Promise.all(
              categories.map((cat) => getTasks({ status: 'open', category: cat }))
            ).then((res) => ({ tasks: res.flatMap((r) => r.tasks) }));
        return response.tasks.map(mapTask);
      };

      const fetchServices = async (): Promise<WorkItem[]> => {
        if (tab === 'jobs') return [];
        const response = categories.length === 0
          ? await getOfferings({ status: 'active' })
          : await Promise.all(
              categories.map((cat) => getOfferings({ status: 'active', category: cat }))
            ).then((res) => ({ offerings: res.flatMap((r) => r.offerings) }));
        return response.offerings.map(mapOffering);
      };

      // Parallel fetch — both run at the same time on "all" tab
      const [jobs, services] = await Promise.all([fetchJobs(), fetchServices()]);

      const allItems = [...jobs, ...services];
      const uniqueItems = Array.from(
        new Map(allItems.map((item) => [item.id, item])).values()
      );
      uniqueItems.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(uniqueItems);
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    }

    setLoading(false);
  }, []);

  // Fetch immediately on mount, and when tab/filters change
  useEffect(() => {
    fetchData(mainTab, selectedCategories);
  }, [mainTab, selectedCategories, fetchData]);

  // --- Distance computation: derived via useMemo, always up-to-date ---
  const itemsWithDistance = useMemo(() => {
    if (!userLocation) return items.map((item) => ({ ...item, distance: undefined as number | undefined }));

    return items.map((item) => {
      if (!item.latitude || !item.longitude) return { ...item, distance: undefined as number | undefined };
      return {
        ...item,
        distance: calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude),
      };
    });
  }, [items, userLocation]);

  // --- Handlers ---
  const handleCategoryToggle = useCallback((categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) return prev.filter((c) => c !== categoryValue);
      if (prev.length < MAX_CATEGORIES) return [...prev, categoryValue];
      return prev;
    });
  }, []);

  const handleItemClick = useCallback(
    (item: WorkItem) => {
      navigate(item.type === 'job' ? `/tasks/${item.id}` : `/offerings/${item.id}`);
    },
    [navigate]
  );

  const getCategoryInfo = useCallback((categoryKey: string) => {
    return CATEGORIES.find((c) => c.value === categoryKey) || { icon: '📋', label: categoryKey };
  }, []);

  const formatItemDistance = useCallback(
    (distance: number | undefined, location?: string) => {
      if (distance !== undefined) return formatDistance(distance);
      if (location) return `📍 ${location.split(',')[0]}`;
      return '📍';
    },
    []
  );

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Reuse FilterSheet from MobileTasksView */}
      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        searchRadius={0}
        onRadiusChange={() => {}}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        maxCategories={MAX_CATEGORIES}
      />

      {/* Sticky tab bar */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex gap-2 flex-1">
            {(['all', 'jobs', 'services'] as MainTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mainTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t(
                  `tasks.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
                  tab === 'all' ? 'All' : tab === 'jobs' ? 'Jobs' : 'Services'
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full relative flex-shrink-0 ml-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            {selectedCategories.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : itemsWithDistance.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('work.noItems', 'No items found')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('work.tryDifferentFilters', 'Try different filters or check back later')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itemsWithDistance.map((item) => {
              const category = getCategoryInfo(item.category);
              const price = item.type === 'job' ? item.budget : item.price;
              const timeAgo = item.created_at ? formatTimeAgo(item.created_at) : '';
              const isUrgent = (item as any).is_urgent;
              const hasReviews = item.creator_review_count && item.creator_review_count > 0;
              const difficultyColor = getDifficultyColor(item.difficulty);
              const distanceText = formatItemDistance(item.distance, item.location);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                    item.type === 'job' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{category.label}</span>
                    </div>
                    {isUrgent && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        🔥 Urgent
                      </span>
                    )}
                    {price && (
                      <span
                        className={`text-lg font-bold ${
                          item.type === 'job' ? 'text-blue-600' : 'text-amber-600'
                        }`}
                      >
                        €{price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 truncate mb-3">{item.title}</h3>

                  <div className="flex gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 self-start">
                      {(item.creator_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col justify-center gap-0.5 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {item.creator_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {hasReviews ? (
                          <>
                            <span className="text-yellow-500 leading-none">
                              {renderStars(item.creator_rating || 0)}
                            </span>
                            <span className="text-gray-400">({item.creator_review_count})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">New user</span>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 truncate">
                          📍 {item.location?.split(',')[0] || 'Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">📏 {distanceText}</span>
                    <span className={`font-semibold ${difficultyColor}`}>
                      ⚡ {item.difficulty || 'Medium'}
                    </span>
                    <span className="text-gray-400">{timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
