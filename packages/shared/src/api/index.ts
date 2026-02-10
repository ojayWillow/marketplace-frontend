// Core client
export { apiClient, API_URL, default as api } from './client';

// API modules
export { authApi } from './auth';
export * from './disputes';
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
export * from './payments';
export * from './push';
export * from './reviews';

// Tasks - export everything except Task type (it conflicts with types.ts)
export {
  getCurrentLanguage,
  type Helper,
  type TaskApplication,
  type TasksParams,
  type SearchTasksParams,
  type GetTasksParams,
  type GetHelpersParams,
  type GetTasksResponse,
  type GetHelpersResponse,
  type GetApplicationsResponse,
  getTasks,
  searchTasks,
  getHelpers,
  getMyTasks,
  getCreatedTasks,
  getTasksByUser,
  getTask,
  createTask,
  updateTask,
  applyToTask,
  withdrawApplication,
  getTaskApplications,
  acceptApplication,
  rejectApplication,
  getMyApplications,
  acceptTask,
  markTaskDone,
  confirmTaskCompletion,
  disputeTask,
  cancelTask,
  completeTask,
} from './tasks';
// Export Task type with alias to avoid conflict
export type { Task as TaskType } from './tasks';

export * from './uploads';
export * from './users';

// Re-export types from api/types.ts
export * from './types';
