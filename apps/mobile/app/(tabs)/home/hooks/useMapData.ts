import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks, getOfferings, searchTasks, type Task, type Offering } from '@marketplace/shared';
import { calculateDistance } from '../utils/distance';
import type { UserLocation } from './useLocation';

interface UseMapDataOptions {
  userLocation: UserLocation | null;
}

export const useMapData = ({ userLocation }: UseMapDataOptions) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setDebouncedSearchQuery('');
      return;
    }
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // Main tasks query
  const tasksQuery = useQuery({
    queryKey: ['tasks-home'],
    queryFn: async () => {
      return await getTasks({ page: 1, per_page: 100, status: 'open' });
    },
    staleTime: 30000,
  });

  // Search query
  const searchQueryResult = useQuery({
    queryKey: ['tasks-search', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return null;
      return await searchTasks({ q: debouncedSearchQuery, page: 1, per_page: 100, status: 'open' });
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 10000,
  });

  // Offerings query
  const offeringsQuery = useQuery({
    queryKey: ['offerings-map'],
    queryFn: async () => {
      return await getOfferings({ page: 1, per_page: 100, status: 'active' });
    },
    staleTime: 30000,
  });

  // All tasks (from search or main query)
  const allTasks = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchQueryResult.data?.tasks) {
      return searchQueryResult.data.tasks;
    }
    if (debouncedSearchQuery.trim() && searchQueryResult.isFetching) {
      return [];
    }
    return tasksQuery.data?.tasks || [];
  }, [debouncedSearchQuery, searchQueryResult.data, searchQueryResult.isFetching, tasksQuery.data]);

  // All offerings
  const offerings = offeringsQuery.data?.offerings || [];
  
  // Boosted offerings (for map display)
  const boostedOfferings = useMemo(() => {
    return offerings.filter(
      o => o.is_boost_active && o.latitude && o.longitude
    );
  }, [offerings]);

  // Filtered tasks (by category and radius)
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      
      if (selectedRadius && userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.latitude,
          task.longitude
        );
        if (distance > selectedRadius) {
          return false;
        }
      }
      
      return true;
    });
  }, [allTasks, selectedCategory, selectedRadius, userLocation]);

  // Sorted tasks (by distance from user)
  const sortedTasks = useMemo(() => {
    if (!userLocation) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
  }, [filteredTasks, userLocation]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  return {
    // Data
    allTasks,
    filteredTasks,
    sortedTasks,
    offerings,
    boostedOfferings,
    
    // Filters
    selectedCategory,
    setSelectedCategory,
    selectedRadius,
    setSelectedRadius,
    
    // Search
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    clearSearch,
    
    // Loading states
    isLoading: tasksQuery.isLoading && !debouncedSearchQuery,
    isError: tasksQuery.isError,
    isSearchFetching: searchQueryResult.isFetching,
    
    // Actions
    refetch: tasksQuery.refetch,
  };
};
