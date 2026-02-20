import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, apiClient, useToastStore, cancelTask, deleteOffering } from '@marketplace/shared';
import type { Task, TaskApplication, TaskViewMode, TaskStatusFilter, Offering } from '@marketplace/shared';

/**
 * Shared hook for "my work" data — tasks I created, tasks I applied to, my offerings.
 * Used by WorkPage (Mine tab) via useWorkPage.
 */
export const useMyWork = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const { t } = useTranslation();

  // Data
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<TaskApplication[]>([]);
  const [myOfferings, setMyOfferings] = useState<Offering[]>([]);

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
    if (!window.confirm(t('tasks.confirmCancel', 'Are you sure you want to cancel this task?'))) return;
    try {
      await cancelTask(taskId);
      toast.success(t('tasks.cancelled', 'Task cancelled'));
      fetchTasks();
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast.error(t('tasks.cancelFailed', 'Failed to cancel task'));
    }
  }, [fetchTasks, toast, t]);

  const handleDeleteOffering = useCallback(async (offeringId: number) => {
    if (!window.confirm(t('offerings.confirmDelete', 'Are you sure you want to delete this service offering?'))) return;
    try {
      await deleteOffering(offeringId);
      setMyOfferings(prev => prev.filter(o => o.id !== offeringId));
      toast.success(t('offerings.deleted', 'Offering deleted successfully'));
    } catch (error) {
      console.error('Error deleting offering:', error);
      toast.error(t('offerings.deleteFailed', 'Failed to delete offering'));
    }
  }, [toast, t]);

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
    taskMatchCounts: {} as Record<string, number>,
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
