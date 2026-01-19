import { useState, useCallback, useMemo } from 'react';
import { filterByDate, filterByPrice } from '../../../components/ui/AdvancedFilters';
import type { CompactFilterValues } from '../../../components/ui/CompactFilterBar';
import type { Offering } from '@marketplace/shared';
import type { Task } from '@marketplace/shared';

// Default filter values
export const DEFAULT_FILTERS: CompactFilterValues = {
  minPrice: 0,
  maxPrice: 500,
  distance: 25,
  datePosted: 'all',
  category: 'all'
};

export interface UseTaskFiltersParams {
  onDistanceChange?: (newDistance: number) => void;
  onCategoryChange?: (newCategory: string) => void;
}

export interface UseTaskFiltersReturn {
  // Filter state
  filters: CompactFilterValues;
  searchQuery: string;
  searchRadius: number;
  
  // Computed
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  handleFiltersChange: (newFilters: CompactFilterValues) => void;
  
  // Filter functions
  filterTasks: (taskList: Task[], isMatchingFn?: (category: string) => boolean) => Task[];
  filterOfferings: (offeringList: Offering[]) => Offering[];
}

export const useTaskFilters = ({
  onDistanceChange,
  onCategoryChange,
}: UseTaskFiltersParams = {}): UseTaskFiltersReturn => {
  
  // Initialize filters from localStorage
  const [filters, setFilters] = useState<CompactFilterValues>(() => {
    const saved = localStorage.getItem('taskAdvancedFilters');
    if (saved) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) {
      return { ...DEFAULT_FILTERS, distance: parseInt(savedRadius, 10) };
    }
    return DEFAULT_FILTERS;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchRadius = filters.distance;

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => (
    filters.minPrice > 0 || 
    filters.maxPrice < 500 || 
    filters.datePosted !== 'all' ||
    filters.category !== 'all'
  ), [filters]);

  // Handle filter changes with persistence
  const handleFiltersChange = useCallback((newFilters: CompactFilterValues) => {
    const distanceChanged = newFilters.distance !== filters.distance;
    const categoryChanged = newFilters.category !== filters.category;
    
    setFilters(newFilters);
    
    // Persist to localStorage
    localStorage.setItem('taskAdvancedFilters', JSON.stringify(newFilters));
    localStorage.setItem('taskSearchRadius', newFilters.distance.toString());
    
    // Notify parent about changes that require data refetch
    if (distanceChanged) {
      onDistanceChange?.(newFilters.distance);
    }
    if (categoryChanged) {
      onCategoryChange?.(newFilters.category);
    }
  }, [filters.distance, filters.category, onDistanceChange, onCategoryChange]);

  // Filter tasks by search query, price, and date
  // isMatchingFn: optional function to check if a task matches user's offerings
  const filterTasks = useCallback((taskList: Task[], isMatchingFn?: (category: string) => boolean): Task[] => {
    let filtered = taskList;
    
    // Search filter
    filtered = filtered.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    
    // Price filter
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    
    // Date filter
    filtered = filterByDate(filtered, filters.datePosted);
    
    // Sort: 1) Urgent first, 2) Matching user's offerings, 3) By date
    filtered = filtered.sort((a, b) => {
      // Urgent jobs always come first
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      
      // If both have same urgency, check for matching offerings
      if (isMatchingFn) {
        const aMatches = isMatchingFn(a.category);
        const bMatches = isMatchingFn(b.category);
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
      }
      
      // Finally, sort by date (newest first)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    
    return filtered;
  }, [searchQuery, filters.minPrice, filters.maxPrice, filters.datePosted]);

  // Filter offerings by search query, price, and date
  const filterOfferings = useCallback((offeringList: Offering[]): Offering[] => {
    let filtered = offeringList;
    
    // Search filter
    filtered = filtered.filter(offering => {
      const matchesSearch = searchQuery === '' || 
        offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offering.experience && offering.experience.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
    
    // Price filter
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    
    // Date filter
    filtered = filterByDate(filtered, filters.datePosted);
    
    return filtered;
  }, [searchQuery, filters.minPrice, filters.maxPrice, filters.datePosted]);

  return {
    // State
    filters,
    searchQuery,
    searchRadius,
    
    // Computed
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    handleFiltersChange,
    
    // Filter functions
    filterTasks,
    filterOfferings,
  };
};

export default useTaskFilters;
