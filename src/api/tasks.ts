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
  assigned_to_id?: number;
  created_at?: string;
  updated_at?: string;
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

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
}

/**
 * Get all tasks with optional filtering and geolocation
 */
export const getTasks = async (params: GetTasksParams = {}): Promise<GetTasksResponse> => {
  const response = await apiClient.get('/api/tasks', { params });
  return response.data;
};

/**
 * Get tasks assigned to current user
 */
export const getMyTasks = async (): Promise<GetTasksResponse> => {
  const response = await apiClient.get('/api/tasks/my');
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
 * Accept and assign a task to a user
 */
export const acceptTask = async (taskId: number, userId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/accept`, { user_id: userId });
  return response.data.task;
};

/**
 * Mark a task as completed
 */
export const completeTask = async (taskId: number): Promise<Task> => {
  const response = await apiClient.post(`/api/tasks/${taskId}/complete`);
  return response.data.task;
};
