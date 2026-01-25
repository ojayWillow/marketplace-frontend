import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks, getOfferings, type Task, type Offering } from '@marketplace/shared';
import { calculateDistance } from '../constants';
import { MainTab } from '../constants';

type ListItem = 
  | { type: 'job'; data: Task; id: string }
  | { type: 'service'; data: Offering; id: string };

interface UseTasksDataProps {
  mainTab: MainTab;
  selectedCategory: string;
  selectedDifficulty: string | null;
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
}

export function useTasksData({
  mainTab,
  selectedCategory,
  selectedDifficulty,
  userLocation,
  hasRealLocation,
}: UseTasksDataProps) {
  // Browse Jobs query - only open jobs - LOAD ALL
  const jobsQuery = useQuery({
    queryKey: ['tasks-browse'],
    queryFn: () => getTasks({ page: 1, per_page: 500, status: 'open' }),
    enabled: mainTab === 'jobs' || mainTab === 'all',
  });

  // Browse Services query - all active services - LOAD ALL
  const servicesQuery = useQuery({
    queryKey: ['services-browse'],
    queryFn: () => getOfferings({ page: 1, per_page: 500 }),
    enabled: mainTab === 'services' || mainTab === 'all',
  });

  const allTasks = jobsQuery.data?.tasks || [];
  const allOfferings = servicesQuery.data?.offerings || [];

  // Filter and add distance to tasks
  const tasks = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? allTasks 
      : allTasks.filter(t => t.category === selectedCategory);
    
    if (selectedDifficulty) {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
    }
    
    if (hasRealLocation) {
      filtered = filtered.map(task => {
        if (task.latitude && task.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            task.latitude,
            task.longitude
          );
          return { ...task, distance };
        }
        return task;
      });
    }
    
    return filtered;
  }, [allTasks, selectedCategory, selectedDifficulty, userLocation, hasRealLocation]);
  
  const offerings = useMemo(() => 
    selectedCategory === 'all'
      ? allOfferings
      : allOfferings.filter(o => o.category === selectedCategory),
    [allOfferings, selectedCategory]
  );

  // Prepare data for FlatList based on active tab
  const listData = useMemo((): ListItem[] => {
    if (mainTab === 'all') {
      const jobItems: ListItem[] = tasks.map(task => ({
        type: 'job' as const,
        data: task,
        id: `job-${task.id}`,
      }));
      
      const serviceItems: ListItem[] = offerings.map(offering => ({
        type: 'service' as const,
        data: offering,
        id: `service-${offering.id}`,
      }));
      
      return [...jobItems, ...serviceItems].sort((a, b) => {
        const aDate = new Date(a.type === 'job' ? a.data.created_at : a.data.created_at || 0).getTime();
        const bDate = new Date(b.type === 'job' ? b.data.created_at : b.data.created_at || 0).getTime();
        return bDate - aDate;
      });
    } else if (mainTab === 'jobs') {
      return tasks.map(task => ({
        type: 'job' as const,
        data: task,
        id: `task-${task.id}`,
      }));
    } else {
      return offerings.map(offering => ({
        type: 'service' as const,
        data: offering,
        id: `offering-${offering.id}`,
      }));
    }
  }, [mainTab, tasks, offerings]);

  const isLoading = mainTab === 'all' 
    ? (jobsQuery.isLoading || servicesQuery.isLoading)
    : mainTab === 'jobs' 
      ? jobsQuery.isLoading 
      : servicesQuery.isLoading;
      
  const isError = mainTab === 'all'
    ? (jobsQuery.isError && servicesQuery.isError)
    : mainTab === 'jobs'
      ? jobsQuery.isError
      : servicesQuery.isError;

  const isRefetching = mainTab === 'all'
    ? (jobsQuery.isRefetching || servicesQuery.isRefetching)
    : mainTab === 'jobs'
      ? jobsQuery.isRefetching
      : servicesQuery.isRefetching;
      
  const refetch = useCallback(() => {
    if (mainTab === 'all' || mainTab === 'jobs') jobsQuery.refetch();
    if (mainTab === 'all' || mainTab === 'services') servicesQuery.refetch();
  }, [mainTab, jobsQuery, servicesQuery]);

  return {
    listData,
    tasks,
    offerings,
    isLoading,
    isError,
    isRefetching,
    refetch,
  };
}

export type { ListItem };
