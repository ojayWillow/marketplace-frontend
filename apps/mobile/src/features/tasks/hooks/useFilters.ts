import { useState, useCallback } from 'react';

export function useFilters() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleDifficultySelect = useCallback((difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedDifficulty(null);
  }, []);

  const hasActiveFilter = selectedCategory !== 'all' || selectedDifficulty !== null;

  return {
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    handleCategorySelect,
    handleDifficultySelect,
    clearFilters,
    hasActiveFilter,
  };
}
