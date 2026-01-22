/**
 * API functions for Quick Help tasks
 */
import apiClient from './client';
import i18n from '../i18n';

// Default language - content is stored in this language, no translation needed
const DEFAULT_LANGUAGE = 'lv';

/**
 * Get current language code from i18n
 */
export const getCurrentLanguage = (): string => {
  return i18n.language?.substring(0, 2) || DEFAULT_LANGUAGE;
};

/**
 * Check if translation is needed (user's language differs from default)
 */
const needsTranslation = (): boolean => {
  const currentLang = getCurrentLanguage();
  return currentLang !== DEFAULT_LANGUAGE;
};

/**
 * Get lang param only if translation is needed
 * Returns undefined if no translation needed (backend skips translation)
 */
const getLangParam = (): string | undefined => {
  return needsTranslation() ? getCurrentLanguage() : undefined;
};

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  budget?: number;
  reward?: number;
  distance?: number;
  status: string;
  priority?: string;
  is_urgent?: boolean;
  creator_id: number;
  creator_name?: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  pending_applications_count?: number; // Number of pending applications for this task
  images?: string; // Comma-separated image URLs
}

export interface Helper {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  review_count?: number;
  completed_tasks?: number;
  skills?: string[];
  categories?: string[];
  hourly_rate?: number;
  is_available?: boolean;
  member_since?: string;
}

export interface TaskApplication {
  id: number;
  task_id: number;
  applicant_id: number;
  applicant_name: string;
  applicant_email?: string;
  applicant_avatar?: string;
  applicant_rating?: number;
  applicant_review_count?: number;
  applicant_completed_tasks?: number;
  applicant_member_since?: string;
  applicant_bio?: string;
  applicant_city?: string;
  message?: string;
  proposed_price?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  task?: Task;
}

export interface TasksParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  lang?: string; // Language for translation - only send if different from default
}

export interface SearchTasksParams extends TasksParams {
  q: string; // Search query
}

export interface GetTasksParams extends TasksParams {}

export interface GetHelpersParams {
  page?: number;
  per_page?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
}

export interface GetHelpersResponse {
  helpers: Helper[];
  total: number;
  page: number;
}

export interface GetApplicationsResponse {
  applications: TaskApplication[];
  total: number;
}

/**
 * Get all tasks with optional filtering and geolocation
 * Only requests translation if user's language differs from default (lv)
 */
export const getTasks = async (params: TasksParams = {}): Promise<GetTasksResponse> => {
  const lang = getLangParam();
  const requestParams = {
    ...params,
    ...(lang && { lang }), // Only include lang if translation needed
  };
  const response = await apiClient.get('/api/tasks', { params: requestParams });
  return response.data;
};

/**
 * Search tasks with multilingual support
 * Searches across original text and all translations (LV, EN, RU)
 */
export const searchTasks = async (params: SearchTasksParams): Promise<GetTasksResponse> => {
  const lang = getLangParam();
  const requestParams = {
    ...params,
    ...(lang && { lang }),
  };
  const response = await apiClient.get('/api/tasks/search', { params: requestParams });
  return response.data;
};

/**
 * Get helpers (users who marked themselves as available for work)
 */
export const getHelpers = async (params: GetHelpersParams = {}): Promise<GetHelpersResponse> => {
  const response = await apiClient.get('/api/helpers', { params });
  return response.data;
};

/**
 * Get tasks assigned to current user (as worker)
 */
export const getMyTasks = async (): Promise<GetTasksResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get('/api/tasks/my', {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Get tasks created by current user (as client)
 */
export const getCreatedTasks = async (): Promise<GetTasksResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get('/api/tasks/created', {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Get tasks by a specific user ID (public - only open tasks)
 */
export const getTasksByUser = async (userId: number): Promise<GetTasksResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get(`/api/tasks/user/${userId}`, {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: number): Promise<Task> => {
  const lang = getLangParam();
  const response = await apiClient.get(`/api/tasks/${taskId}`, {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await apiClient.post('/api/tasks', taskData);
  return response.data.task;
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: number, taskData: Partial<Task>): Promise<Task> => {
  const response = await apiClient.put(`/api/tasks/${taskId}`, taskData);
  return response.data.task;
};

// ============ APPLICATION SYSTEM FUNCTIONS ============

/**
 * Apply to a task
 * @param taskId - Task ID to apply to
 * @param message - Optional message to include with application
 * @param proposedPrice - Optional proposed price for the task
 */
export const applyToTask = async (
  taskId: number, 
  message?: string,
  proposedPrice?: number
): Promise<TaskApplication> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/apply`, { 
    message,
    proposed_price: proposedPrice 
  });
  return response.data.application;
};

/**
 * Withdraw an application
 * @param taskId - Task ID
 * @param applicationId - Application ID to withdraw
 */
export const withdrawApplication = async (
  taskId: number,
  applicationId: number
): Promise<void> => {
  await apiClient.delete(`/api/tasks/${taskId}/applications/${applicationId}`);
};

/**
 * Get all applications for a task (owner only)
 */
export const getTaskApplications = async (taskId: number): Promise<GetApplicationsResponse> => {
  const response = await apiClient.get(`/api/tasks/${taskId}/applications`);
  return response.data;
};

/**
 * Accept an application and assign task
 */
export const acceptApplication = async (taskId: number, applicationId: number): Promise<{ task: Task; application: TaskApplication }> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/applications/${applicationId}/accept`);
  return response.data;
};

/**
 * Reject an application
 */
export const rejectApplication = async (taskId: number, applicationId: number): Promise<TaskApplication> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/applications/${applicationId}/reject`);
  return response.data.application;
};

/**
 * Get my applications (as applicant)
 */
export const getMyApplications = async (): Promise<GetApplicationsResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get('/api/tasks/my-applications', {
    params: lang ? { lang } : {}
  });
  return response.data;
};

// ============ END APPLICATION SYSTEM FUNCTIONS ============

/**
 * Accept and assign a task to a user (DEPRECATED - use applyToTask instead)
 */
export const acceptTask = async (taskId: number, userId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/accept`, { user_id: userId });
  return response.data.task;
};

/**
 * Worker marks task as done - awaiting creator confirmation
 */
export const markTaskDone = async (taskId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/mark-done`);
  return response.data.task;
};

/**
 * Creator confirms task completion
 */
export const confirmTaskCompletion = async (taskId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/confirm`);
  return response.data.task;
};

/**
 * Creator disputes task completion
 */
export const disputeTask = async (taskId: number, reason?: string): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/dispute`, { reason });
  return response.data.task;
};

/**
 * Creator cancels a task
 */
export const cancelTask = async (taskId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/cancel`);
  return response.data.task;
};

/**
 * Mark a task as completed (legacy - use markTaskDone + confirmTaskCompletion instead)
 */
export const completeTask = async (taskId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/complete`);
  return response.data.task;
};
