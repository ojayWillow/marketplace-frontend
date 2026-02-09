import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks } from '@marketplace/shared';
import { getCategoryIcon } from '../../../constants/categories';
import { calculateDistance } from '../utils/distance';
import { Task } from '../types';

const MAX_CATEGORIES = 5;
const DEFAULT_MIN_RESULTS = 5;

// React Query cache settings — survive tab switches
const STALE_TIME = 60 * 1000; // 60s: data is "fresh" for 1 min (no refetch)
const GC_TIME = 5 * 60 * 1000; // 5min: cache lives for 5 min even after unmount

interface UseTasksDataOptions {
  userLocation: { lat: number; lng: number };
}

/**
 * Mobile tasks data hook — powered by React Query.
 *
 * Key behaviors:
 * - Cached data survives tab switches (staleTime=60s, gcTime=5min)
 * - No spinner for cached data — shows stale content with background refresh
 * - Single API call with comma-separated categories
 * - Backend auto-expands radius via min_results param
 */
export const useTasksData = ({ userLocation }: UseTasksDataOptions) => {
  const queryClient = useQueryClient();

  const [searchRadius, setSearchRadius] = useState(() => {
    const saved = localStorage.getItem('taskSearchRadius');
    return saved ? parseInt(saved, 10) : 25;
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [effectiveRadius, setEffectiveRadius] = useState<number | null>(null);
  const [radiusExpanded, setRadiusExpanded] = useState(false);

  // Track if initial fetch has been triggered (for location callbacks)
  const hasFetchedInitial = useRef(false);

  const effectiveRequestRadius = searchRadius === 0 ? 500 : searchRadius;
  const categoryParam = selectedCategories.length > 0
    ? selectedCategories.join(',')
    : undefined;

  // Stable query key — changes trigger new fetch
  const queryKey = [
    'mobile-tasks',
    userLocation.lat.toFixed(4),
    userLocation.lng.toFixed(4),
    effectiveRequestRadius,
    categoryParam || 'all',
  ];

  const tasksQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: effectiveRequestRadius,
        status: 'open',
        min_results: DEFAULT_MIN_RESULTS,
        ...(categoryParam && { category: categoryParam }),
      });

      // Track backend's effective radius
      if (response.effective_radius != null) {
        setEffectiveRadius(response.effective_radius);
      }
      setRadiusExpanded(response.radius_expanded ?? false);

      return response.tasks.map((task) => ({
        ...task,
        icon: getCategoryIcon(task.category),
      }));
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    // Keep previous data while new query loads (smooth filter transitions)
    placeholderData: (prev) => prev,
  });

  const tasks = (tasksQuery.data || []) as Task[];
  // Show loading only when there's no cached data at all
  const loading = tasksQuery.isLoading && !tasksQuery.data;

  // Filter and sort tasks by distance (closest first) — client-side, instant
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      const distanceA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      );
      const distanceB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      );
      return distanceA - distanceB;
    });
  }, [tasks, searchQuery, userLocation]);

  // --- Callbacks for location hook compatibility ---

  const initializeFetch = useCallback((_lat: number, _lng: number) => {
    // React Query handles fetching via queryKey changes.
    // This is kept for useUserLocation callback compatibility.
    hasFetchedInitial.current = true;
  }, []);

  const refetchAtLocation = useCallback((_lat: number, _lng: number) => {
    // Location change updates userLocation prop → queryKey changes → auto-refetch.
    // Force invalidate to ensure fresh data at new location.
    queryClient.invalidateQueries({ queryKey: ['mobile-tasks'] });
  }, [queryClient]);

  // Handlers
  const handleRadiusChange = useCallback((newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  }, []);

  const handleCategoryToggle = useCallback((categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        return prev.filter((c) => c !== categoryValue);
      }
      if (prev.length < MAX_CATEGORIES) {
        return [...prev, categoryValue];
      }
      return prev;
    });
  }, []);

  return {
    tasks,
    loading,
    filteredTasks,
    searchRadius,
    selectedCategories,
    searchQuery,
    setSearchQuery,
    handleRadiusChange,
    handleCategoryToggle,
    initializeFetch,
    refetchAtLocation,
    effectiveRadius,
    radiusExpanded,
    MAX_CATEGORIES,
  };
};
