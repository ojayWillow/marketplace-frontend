import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TasksTab } from '../tabs/TasksTab';
import { OfferingsTab } from '../tabs/OfferingsTab';
import type { Task, TaskApplication, TaskViewMode, TaskStatusFilter, TaskMatchCounts } from '@marketplace/shared';
import type { Offering } from '@marketplace/shared';

interface MobileActivitySectionProps {
  activeMode: 'jobs' | 'services';
  onModeChange: (mode: 'jobs' | 'services') => void;
  // Jobs
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
  // Services
  offerings: Offering[];
  offeringsLoading: boolean;
  onDeleteOffering?: (id: number) => void;
  // Notifications
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
      {/* Toggle: Jobs / Services */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => onModeChange('jobs')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all relative ${
            activeMode === 'jobs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('profile.tabs.jobs', 'Jobs')}
          {pendingNotifications > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
              {pendingNotifications}
            </span>
          )}
        </button>
        <button
          onClick={() => onModeChange('services')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeMode === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('profile.tabs.services', 'Services')}
          {offerings.length > 0 && (
            <span className="text-gray-400 ml-1">({offerings.length})</span>
          )}
        </button>
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
        />
      ) : (
        <OfferingsTab
          offerings={offerings}
          loading={offeringsLoading}
          onDelete={onDeleteOffering}
        />
      )}
    </div>
  );
};
