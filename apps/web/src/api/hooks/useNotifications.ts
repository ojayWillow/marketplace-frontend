import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markReadByType,
} from '@marketplace/shared/src/api/notifications';
import { getUnreadCount as getMessagesUnreadCount } from '@marketplace/shared/src/api/messages';

// Query keys for cache management
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
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
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
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
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    ...options,
  });
};

/**
 * Combined hook to fetch both message and notification unread counts
 * This is useful for showing badges in navigation/menu
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
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute for real-time feel
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
