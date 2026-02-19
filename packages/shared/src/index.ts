// API exports
export * from './api';

// NOTE: React Query hooks are still in apps/web/src/api/hooks/
// They will be moved to the shared package in Phase 2
// For now, web app imports them directly from the local hooks folder

// Utility functions for task/offering status and difficulty labels
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'pending': 'Pending',
    'active': 'Active',
    'inactive': 'Inactive',
  };
  return labels[status] || status;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
  };
  return labels[difficulty] || difficulty;
};

// Store exports
export { useAuthStore } from './stores/authStore';
export { useFavoritesStore } from './stores/favoritesStore';
export { useMatchingStore } from './stores/matchingStore';
export { useToastStore } from './stores/toastStore';

// i18n removed - was causing 404 errors and layout issues
// export { default as i18n } from './i18n';

// Type exports
export * from './types';

// Constants exports
export * from './constants/categories';
