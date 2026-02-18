import { useTranslation } from 'react-i18next';
import { TasksTab } from '../../Profile/components/tabs/TasksTab';
import { OfferingsTab } from '../../Profile/components/tabs/OfferingsTab';
import type { Task, TaskApplication, TaskViewMode, TaskStatusFilter, TaskMatchCounts } from '@marketplace/shared';
import type { Offering } from '@marketplace/shared';

interface MyWorkDashboardProps {
  activeMode: 'jobs' | 'services';
  onModeChange: (mode: 'jobs' | 'services') => void;
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
  offerings: Offering[];
  offeringsLoading: boolean;
  onDeleteOffering?: (id: number) => void;
  pendingNotifications: number;
  loading: boolean;
}

const MyWorkDashboard = ({
  activeMode,
  onModeChange,
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
  userId,
  offerings,
  offeringsLoading,
  onDeleteOffering,
  pendingNotifications,
  loading,
}: MyWorkDashboardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.loading', 'Loading...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Jobs / Services toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1 flex-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('jobs')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all relative ${
              activeMode === 'jobs'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('profile.tabs.jobs', 'Jobs')}
            {pendingNotifications > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold min-w-[18px] text-center">
                {pendingNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => onModeChange('services')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeMode === 'services'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('profile.tabs.services', 'Services')}
            {offerings.length > 0 && (
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">({offerings.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeMode === 'jobs' ? (
        <TasksTab
          createdTasks={createdTasks}
          myApplications={myApplications}
          taskMatchCounts={taskMatchCounts}
          tasksLoading={tasksLoading}
          applicationsLoading={applicationsLoading}
          taskViewMode={taskViewMode}
          taskStatusFilter={taskStatusFilter}
          onViewModeChange={onViewModeChange}
          onStatusFilterChange={onStatusFilterChange}
          onCancelTask={onCancelTask}
          onTaskConfirmed={onTaskConfirmed}
          userId={userId}
          compact
        />
      ) : (
        <OfferingsTab
          offerings={offerings}
          loading={offeringsLoading}
          onDelete={onDeleteOffering}
          compact
        />
      )}
    </div>
  );
};

export default MyWorkDashboard;
