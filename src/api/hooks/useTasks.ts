import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, getTask, getMyTasks, createTask, updateTask, applyToTask, withdrawApplication, TasksParams } from '../tasks';

// Query keys for cache management
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TasksParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  myTasks: () => [...taskKeys.all, 'my'] as const,
};

// Fetch tasks list with filters
export const useTasks = (params: TasksParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Fetch single task by ID
export const useTask = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id && options?.enabled !== false,
  });
};

// Fetch user's own tasks
export const useMyTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: taskKeys.myTasks(),
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
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
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
      // Invalidate specific task and lists
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
    },
  });
};

// Apply to task mutation
export const useApplyToTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, message, proposedPrice }: { taskId: number; message: string; proposedPrice?: number }) => 
      applyToTask(taskId, message, proposedPrice),
    onSuccess: (_, variables) => {
      // Invalidate specific task to update application status
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
    },
  });
};

// Withdraw application mutation
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      // Invalidate all task queries since we don't know which task
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
