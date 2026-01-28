import { useState, useCallback } from 'react';

export function useTaskFilters() {
  // Changed from single string to array of strings for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const hasActiveFilters = selectedRadius !== null || selectedDifficulty !== null;
  const hasActiveCategory = !selectedCategories.includes('all') && selectedCategories.length > 0;

  const clearFilters = useCallback(() => {
    setSelectedRadius(null);
    setSelectedDifficulty(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedCategories(['all']);
    setSelectedRadius(null);
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
