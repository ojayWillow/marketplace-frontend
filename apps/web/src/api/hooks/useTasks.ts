import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTasks, getTask, getMyTasks, createTask, updateTask, applyToTask, withdrawApplication, TasksParams } from '@marketplace/shared';

// Query keys for cache management
// Include language in keys that return translated content
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TasksParams, lang: string) => [...taskKeys.lists(), params, lang] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number, lang: string) => [...taskKeys.details(), id, lang] as const,
  myTasks: (lang: string) => [...taskKeys.all, 'my', lang] as const,
};

// Fetch tasks list with filters
export const useTasks = (params: TasksParams, options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: taskKeys.list(params, lang),
    queryFn: () => getTasks({ ...params, lang }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Fetch single task by ID
export const useTask = (id: number, options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: taskKeys.detail(id, lang),
    queryFn: () => getTask(id),
    // Short stale time to ensure fresh status data
    // Task status can change frequently (assigned -> done -> completed)
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!id && options?.enabled !== false,
  });
};

// Fetch user's own tasks
export const useMyTasks = (options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: taskKeys.myTasks(lang),
    queryFn: () => getMyTasks(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate all task lists to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTask>[1] }) => 
      updateTask(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all task queries (including all language variants)
      queryClient.invalidateQueries({ queryKey: taskKeys.details() });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Apply to task mutation
export const useApplyToTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, message, proposedPrice }: { taskId: number; message?: string; proposedPrice?: number }) => 
      applyToTask(taskId, message, proposedPrice),
    onSuccess: (_, variables) => {
      // Invalidate task details to update application status
      queryClient.invalidateQueries({ queryKey: taskKeys.details() });
    },
  });
};

// Withdraw application mutation
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, applicationId }: { taskId: number; applicationId: number }) => 
      withdrawApplication(taskId, applicationId),
    onSuccess: () => {
      // Invalidate all task queries since we don't know which task
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
