import { useState, useCallback } from 'react';

export const DEFAULT_RADIUS = 25; // km — default search radius

export function useTaskFilters() {
  // Changed from single string to array of strings for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(DEFAULT_RADIUS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const hasActiveFilters = selectedRadius !== DEFAULT_RADIUS || selectedDifficulty !== null;
  const hasActiveCategory = !selectedCategories.includes('all') && selectedCategories.length > 0;

  const clearFilters = useCallback(() => {
    setSelectedRadius(DEFAULT_RADIUS);
    setSelectedDifficulty(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedCategories(['all']);
    setSelectedRadius(DEFAULT_RADIUS);
    setSelectedDifficulty(null);
  }, []);

  // Helper to check if a task matches the selected categories
  const matchesCategory = useCallback((taskCategory: string) => {
    if (selectedCategories.includes('all')) return true;
    return selectedCategories.includes(taskCategory);
  }, [selectedCategories]);

  return {
    selectedCategories,
    setSelectedCategories,
    // Legacy support - returns first category or 'all'
    selectedCategory: selectedCategories.includes('all') ? 'all' : selectedCategories[0] || 'all',
    setSelectedCategory: (cat: string) => setSelectedCategories(cat === 'all' ? ['all'] : [cat]),
    selectedRadius,
    setSelectedRadius,
    selectedDifficulty,
    setSelectedDifficulty,
    hasActiveFilters,
    hasActiveCategory,
    clearFilters,
    resetAll,
    matchesCategory,
  };
}
