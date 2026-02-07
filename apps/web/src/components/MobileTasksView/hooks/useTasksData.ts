import { useState, useEffect, useMemo, useRef } from 'react';
import { getTasks } from '@marketplace/shared';
import { getCategoryIcon } from '../../../constants/categories';
import { calculateDistance } from '../utils/distance';
import { Task } from '../types';

const MAX_CATEGORIES = 5;

interface UseTasksDataOptions {
  userLocation: { lat: number; lng: number };
}

/**
 * Hook managing task data: fetching, filtering, sorting, and category/radius state.
 */
export const useTasksData = ({ userLocation }: UseTasksDataOptions) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const hasFetchedInitial = useRef(false);

  // Fetch tasks — supports multiple categories
  const fetchTasks = async (
    lat: number,
    lng: number,
    radius: number,
    categories: string[]
  ) => {
    setLoading(true);
    try {
      const effectiveRadius = radius === 0 ? 500 : radius;

      if (categories.length === 0) {
        const response = await getTasks({
          latitude: lat,
          longitude: lng,
          radius: effectiveRadius,
          status: 'open',
        });
        const tasksWithIcons = response.tasks.map((task) => ({
          ...task,
          icon: getCategoryIcon(task.category),
        }));
        setTasks(tasksWithIcons);
      } else {
        const allTasks: Task[] = [];
        const taskIds = new Set<string>();

        for (const category of categories) {
          const response = await getTasks({
            latitude: lat,
            longitude: lng,
            radius: effectiveRadius,
            status: 'open',
            category,
          });

          response.tasks.forEach((task) => {
            if (!taskIds.has(task.id)) {
              taskIds.add(task.id);
              allTasks.push({
                ...task,
                icon: getCategoryIcon(task.category),
              });
            }
          });
        }

        setTasks(allTasks);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    }
    setLoading(false);
  };

  // Initial fetch with default location + saved radius
  const initializeFetch = (lat: number, lng: number) => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;

    const savedRadius = localStorage.getItem('taskSearchRadius');
    const initialRadius = savedRadius ? parseInt(savedRadius, 10) : 25;
    if (savedRadius) setSearchRadius(initialRadius);

    fetchTasks(lat, lng, initialRadius, []);
  };

  // Refetch when user location updates (after geolocation resolves)
  const refetchAtLocation = (lat: number, lng: number) => {
    fetchTasks(lat, lng, searchRadius, selectedCategories);
  };

  // Refetch when filters change (but not on initial mount)
  useEffect(() => {
    if (!hasFetchedInitial.current) return;
    fetchTasks(userLocation.lat, userLocation.lng, searchRadius, selectedCategories);
  }, [searchRadius, selectedCategories]);

  // Filter and sort tasks by distance (closest first)
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

  // Handlers
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  };

  const handleCategoryToggle = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryValue));
    } else {
      if (selectedCategories.length < MAX_CATEGORIES) {
        setSelectedCategories([...selectedCategories, categoryValue]);
      }
    }
  };

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
    MAX_CATEGORIES,
  };
};
