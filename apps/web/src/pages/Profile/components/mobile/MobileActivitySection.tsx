import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TasksTab } from '../tabs/TasksTab';
import { OfferingsTab } from '../tabs/OfferingsTab';
import type { Task, TaskApplication, TaskViewMode, TaskStatusFilter, TaskMatchCounts } from '@marketplace/shared';
import type { Offering } from '@marketplace/shared';

interface MobileActivitySectionProps {
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
}

export const MobileActivitySection = ({
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
}: MobileActivitySectionProps) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Section header with toggle + create button */}
      <div className="flex items-center gap-2 mb-3">
        {/* Toggle: Jobs / Services */}
        <div className="flex gap-1 flex-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('jobs')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all relative ${
              activeMode === 'jobs' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
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
              activeMode === 'services' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('profile.tabs.services', 'Services')}
            {offerings.length > 0 && (
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">({offerings.length})</span>
            )}
          </button>
        </div>

        {/* Quick-create button */}
        {activeMode === 'jobs' ? (
          <Link
            to="/tasks/create"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            title={t('profile.jobsTab.postJob')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        ) : (
          <Link
            to="/offerings/create"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
            title={t('profile.servicesTab.newService')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        )}
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
