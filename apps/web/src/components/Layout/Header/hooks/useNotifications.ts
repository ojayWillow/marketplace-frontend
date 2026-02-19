import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@marketplace/shared';

export interface NotificationCounts {
  unreadMessages: number;
  pendingApplications: number;
  pendingConfirmation: number;
  acceptedApplications: number;
}

export interface UseNotificationsReturn {
  notifications: NotificationCounts;
  totalNotifications: number;
  fetchNotifications: () => Promise<void>;
  markNotificationsAsRead: (type: 'accepted_applications' | 'all') => Promise<void>;
  clearNotificationType: (type: keyof NotificationCounts) => void;
}

export const useNotifications = (isAuthenticated: boolean): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationCounts>({
    unreadMessages: 0,
    pendingApplications: 0,
    pendingConfirmation: 0,
    acceptedApplications: 0
  });

  const totalNotifications =
    notifications.unreadMessages +
    notifications.pendingApplications +
    notifications.pendingConfirmation +
    notifications.acceptedApplications;

  // Mark specific notification type as read
  const markNotificationsAsRead = useCallback(async (type: 'accepted_applications' | 'all') => {
    try {
      await apiClient.post('/api/notifications/mark-read', { type });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, []);

  // Clear a specific notification type locally (for responsive UX)
  const clearNotificationType = useCallback((type: keyof NotificationCounts) => {
    setNotifications(prev => ({
      ...prev,
      [type]: 0
    }));
  }, []);

  // Fetch notification counts
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Fetch unread messages count
      const messagesResponse = await apiClient.get('/api/messages/unread-count');
      const unreadMessages = messagesResponse.data.unread_count || 0;

      // Fetch task notifications (pending applications on my tasks)
      const taskNotificationsResponse = await apiClient.get('/api/tasks/notifications');
      const pendingApplications = taskNotificationsResponse.data.pending_applications || 0;
      const pendingConfirmation = taskNotificationsResponse.data.pending_confirmation || 0;

      // Fetch real notifications (for accepted applications - worker side)
      let acceptedApplications = 0;
      try {
        const notificationsResponse = await apiClient.get('/api/notifications/unread-count');
        acceptedApplications = notificationsResponse.data.accepted_applications || 0;
      } catch (e) {
        // Notifications API might not be available, that's ok
        console.debug('Notifications API not available');
      }

      setNotifications({
        unreadMessages,
        pendingApplications,
        pendingConfirmation,
        acceptedApplications
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isAuthenticated]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  return {
    notifications,
    totalNotifications,
    fetchNotifications,
    markNotificationsAsRead,
    clearNotificationType
  };
};

export default useNotifications;
