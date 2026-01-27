import { useState, useCallback } from 'react';

export function useTaskFilters() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const hasActiveFilters = selectedRadius !== null || selectedDifficulty !== null;
  const hasActiveCategory = selectedCategory !== 'all';

  const clearFilters = useCallback(() => {
    setSelectedRadius(null);
    setSelectedDifficulty(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedCategory('all');
    setSelectedRadius(null);
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
