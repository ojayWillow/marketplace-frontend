/**
 * API functions for user notifications
 */
import apiClient from './client';

export enum NotificationType {
  NEW_APPLICATION = 'new_application',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  TASK_MARKED_DONE = 'task_marked_done',
  TASK_COMPLETED = 'task_completed',
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  related_type?: string;
  related_id?: number;
  created_at: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
  accepted_applications: number;
}

/**
 * Get all notifications for current user
 */
export const getNotifications = async (
  page: number = 1,
  perPage: number = 20,
  unreadOnly: boolean = false
): Promise<GetNotificationsResponse> => {
  const response = await apiClient.get('/api/notifications', {
    params: {
      page,
      per_page: perPage,
      unread_only: unreadOnly,
    },
  });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get('/api/notifications/unread-count');
  return response.data;
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await apiClient.post(`/api/notifications/${notificationId}/read`);
  return response.data.notification;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.post('/api/notifications/read-all');
};

/**
 * Mark notifications by type as read
 * @param type - 'accepted_applications' | 'new_applications' | 'task_marked_done' | 'task_completed' | 'all'
 */
export const markReadByType = async (
  type: 'accepted_applications' | 'new_applications' | 'task_marked_done' | 'task_completed' | 'all'
): Promise<{ updated_count: number }> => {
  const response = await apiClient.post('/api/notifications/mark-read', { type });
  return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await apiClient.delete(`/api/notifications/${notificationId}`);
};
