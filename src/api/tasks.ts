/**
 * API functions for Quick Help tasks
 */
import apiClient from './client';

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
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  task?: Task;
}

export interface GetTasksParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

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
 */
export const getTasks = async (params: GetTasksParams = {}): Promise<GetTasksResponse> => {
  const response = await apiClient.get('/api/tasks', { params });
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
  const response = await apiClient.get('/api/tasks/my');
  return response.data;
};

/**
 * Get tasks created by current user (as client)
 */
export const getCreatedTasks = async (): Promise<GetTasksResponse> => {
  const response = await apiClient.get('/api/tasks/created');
  return response.data;
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: number): Promise<Task> => {
  const response = await apiClient.get(`/api/tasks/${taskId}`);
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
 */
export const applyToTask = async (taskId: number, message?: string): Promise<TaskApplication> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/apply`, { message });
  return response.data.application;
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
  const response = await apiClient.get('/api/tasks/my-applications');
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
