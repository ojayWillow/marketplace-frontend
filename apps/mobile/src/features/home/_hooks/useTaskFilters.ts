import { useState, useCallback } from 'react';

export const DEFAULT_RADIUS = 25; // km — default search radius

export function useTaskFilters() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(DEFAULT_RADIUS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const hasActiveFilters = selectedRadius !== DEFAULT_RADIUS || selectedDifficulty !== null;
  const hasActiveCategory = selectedCategory !== 'all';

  const clearFilters = useCallback(() => {
    setSelectedRadius(DEFAULT_RADIUS);
    setSelectedDifficulty(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedCategory('all');
    setSelectedRadius(DEFAULT_RADIUS);
    setSelectedDifficulty(null);
  }, []);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedRadius,
    setSelectedRadius,
    selectedDifficulty,
    setSelectedDifficulty,
    hasActiveFilters,
    hasActiveCategory,
    clearFilters,
    resetAll,
  };
}
