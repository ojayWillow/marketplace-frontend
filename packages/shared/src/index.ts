// API exports
export * from './api';

// Export API hooks (React Query hooks)
// These are re-exported from apps/web/src/api/hooks for now
// TODO: Move these hooks to packages/shared/src/api/hooks in Phase 2
export { 
  // Task hooks
  useTasks, 
  useTask, 
  useMyTasks, 
  useCreateTask, 
  useUpdateTask, 
  useApplyToTask, 
  useWithdrawApplication,
  taskKeys,
  
  // Offering hooks
  useOfferings, 
  useBoostedOfferings, 
  useOffering, 
  useMyOfferings, 
  useCreateOffering, 
  useUpdateOffering, 
  useBoostOffering,
  offeringKeys,
  
  // Message hooks
  useConversations,
  useConversation,
  useMessages, 
  useSendMessage, 
  useMarkAsRead,
  messageKeys,
  
  // Notification hooks
  useNotifications,
  useNotificationUnreadCount,
  useUnreadCounts,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useMarkNotificationsByType,
  notificationKeys,
  
  // User hooks
  useUserProfile,
  useUserReviews,
  useStartConversation,
  userKeys,
} from '../../apps/web/src/api/hooks';

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

// i18n exports
export { default as i18n } from './i18n';

// Type exports
export * from './types';
