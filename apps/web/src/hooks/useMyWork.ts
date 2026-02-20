import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@marketplace/shared';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { cancelTask, confirmTaskCompletion } from '@marketplace/shared';
import { deleteOffering } from '@marketplace/shared';
import type { Task, TaskApplication, TaskMatchCounts, TaskViewMode, TaskStatusFilter } from '@marketplace/shared';
import type { Offering } from '@marketplace/shared';

/**
 * Shared hook for "my work" data — tasks I created, tasks I applied to, my offerings.
 * Used by both WorkPage (Mine tab) and Profile (desktop tabs).
 */
export const useMyWork = () => {
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();

  // Data
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [myOfferings, setMyOfferings] = useState<Offering[]>([]);
  const [taskMatchCounts, setTaskMatchCounts] = useState<TaskMatchCounts>({});

  // Loading
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  // Tab/filter state for "my work" view
  const [activeMode, setActiveMode] = useState<'jobs' | 'services'>('jobs');
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>('my-tasks');
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>('all');

  // Fetch functions
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const response = await apiClient.get('/api/tasks/created');
      setCreatedTasks(response.data.tasks || []);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const response = await apiClient.get('/api/tasks/my-applications');
      setMyApplications(response.data.applications || []);
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const fetchOfferings = useCallback(async () => {
    setOfferingsLoading(true);
    try {
      const response = await apiClient.get('/api/offerings/mine');
      setMyOfferings(response.data.offerings || []);
    } catch (e) {
      console.error('Error fetching offerings:', e);
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  // Load all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchApplications(), fetchOfferings()]);
    setLoading(false);
  }, [fetchTasks, fetchApplications, fetchOfferings]);

  // Actions
  const handleCancelTask = useCallback(async (taskId: number) => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;
    try {
      await cancelTask(taskId);
      toast.success('Task cancelled');
      fetchTasks();
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast.error('Failed to cancel task');
    }
  }, [fetchTasks, toast]);

  const handleDeleteOffering = useCallback(async (offeringId: number) => {
    if (!window.confirm('Are you sure you want to delete this service offering?')) return;
    try {
      await deleteOffering(offeringId);
      setMyOfferings(prev => prev.filter(o => o.id !== offeringId));
      toast.success('Offering deleted successfully');
    } catch (error) {
      console.error('Error deleting offering:', error);
      toast.error('Failed to delete offering');
    }
  }, [toast]);

  // Computed values
  const totalPendingApplicationsOnMyTasks = createdTasks.reduce((sum, task) => {
    return sum + (task.pending_applications_count || 0);
  }, 0);

  return {
    // Data
    createdTasks,
    myApplications,
    myOfferings,
    setMyOfferings,
    taskMatchCounts,
    userId: user?.id,

    // Loading
    loading,
    tasksLoading,
    applicationsLoading,
    offeringsLoading,

    // Tab/filter state
    activeMode,
    setActiveMode,
    taskViewMode,
    setTaskViewMode,
    taskStatusFilter,
    setTaskStatusFilter,

    // Fetchers
    fetchAll,
    fetchTasks,
    fetchApplications,
    fetchOfferings,

    // Actions
    handleCancelTask,
    handleDeleteOffering,

    // Computed
    totalPendingApplicationsOnMyTasks,
  };
};
