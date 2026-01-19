// Core client
export { apiClient, default as api } from './client';

// API modules
export { authApi } from './auth';
export * from './favorites';
export * from './geocoding';
export * from './listings';
export * from './messages';

// Notifications - rename conflicting exports
export {
  NotificationType,
  type Notification,
  type GetNotificationsResponse,
  type UnreadCountResponse,
  getNotifications,
  getUnreadCount as getUnreadNotificationCount,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  markReadByType,
  deleteNotification,
} from './notifications';

export * from './offerings';
export * from './push';
export * from './reviews';
export * from './taskResponses';

// Tasks - don't re-export Task type (it's in types.ts)
export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  getTasksByUser,
  getMyTasks,
  tasksApi,
  type GetTasksResponse,
} from './tasks';

export * from './uploads';
export * from './users';

// Re-export types from api/types.ts
export * from './types';
