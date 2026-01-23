import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Task, TaskApplication } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';
import { getStatusBadgeClass } from '../../utils/statusHelpers';
import { TabLoadingSpinner } from '../LoadingState';
import { ConfirmTaskModal } from '../../../../components/ConfirmTaskModal';
import { ReviewModal } from '../../../../components/ReviewModal';
import { apiClient } from '@marketplace/shared';
import type { TaskViewMode, TaskStatusFilter, TaskMatchCounts } from '@marketplace/shared';

interface CanReviewStatus {
  taskId: number;
  canReview: boolean;
  revieweeName?: string;
  revieweeId?: number;
}

interface TasksTabProps {
  createdTasks: Task[];
  myApplications: TaskApplication[];
  taskMatchCounts: TaskMatchCounts;
  tasksLoading: boolean;
  applicationsLoading: boolean;
  taskViewMode: TaskViewMode;
  taskStatusFilter: TaskStatusFilter;
  onViewModeChange: (mode: TaskViewMode) => void;
  onStatusFilterChange: (filter: TaskStatusFilter) => void;
  onCancelTask?: (id: number) => void;
  onTaskConfirmed?: () => void;
  userId?: number;
  viewOnly?: boolean;
}

export const TasksTab = ({
  createdTasks,
  myApplications,
  taskMatchCounts,
  tasksLoading,
  applicationsLoading,
  taskViewMode,
  taskStatusFilter,
  onViewModeChange,
  onStatusFilterChange,
  onCancelTask,
  onTaskConfirmed,
  viewOnly = false,
}: TasksTabProps) => {
  const { t } = useTranslation();
  const [expandedMatchHint, setExpandedMatchHint] = useState<number | null>(null);
  
  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);
  
  // Review modal state (for workers reviewing job creators)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [taskToReview, setTaskToReview] = useState<Task | null>(null);
  
  // Track which completed tasks can be reviewed
  const [canReviewStatuses, setCanReviewStatuses] = useState<Map<number, CanReviewStatus>>(new Map());

  // Counts
  const totalPendingApplicationsOnMyTasks = createdTasks.reduce((sum, task) => {
    return sum + (task.pending_applications_count || 0);
  }, 0);
  const tasksWithMatches = Object.entries(taskMatchCounts).filter(([_, count]) => count > 0).length;

  // Count pending reviews for "Jobs I'm Doing"
  const pendingReviewsCount = Array.from(canReviewStatuses.values()).filter(s => s.canReview).length;

  // Check review status for completed tasks in "Jobs I'm Doing"
  useEffect(() => {
    const checkReviewStatuses = async () => {
      const completedJobs = myApplications
        .filter(app => app.status === 'accepted' && app.task?.status === 'completed')
        .map(app => app.task!)
        .filter(Boolean);

      const newStatuses = new Map<number, CanReviewStatus>();
      
      for (const task of completedJobs) {
        try {
          const response = await apiClient.get(`/api/reviews/task/${task.id}/can-review`);
          newStatuses.set(task.id, {
            taskId: task.id,
            canReview: response.data.can_review,
            revieweeName: response.data.reviewee?.username || task.creator_name,
            revieweeId: response.data.reviewee?.id || task.creator_id,
          });
        } catch (error) {
          console.error(`Error checking review status for task ${task.id}:`, error);
          newStatuses.set(task.id, {
            taskId: task.id,
            canReview: false,
          });
        }
      }
      
      setCanReviewStatuses(newStatuses);
    };

    if (!viewOnly && myApplications.length > 0) {
      checkReviewStatuses();
    }
  }, [myApplications, viewOnly]);

  // Get tasks for current view mode
  const getDisplayTasks = () => {
    // For public profiles, only show open/active posted tasks
    if (viewOnly) {
      return createdTasks.filter(task => task.status === 'open');
    }

    if (taskViewMode === 'my-tasks') {
      return createdTasks.filter(task => {
        if (taskStatusFilter === 'active') {
          return ['open', 'assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
        }
        if (taskStatusFilter === 'completed') {
          return task.status === 'completed';
        }
        return true;
      });
    } else {
      const acceptedApps = myApplications.filter(app => app.status === 'accepted');
      return acceptedApps.filter(app => {
        const task = app.task;
        if (!task) return false;
        if (taskStatusFilter === 'active') {
          return ['assigned', 'in_progress', 'pending_confirmation'].includes(task.status);
        }
        if (taskStatusFilter === 'completed') {
          return task.status === 'completed';
        }
        return true;
      }).map(app => app.task!).filter(Boolean);
    }
  };

  const handleConfirmClick = (task: Task) => {
    setTaskToConfirm(task);
    setConfirmModalOpen(true);
  };

  const handleModalClose = () => {
    setConfirmModalOpen(false);
    setTaskToConfirm(null);
  };

  const handleTaskConfirmed = () => {
    handleModalClose();
    onTaskConfirmed?.();
  };

  const handleReviewClick = (task: Task) => {
    setTaskToReview(task);
    setReviewModalOpen(true);
  };

  const handleReviewModalClose = () => {
    setReviewModalOpen(false);
    setTaskToReview(null);
  };

  const handleReviewSubmitted = () => {
    // Update the status to mark as reviewed
    if (taskToReview) {
      setCanReviewStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(taskToReview.id, {
          ...prev.get(taskToReview.id)!,
          canReview: false,
        });
        return newMap;
      });
    }
    handleReviewModalClose();
  };

  return (
    <>
      {/* Confirmation Modal (for job creators) */}
      {taskToConfirm && (
        <ConfirmTaskModal
          isOpen={confirmModalOpen}
          onClose={handleModalClose}
          onConfirmed={handleTaskConfirmed}
          taskId={taskToConfirm.id}
          taskTitle={taskToConfirm.title}
          workerName={taskToConfirm.assigned_to_name || 'the helper'}
          workerId={taskToConfirm.assigned_to_id || 0}
          budget={taskToConfirm.budget}
        />
      )}

      {/* Review Modal (for workers reviewing job creators) */}
      {taskToReview && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={handleReviewModalClose}
          onReviewSubmitted={handleReviewSubmitted}
          taskId={taskToReview.id}
          taskTitle={taskToReview.title}
          revieweeName={canReviewStatuses.get(taskToReview.id)?.revieweeName || taskToReview.creator_name || 'Job Creator'}
          revieweeId={canReviewStatuses.get(taskToReview.id)?.revieweeId || taskToReview.creator_id}
          reviewType="creator"
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">
            {viewOnly ? t('profile.jobsTab.titleViewOnly') : t('profile.jobsTab.title')}
          </h2>
          {!viewOnly && (
            <Link
              to="/tasks/create"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t('profile.jobsTab.postJob')}
            </Link>
          )}
        </div>

        {/* View Toggle - Only for own profile */}
        {!viewOnly && (
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => onViewModeChange('my-tasks')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all relative ${
                taskViewMode === 'my-tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('profile.jobsTab.jobsIPosted')}
              {totalPendingApplicationsOnMyTasks > 0 && (
                <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[10px] rounded-full bg-green-500 text-white font-bold">
                  {totalPendingApplicationsOnMyTasks}
                </span>
              )}
            </button>
            <button
              onClick={() => onViewModeChange('my-jobs')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all relative ${
                taskViewMode === 'my-jobs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('profile.jobsTab.jobsImDoing')}
              {pendingReviewsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[10px] rounded-full bg-yellow-500 text-white font-bold">
                  {pendingReviewsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Status Filter - Only for own profile */}
        {!viewOnly && (
          <div className="flex gap-1 mb-4">
            {[
              { value: 'all', label: t('profile.jobsTab.filterAll') },
              { value: 'active', label: t('profile.jobsTab.filterActive') },
              { value: 'completed', label: t('profile.jobsTab.filterDone') },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => onStatusFilterChange(filter.value as TaskStatusFilter)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  taskStatusFilter === filter.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Matches Summary Banner - Only for own profile */}
        {!viewOnly && taskViewMode === 'my-tasks' && tasksWithMatches > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="text-lg">✨</span>
              <p className="text-sm">
                <span className="font-medium">{t('profile.jobsTab.matchesBanner', { count: tasksWithMatches })}</span>
              </p>
            </div>
          </div>
        )}

        {tasksLoading || applicationsLoading ? (
          <TabLoadingSpinner color="blue" />
        ) : getDisplayTasks().length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">{taskViewMode === 'my-tasks' || viewOnly ? '📋' : '🛠️'}</div>
            <p className="text-gray-500 mb-4">
              {viewOnly 
                ? t('profile.jobsTab.noActiveJobs')
                : taskViewMode === 'my-tasks' 
                  ? t('profile.jobsTab.noJobsPosted')
                  : t('profile.jobsTab.noJobs')
              }
            </p>
            {!viewOnly && (
              <Link
                to={taskViewMode === 'my-tasks' ? '/tasks/create' : '/tasks'}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {taskViewMode === 'my-tasks' ? t('profile.jobsTab.postFirstJob') : t('profile.jobsTab.browseJobs')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(taskViewMode === 'my-tasks' || viewOnly) ? (
              getDisplayTasks().map(task => {
                const hasApplications = !viewOnly && task.status === 'open' && (task.pending_applications_count || 0) > 0;
                const matchCount = taskMatchCounts[task.id] || 0;
                const hasMatches = !viewOnly && task.status === 'open' && matchCount > 0;
                const isExpanded = expandedMatchHint === task.id;
                
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      hasApplications ? 'border-green-300 bg-green-50' : 
                      hasMatches ? 'border-amber-200 bg-amber-50/30' :
                      'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {/* Application notification - only for own profile */}
                    {!viewOnly && hasApplications && (
                      <Link 
                        to={`/tasks/${task.id}`}
                        className="flex items-center justify-between bg-green-500 text-white p-2.5 rounded-lg mb-3 text-sm"
                      >
                        <span>📩 {t('profile.jobsTab.applications', { count: task.pending_applications_count })}</span>
                        <span className="font-medium">{t('profile.jobsTab.reviewApplications')}</span>
                      </Link>
                    )}
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span>{getCategoryIcon(task.category)}</span>
                          <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {task.title}
                          </Link>
                          {!viewOnly && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          )}
                          {!viewOnly && hasMatches && !hasApplications && (
                            <button
                              onClick={() => setExpandedMatchHint(isExpanded ? null : task.id)}
                              className="px-2 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1"
                            >
                              ✨ {matchCount}
                            </button>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span>📍 {task.location}</span>
                          {task.budget && <span className="text-green-600 font-semibold">€{task.budget}</span>}
                        </div>
                        
                        {!viewOnly && isExpanded && hasMatches && (
                          <Link
                            to={`/tasks/${task.id}`}
                            className="mt-3 flex items-center justify-between p-2.5 bg-amber-100 rounded-lg text-sm text-amber-800 hover:bg-amber-200 transition-colors"
                          >
                            <span>
                              💡 {t('profile.jobsTab.helpersNearby', { count: matchCount, category: getCategoryLabel(task.category) })}
                            </span>
                            <span className="font-medium">{t('profile.jobsTab.viewMatches')}</span>
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {!viewOnly && task.status === 'pending_confirmation' && (
                          <button
                            onClick={() => handleConfirmClick(task)}
                            className="px-2.5 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            {t('profile.jobsTab.confirm')}
                          </button>
                        )}
                        <Link to={`/tasks/${task.id}`} className="text-xs text-blue-600 hover:underline text-center">{t('profile.jobsTab.view')}</Link>
                        {!viewOnly && task.status === 'open' && !hasApplications && (
                          <>
                            <Link to={`/tasks/${task.id}/edit`} className="text-xs text-gray-500 hover:underline text-center">{t('profile.jobsTab.edit')}</Link>
                            {onCancelTask && (
                              <button onClick={() => onCancelTask(task.id)} className="text-xs text-red-500 hover:underline">{t('profile.jobsTab.cancelJob')}</button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // My Jobs (applications) - only for own profile
              myApplications.filter(app => app.status === 'accepted').map(application => {
                const task = application.task;
                if (!task) return null;
                
                if (taskStatusFilter === 'active' && !['assigned', 'in_progress', 'pending_confirmation'].includes(task.status)) return null;
                if (taskStatusFilter === 'completed' && task.status !== 'completed') return null;
                
                // Check if this task needs a review
                const reviewStatus = canReviewStatuses.get(task.id);
                const needsReview = task.status === 'completed' && reviewStatus?.canReview;
                
                return (
                  <div 
                    key={application.id} 
                    className={`p-4 border rounded-lg ${
                      needsReview 
                        ? 'border-yellow-200 bg-white' 
                        : 'border-green-200 bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                      <span>🎉</span>
                      <span className="font-medium">
                        {task.status === 'completed' ? t('profile.jobsTab.completed') : t('profile.jobsTab.assigned')}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getCategoryIcon(task.category)}</span>
                          <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {task.title}
                          </Link>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>📍 {task.location}</span>
                          {task.budget && <span className="text-green-600 font-semibold">€{task.budget}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('profile.jobsTab.postedBy')} {task.creator_name || 'Unknown'}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {needsReview && (
                          <button
                            onClick={() => handleReviewClick(task)}
                            className="px-2.5 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                          >
                            {t('profile.jobsTab.review')}
                          </button>
                        )}
                        <Link
                          to={`/tasks/${task.id}`}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                        >
                          {t('profile.jobsTab.view')}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};
