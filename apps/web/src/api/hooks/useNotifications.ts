import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadNotificationCount as getUnreadCount,
  markNotificationAsRead as markAsRead,
  markAllNotificationsAsRead as markAllAsRead,
  markReadByType,
  getUnreadCount as getMessagesUnreadCount,
} from '@marketplace/shared';

// Query keys for cache management
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  messagesUnreadCount: () => ['messages', 'unread-count'] as const,
  combined: () => ['combined-unread'] as const,
};

/**
 * Hook to fetch notifications list
 */
export const useNotifications = (
  page: number = 1,
  perPage: number = 20,
  unreadOnly: boolean = false,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...notificationKeys.list(), page, perPage, unreadOnly],
    queryFn: () => getNotifications(page, perPage, unreadOnly),
    staleTime: 1000 * 60, // 60 seconds
    refetchInterval: 1000 * 120, // Refetch every 2 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook to fetch notification unread count only
 */
export const useNotificationUnreadCount = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 1000 * 60, // 60 seconds
    refetchInterval: 1000 * 120, // Refetch every 2 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Combined hook to fetch both message and notification unread counts.
 * Uses the same query keys as the individual hooks so React Query
 * deduplicates the network requests automatically.
 */
export const useUnreadCounts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: notificationKeys.combined(),
    queryFn: async () => {
      // Fetch both counts in parallel
      const [messagesCount, notificationsData] = await Promise.all([
        getMessagesUnreadCount(),
        getUnreadCount(),
      ]);

      return {
        messages: messagesCount,
        notifications: notificationsData.unread_count,
        newApplications: notificationsData.accepted_applications,
        total: messagesCount + notificationsData.unread_count,
      };
    },
    staleTime: 1000 * 60, // 60 seconds
    refetchInterval: 1000 * 120, // Refetch every 2 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Mark single notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.combined() });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.combined() });
    },
  });
};

/**
 * Mark notifications by type as read
 */
export const useMarkNotificationsByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markReadByType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.combined() });
    },
  });
};
