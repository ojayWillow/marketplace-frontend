import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ActiveTab, TaskViewMode, TaskStatusFilter } from '@marketplace/shared';

export const useProfileTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read state from URL params with defaults
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'about';
  const taskViewMode = (searchParams.get('view') as TaskViewMode) || 'my-tasks';
  const taskStatusFilter = (searchParams.get('status') as TaskStatusFilter) || 'all';

  // Helper to update URL params
  const updateParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Tab/filter setters that update URL
  const setActiveTab = useCallback((tab: ActiveTab) => {
    updateParams({ tab, view: '', status: '' });
  }, [updateParams]);

  const setTaskViewMode = useCallback((view: TaskViewMode) => {
    updateParams({ view, status: 'all' });
  }, [updateParams]);

  const setTaskStatusFilter = useCallback((status: TaskStatusFilter) => {
    updateParams({ status });
  }, [updateParams]);

  // Listen for notification bell click event to force tab switch
  useEffect(() => {
    const handleBellClick = () => {
      // Re-read from URL and force update if needed
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl === 'tasks' && activeTab !== 'tasks') {
        setSearchParams(urlParams, { replace: true });
      }
    };

    window.addEventListener('notification-bell-clicked', handleBellClick);
    return () => window.removeEventListener('notification-bell-clicked', handleBellClick);
  }, [activeTab, setSearchParams]);

  return {
    activeTab,
    taskViewMode,
    taskStatusFilter,
    setActiveTab,
    setTaskViewMode,
    setTaskStatusFilter,
  };
};
