import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTasks } from '../../../api/tasks';
import { getOfferings, getBoostedOfferings, Offering } from '../../../api/offerings';
import { getCategoryIcon } from '../../../constants/categories';
import type { Task, UserLocation } from '../types';

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

export const useTaskData = ({
  userLocation,
  locationGranted,
  searchRadius,
  category,
}: UseTaskDataParams): UseTaskDataReturn => {
  const { t } = useTranslation();
  
  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [boostedOfferings, setBoostedOfferings] = useState<Offering[]>([]);
  
  // Loading state
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for fetch control
  const hasFetchedRef = useRef(false);
  const hasEverLoadedRef = useRef(false);

  const resetFetchFlag = useCallback(() => {
    hasFetchedRef.current = false;
  }, []);

  const fetchData = useCallback(async (
    forceRefresh = false, 
    radiusOverride?: number, 
    categoryOverride?: string
  ) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    // Show initial loading only on first load, otherwise show refresh indicator
    if (!hasEverLoadedRef.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const baseRadius = radiusOverride ?? searchRadius;
      const selectedCategory = categoryOverride ?? category;
      // Radius 0 means "all of Latvia" - use large radius
      const effectiveRadius = baseRadius === 0 ? 500 : baseRadius;
      
      // Fetch tasks
      const tasksResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: effectiveRadius,
        status: 'open',
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      const tasksWithIcons = tasksResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      
      // Fetch offerings (non-blocking errors)
      try {
        const offeringsResponse = await getOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          status: 'active',
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setOfferings(offeringsResponse.offerings || []);
      } catch {
        setOfferings([]);
      }
      
      // Fetch boosted offerings (non-blocking errors)
      try {
        const boostedResponse = await getBoostedOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setBoostedOfferings(boostedResponse.offerings || []);
      } catch {
        setBoostedOfferings([]);
      }
      
      hasFetchedRef.current = true;
      hasEverLoadedRef.current = true;
    } catch {
      setError(t('tasks.errorLoad', 'Failed to load data. Please try again later.'));
    }
    
    setInitialLoading(false);
    setRefreshing(false);
  }, [userLocation.lat, userLocation.lng, searchRadius, category, t]);

  // Fetch data when location is granted
  useEffect(() => {
    if (locationGranted) {
      fetchData();
    }
  }, [locationGranted]);

  return {
    // Data
    tasks,
    offerings,
    boostedOfferings,
    
    // Loading state
    initialLoading,
    refreshing,
    error,
    hasEverLoaded: hasEverLoadedRef.current,
    
    // Actions
    fetchData,
    resetFetchFlag,
  };
};

export default useTaskData;
