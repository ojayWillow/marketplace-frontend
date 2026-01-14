import { useSearchParams } from 'react-router-dom';
import type { ActiveTab, TaskViewMode, TaskStatusFilter } from '../types';

export const useProfileTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read state from URL params with defaults
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'about';
  const taskViewMode = (searchParams.get('view') as TaskViewMode) || 'my-tasks';
  const taskStatusFilter = (searchParams.get('status') as TaskStatusFilter) || 'all';

  // Helper to update URL params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Tab/filter setters that update URL
  const setActiveTab = (tab: ActiveTab) => {
    updateParams({ tab, view: '', status: '' });
  };

  const setTaskViewMode = (view: TaskViewMode) => {
    updateParams({ view, status: 'all' });
  };

  const setTaskStatusFilter = (status: TaskStatusFilter) => {
    updateParams({ status });
  };

  return {
    activeTab,
    taskViewMode,
    taskStatusFilter,
    setActiveTab,
    setTaskViewMode,
    setTaskStatusFilter,
  };
};
