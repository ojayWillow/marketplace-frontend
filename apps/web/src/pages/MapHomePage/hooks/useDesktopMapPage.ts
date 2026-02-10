import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useMatchingStore } from '@marketplace/shared';
import { useTaskLocation } from '../../Tasks/hooks/useTaskLocation';
import { useTaskFilters } from '../../Tasks/hooks/useTaskFilters';
import { useTaskData } from '../../Tasks/hooks/useTaskData';
import { COMMUNITY_RULES_KEY } from '../../../components/QuickHelpIntroModal';

export type ActiveTab = 'jobs' | 'offerings' | 'all';

export const useDesktopMapPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { loadMyOfferings, isJobMatchingMyOfferings, myOfferingCategories } = useMatchingStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Location hook
  const {
    userLocation,
    locationGranted,
    locationLoading,
    locationName,
    manualLocationSet,
    skipLocationDetection,
    handleLocationSelect: baseHandleLocationSelect,
    resetToAutoLocation,
  } = useTaskLocation();

  // Filters hook
  const {
    filters,
    searchQuery,
    searchRadius,
    hasActiveFilters,
    setSearchQuery,
    handleFiltersChange: baseHandleFiltersChange,
    filterTasks,
    filterOfferings,
  } = useTaskFilters();

  // Data hook
  const {
    tasks,
    offerings,
    boostedOfferings,
    initialLoading,
    refreshing,
    error,
    hasEverLoaded,
    fetchData,
    resetFetchFlag,
  } = useTaskData({
    userLocation,
    locationGranted,
    searchRadius,
    category: filters.category,
  });

  // Show community rules modal on first visit (unified key)
  useEffect(() => {
    const hasAccepted = localStorage.getItem(COMMUNITY_RULES_KEY);
    if (!hasAccepted) setShowIntroModal(true);
  }, []);

  // Load user offerings for matching
  useEffect(() => {
    if (isAuthenticated) loadMyOfferings();
  }, [isAuthenticated, loadMyOfferings]);

  // Handlers
  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    baseHandleLocationSelect(lat, lng, name);
    resetFetchFlag();
    fetchData(true);
    setShowLocationModal(false);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    const distanceChanged = newFilters.distance !== filters.distance;
    const categoryChanged = newFilters.category !== filters.category;
    baseHandleFiltersChange(newFilters);
    if (distanceChanged || categoryChanged) {
      resetFetchFlag();
      fetchData(true, newFilters.distance, newFilters.category);
    }
  };

  const handleResetToAuto = () => {
    resetToAutoLocation(() => {
      resetFetchFlag();
      fetchData(true);
    });
  };

  const handlePostJob = () => {
    navigate(isAuthenticated ? '/tasks/create' : '/welcome');
  };

  const handleOfferService = () => {
    navigate(isAuthenticated ? '/offerings/create' : '/welcome');
  };

  const handleRetry = () => {
    resetFetchFlag();
    fetchData(true);
  };

  // Apply filters
  const matchingFn = isAuthenticated ? isJobMatchingMyOfferings : undefined;
  const filteredTasks = filterTasks(tasks, matchingFn);
  const filteredOfferings = filterOfferings(offerings);

  // Computed
  const matchingJobsCount = isAuthenticated
    ? filteredTasks.filter(task => isJobMatchingMyOfferings(task.category)).length
    : 0;
  const urgentJobsCount = filteredTasks.filter(task => task.is_urgent).length;
  const maxBudget = Math.max(...filteredTasks.map(t => t.budget || t.reward || 0), 0);
  const hasHighValueJobs = filteredTasks.some(t => (t.budget || t.reward || 0) > 75);

  // Map markers based on tab
  const mapTasks = activeTab === 'offerings' ? [] : filteredTasks;
  const mapBoostedOfferings = activeTab === 'jobs' ? [] : boostedOfferings;

  return {
    // State
    activeTab, setActiveTab,
    showIntroModal, setShowIntroModal,
    showLocationModal, setShowLocationModal,
    // Location
    userLocation, locationLoading, locationName, manualLocationSet,
    skipLocationDetection,
    // Filters
    filters, searchQuery, searchRadius, hasActiveFilters, setSearchQuery,
    // Data
    filteredTasks, filteredOfferings, boostedOfferings,
    mapTasks, mapBoostedOfferings,
    initialLoading, refreshing, error, hasEverLoaded,
    // Computed
    matchingJobsCount, urgentJobsCount, maxBudget, hasHighValueJobs,
    myOfferingCategories,
    isAuthenticated,
    isJobMatchingMyOfferings,
    // Handlers
    handleLocationSelect, handleFiltersChange, handleResetToAuto,
    handlePostJob, handleOfferService, handleRetry,
  };
};
