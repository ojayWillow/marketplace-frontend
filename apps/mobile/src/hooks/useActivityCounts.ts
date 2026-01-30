import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useAuthStore, 
  getCreatedTasks, 
  getMyApplications, 
  getMyTasks,
  type Task 
} from '@marketplace/shared';

// Helper to determine if a task needs action from the current user
const needsAction = (task: Task, userId: number, isCreator: boolean): boolean => {
  if (task.status === 'disputed') return true;
  
  if (isCreator) {
    // Creator needs to: confirm completion, review applicants
    if (task.status === 'pending_confirmation') return true;
    if (task.status === 'open' && (task.pending_applications_count ?? 0) > 0) return true;
  } else {
    // Worker needs to: work on assigned/in-progress tasks
    if (task.status === 'assigned') return true;
    if (task.status === 'in_progress') return true;
  }
  
  return false;
};

export interface ActivityCounts {
  // Total pending actions requiring user attention
  total: number;
  // Posted jobs needing action (confirm completion, review applicants)
  requests: number;
  // Applied/assigned work needing action
  work: number;
  // Loading state
  isLoading: boolean;
}

/**
 * Hook to track pending actions across all user activities.
 * Returns counts of items requiring user attention for badge indicators.
 * 
 * @returns ActivityCounts object with total, requests, work counts and loading state
 * 
 * @example
 * const { total, requests, work, isLoading } = useActivityCounts();
 * // Show badge if total > 0
 * {total > 0 && <Badge value={total} />}
 */
export function useActivityCounts(): ActivityCounts {
  const { user } = useAuthStore();

  // Fetch all user activities
  const { data: postedJobsData, isLoading: isLoadingPosted } = useQuery({
    queryKey: ['myPostedTasks'],
    queryFn: getCreatedTasks,
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: getMyApplications,
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: assignedJobsData, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['myAssignedTasks'],
    queryFn: getMyTasks,
    enabled: !!user,
    staleTime: 30000,
  });

  // Extract arrays
  const postedJobs = postedJobsData?.tasks || [];
  const applications = applicationsData?.applications || [];
  const assignedJobs = assignedJobsData?.tasks || [];

  // Combine applications + assigned for "My Work"
  const myWork = useMemo(() => {
    const assignedTaskIds = new Set(assignedJobs.map((task: any) => task.id));
    const filteredApplications = applications.filter((app: any) => {
      const taskId = app.task?.id || app.task_id;
      return !assignedTaskIds.has(taskId);
    });
    
    return [
      ...filteredApplications.map((item: any) => ({ ...item, _type: 'application' })),
      ...assignedJobs.map((item: any) => ({ ...item, _type: 'task' }))
    ];
  }, [applications, assignedJobs]);

  // Count actions needed for each category
  const counts = useMemo(() => {
    const requestsCount = postedJobs.filter((task: Task) => 
      needsAction(task, user?.id || 0, true)
    ).length;

    const workCount = myWork.filter((item: any) => {
      const task = item._type === 'application' ? item.task : item;
      if (!task) return false;
      return needsAction(task, user?.id || 0, false);
    }).length;

    return {
      total: requestsCount + workCount,
      requests: requestsCount,
      work: workCount,
      isLoading: isLoadingPosted || isLoadingApplications || isLoadingAssigned,
    };
  }, [postedJobs, myWork, user?.id, isLoadingPosted, isLoadingApplications, isLoadingAssigned]);

  return counts;
}
