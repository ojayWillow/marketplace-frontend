import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTasks } from '@marketplace/shared';
import { getOfferings, getBoostedOfferings, Offering } from '@marketplace/shared';
import { getCategoryIcon } from '../../../constants/categories';
import type { Task, UserLocation } from '@marketplace/shared';

export interface UseTaskDataParams {
  userLocation: UserLocation;
  locationGranted: boolean;
  searchRadius: number;
  category: string;
}

export interface UseTaskDataReturn {
  // Data state
  tasks: Task[];
  offerings: Offering[];
  boostedOfferings: Offering[];
  
  // Loading state
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  hasEverLoaded: boolean;
  
  // Actions
  fetchData: (forceRefresh?: boolean, radiusOverride?: number, categoryOverride?: string) => Promise<void>;
  resetFetchFlag: () => void;
}

// Stable query key generator
const getQueryKey = (
  type: 'tasks' | 'offerings' | 'boosted',
  lat: number,
  lng: number,
  radius: number,
  category: string
) => [type, lat.toFixed(4), lng.toFixed(4), radius, category];

export const useTaskData = ({
  userLocation,
  locationGranted,
  searchRadius,
  category,
}: UseTaskDataParams): UseTaskDataReturn => {
  const { t } = useTranslation();
  
  // Radius 0 means "all of Latvia" - use large radius
  const effectiveRadius = searchRadius === 0 ? 500 : searchRadius;
  const selectedCategory = category !== 'all' ? category : undefined;
  
  const requestParams = {
    latitude: userLocation.lat,
    longitude: userLocation.lng,
    radius: effectiveRadius,
    category: selectedCategory,
  };

  // Tasks query with caching
  const tasksQuery = useQuery({
    queryKey: getQueryKey('tasks', userLocation.lat, userLocation.lng, effectiveRadius, category),
    queryFn: async () => {
      const response = await getTasks({ ...requestParams, status: 'open' });
      return response.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
    },
    enabled: locationGranted,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Offerings query with caching
  const offeringsQuery = useQuery({
    queryKey: getQueryKey('offerings', userLocation.lat, userLocation.lng, effectiveRadius, category),
    queryFn: async () => {
      const response = await getOfferings({ ...requestParams, status: 'active' });
      return response.offerings || [];
    },
    enabled: locationGranted,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Boosted offerings query with caching
  const boostedQuery = useQuery({
    queryKey: getQueryKey('boosted', userLocation.lat, userLocation.lng, effectiveRadius, category),
    queryFn: async () => {
      const response = await getBoostedOfferings(requestParams);
      return response.offerings || [];
    },
    enabled: locationGranted,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Compute loading states
  const initialLoading = tasksQuery.isLoading && !tasksQuery.data;
  const refreshing = tasksQuery.isFetching && !!tasksQuery.data;
  const hasEverLoaded = !!tasksQuery.data;

  // Force refresh function
  const fetchData = async () => {
    await Promise.all([
      tasksQuery.refetch(),
      offeringsQuery.refetch(),
      boostedQuery.refetch(),
    ]);
  };

  // No-op for backward compatibility
  const resetFetchFlag = () => {};

  return {
    // Data (default to empty arrays)
    tasks: (tasksQuery.data || []) as Task[],
    offerings: offeringsQuery.data || [],
    boostedOfferings: boostedQuery.data || [],
    
    // Loading state
    initialLoading,
    refreshing,
    error: tasksQuery.error ? t('tasks.errorLoad', 'Failed to load data. Please try again later.') : null,
    hasEverLoaded,
    
    // Actions
    fetchData,
    resetFetchFlag,
  };
};

export default useTaskData;
