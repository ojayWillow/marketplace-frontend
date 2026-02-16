import { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import { useAuthStore, getTask as fetchTaskById } from '@marketplace/shared';
import { FEATURES } from '../../constants/featureFlags';
import { useAuthPrompt } from '../../stores/useAuthPrompt';

import { Task } from './types';
import { mobileTasksStyles } from './styles';
import { addMarkerOffsets, createUserLocationIcon, getJobPriceIcon } from './utils';
import { useTasksData, useUserLocation, useBottomSheet } from './hooks';
import { useMobileMapStore } from './stores';
import {
  MapController,
  MobileJobCard,
  JobPreviewCard,
  CreateChoiceModal,
  FilterSheet,
  FloatingSearchBar,
} from './components';
import CommunityRulesModal, { COMMUNITY_RULES_KEY } from '../QuickHelpIntroModal';

/** Skeleton placeholder for loading state */
const SkeletonCard = () => (
  <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-1.5" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
    </div>
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-6 w-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
    </div>
  </div>
);

/** Collapsed peek height — must match the constant in useBottomSheet */
const COLLAPSED_PEEK_HEIGHT = 88;

const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const showAuth = useAuthPrompt((s) => s.show);

  // Community rules modal state
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(COMMUNITY_RULES_KEY);
    if (!hasAccepted) setShowRulesModal(true);
  }, []);

  // Read persisted selectedTaskId from store
  const storedSelectedTaskId = useMobileMapStore((s) => s.selectedTaskId);
  const setStoredSelectedTaskId = useMobileMapStore((s) => s.setSelectedTaskId);

  // --- Hooks ---
  const {
    userLocation,
    hasRealLocation,
    recenterTrigger,
    handleRecenter: recenterMap,
  } = useUserLocation({
    onInitialFetch: (lat, lng) => initializeFetch(lat, lng),
    onLocationReady: (lat, lng) => refetchAtLocation(lat, lng),
  });

  const {
    tasks,
    loading,
    filteredTasks,
    searchRadius,
    selectedCategories,
    searchQuery,
    setSearchQuery,
    handleRadiusChange,
    handleCategoryToggle,
    initializeFetch,
    refetchAtLocation,
    MAX_CATEGORIES,
  } = useTasksData({ userLocation });

  const {
    sheetPosition,
    sheetHeight,
    navHeight,
    isDragging,
    currentTranslateY,
    getFullHeight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetToCollapsed,
  } = useBottomSheet();

  // --- Local UI state ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showJobList, setShowJobList] = useState(true);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [isFromDeepLink, setIsFromDeepLink] = useState(false);

  // --- Deep link handling ---
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  useEffect(() => {
    if (deepLinkHandled) return;

    const taskParam = searchParams.get('task');
    if (!taskParam) return;

    const taskId = parseInt(taskParam, 10);
    if (isNaN(taskId)) return;

    setDeepLinkHandled(true);
    setIsFromDeepLink(true);

    const newParams = new URLSearchParams(searchParams);
    newParams.delete('task');
    setSearchParams(newParams, { replace: true });

    const existingTask = tasks.find((t) => t.id === taskId);
    if (existingTask) {
      setShowJobList(false);
      setStoredSelectedTaskId(existingTask.id);
      setSelectedTask(existingTask);
      return;
    }

    fetchTaskById(taskId)
      .then((task) => {
        if (task) {
          setShowJobList(false);
          setStoredSelectedTaskId(task.id);
          setSelectedTask(task as Task);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch shared task:', err);
      });
  }, [searchParams, setSearchParams, tasks, deepLinkHandled, setStoredSelectedTaskId]);

  // --- Restore selected task from store on mount ---
  useEffect(() => {
    if (deepLinkHandled) return;
    if (storedSelectedTaskId && tasks.length > 0 && !selectedTask) {
      const restored = tasks.find((t) => t.id === storedSelectedTaskId);
      if (restored) {
        setSelectedTask(restored);
        setShowJobList(false);
      } else {
        setStoredSelectedTaskId(null);
      }
    }
  }, [storedSelectedTaskId, tasks, selectedTask, setStoredSelectedTaskId, deepLinkHandled]);

  // --- Memoised map data ---
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  const urgentCount = FEATURES.URGENT
    ? filteredTasks.filter((t) => t.is_urgent).length
    : 0;

  // --- Compute fitBothPoints for shared link + real GPS ---
  const fitBothPoints = useMemo(() => {
    if (!isFromDeepLink || !hasRealLocation || !selectedTask) return null;
    return {
      userLat: userLocation.lat,
      userLng: userLocation.lng,
      taskLat: selectedTask.displayLatitude || selectedTask.latitude,
      taskLng: selectedTask.displayLongitude || selectedTask.longitude,
    };
  }, [isFromDeepLink, hasRealLocation, selectedTask, userLocation]);

  // --- Recenter button position ---
  // Position just above the visible portion of the bottom sheet.
  // When collapsed, the visible area is COLLAPSED_PEEK_HEIGHT above the nav.
  // We add a small gap (12px) so it doesn't touch the sheet.
  const recenterBottom = useMemo(() => {
    const visibleSheetPortion = getFullHeight() - currentTranslateY;
    return navHeight + visibleSheetPortion + 12;
  }, [navHeight, currentTranslateY, getFullHeight]);

  // --- Event handlers ---
  const handleRecenter = () => {
    setSelectedTask(null);
    setStoredSelectedTaskId(null);
    setShowJobList(true);
    setIsFromDeepLink(false);
    recenterMap();
  };

  const handleJobSelect = (task: Task) => {
    setShowJobList(false);
    setIsFromDeepLink(false);
    setStoredSelectedTaskId(task.id);
    setSelectedTask(task);
  };

  const handleMarkerClick = (task: Task) => {
    setShowJobList(false);
    setIsFromDeepLink(false);
    setStoredSelectedTaskId(task.id);
    setSelectedTask(task);
  };

  const handleClosePreview = () => {
    setSelectedTask(null);
    setStoredSelectedTaskId(null);
    setIsFromDeepLink(false);
    setShowJobList(true);
    resetToCollapsed();
  };

  const handleViewDetails = () => {
    if (!selectedTask) return;
    if (!isAuthenticated) {
      showAuth(() => navigate(`/tasks/${selectedTask.id}`));
      return;
    }
    navigate(`/tasks/${selectedTask.id}`);
  };

  const handleCreatorClick = () => {
    if (selectedTask) {
      const creatorId =
        selectedTask.creator_id || selectedTask.user_id || selectedTask.created_by;
      if (creatorId) navigate(`/users/${creatorId}`);
    }
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/welcome');
      return;
    }
    setShowCreateModal(true);
  };

  // --- Render ---
  return (
    <>
      <style>{mobileTasksStyles}</style>

      <CommunityRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        showCheckboxes={!localStorage.getItem(COMMUNITY_RULES_KEY)}
      />

      <CreateChoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostJob={() => navigate('/tasks/create')}
        onOfferService={() => navigate('/offerings/create')}
      />

      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        searchRadius={searchRadius}
        onRadiusChange={handleRadiusChange}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        maxCategories={MAX_CATEGORIES}
      />

      <div className="fixed inset-0 flex flex-col">
        {/* Full-screen map */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              keepBuffer={4}
              updateWhenZooming={false}
              updateWhenIdle={true}
            />
            <MapController
              lat={userLocation.lat}
              lng={userLocation.lng}
              radius={searchRadius}
              recenterTrigger={recenterTrigger}
              selectedTask={selectedTask}
              isMenuOpen={false}
              sheetPosition={sheetPosition}
              fitBothPoints={fitBothPoints}
              isFromDeepLink={isFromDeepLink}
            />

            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold text-blue-600">
                    📍 {t('tasks.youAreHere', 'You are here')}
                  </p>
                </div>
              </Popup>
            </Marker>

            {tasksWithOffsets.map((task) => {
              const budget = task.budget || task.reward || 0;
              const isSelected = selectedTask?.id === task.id;
              return (
                <Marker
                  key={task.id}
                  position={[
                    task.displayLatitude || task.latitude,
                    task.displayLongitude || task.longitude,
                  ]}
                  icon={getJobPriceIcon(budget, isSelected, FEATURES.URGENT && task.is_urgent)}
                  eventHandlers={{ click: () => handleMarkerClick(task) }}
                  zIndexOffset={isSelected ? 1000 : (FEATURES.URGENT && task.is_urgent) ? 500 : 0}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Floating search / filter bar */}
        <FloatingSearchBar
          searchExpanded={searchExpanded}
          onToggleSearch={setSearchExpanded}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenFilters={() => setShowFilterSheet(true)}
          activeFilterCount={selectedCategories.length}
        />

        {/* Recenter button — positioned just above the bottom sheet */}
        {!selectedTask && showJobList && (
          <div
            className="absolute right-4 z-[1000]"
            style={{
              bottom: `${recenterBottom}px`,
              transition: isDragging ? 'none' : 'bottom 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <button
              onClick={handleRecenter}
              className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-gray-900/50 flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
              </svg>
            </button>
          </div>
        )}

        {/* Job preview card */}
        {selectedTask && (
          <div style={{ paddingBottom: `${navHeight}px` }}>
            <JobPreviewCard
              task={selectedTask}
              userLocation={userLocation}
              hasRealLocation={hasRealLocation}
              onViewDetails={handleViewDetails}
              onClose={handleClosePreview}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        )}

        {/* Bottom sheet — GPU-accelerated via transform */}
        {!selectedTask && showJobList && (
          <div
            className="fixed left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl dark:shadow-gray-950/80 flex flex-col"
            style={{
              bottom: `${navHeight}px`,
              height: `${getFullHeight() - navHeight}px`,
              transform: `translateY(${currentTranslateY}px)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 100,
            }}
          >
            {/* Drag handle area */}
            <div
              className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />

              {sheetPosition !== 'full' && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 text-gray-300 dark:text-gray-600"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              )}

              {sheetPosition === 'full' && <div className="h-2" />}

              <div className="flex items-center justify-between w-full px-4 mt-1">
                <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                  💰 {filteredTasks.length} {t('tasks.jobsNearby', 'jobs nearby')}
                  {FEATURES.URGENT && urgentCount > 0 && (
                    <span className="text-red-600 dark:text-red-400"> · ⚡{urgentCount}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label={t('tasks.createJobOrService', 'Create job or service')}
                >
                  <span className="text-xl leading-none font-bold">+</span>
                </button>
              </div>
            </div>

            {/* Jobs list */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ touchAction: 'pan-y' }}
            >
              {loading ? (
                <div>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {t('tasks.noJobsFound', 'No jobs found')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tasks.tryDifferentCategory', 'Try a different category or increase radius')}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTasks.map((task) => (
                    <MobileJobCard
                      key={task.id}
                      task={task}
                      userLocation={userLocation}
                      onClick={() => handleJobSelect(task)}
                      isSelected={selectedTask?.id === task.id}
                    />
                  ))}
                  <div className="h-4" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileTasksView;
