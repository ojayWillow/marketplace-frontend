import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import { useAuthStore } from '@marketplace/shared';

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

/**
 * Main Mobile Tasks View Component
 * Thin orchestrator — data, location, and sheet logic live in dedicated hooks.
 *
 * Now restores selectedTask and map viewport from Zustand store on mount,
 * so navigating away and back preserves the user's context.
 */
const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

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
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetToCollapsed,
  } = useBottomSheet();

  // --- Local UI state (orchestration only) ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showJobList, setShowJobList] = useState(true);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // --- Restore selected task from store on mount ---
  useEffect(() => {
    if (storedSelectedTaskId && tasks.length > 0 && !selectedTask) {
      const restored = tasks.find((t) => t.id === storedSelectedTaskId);
      if (restored) {
        setSelectedTask(restored);
        setShowJobList(false);
      } else {
        // Task no longer in results — clear stored ID
        setStoredSelectedTaskId(null);
      }
    }
  }, [storedSelectedTaskId, tasks, selectedTask, setStoredSelectedTaskId]);

  // --- Memoised map data ---
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  // Urgent job count
  const urgentCount = useMemo(
    () => filteredTasks.filter((t) => t.is_urgent).length,
    [filteredTasks]
  );

  // --- Event handlers ---
  const handleRecenter = () => {
    setSelectedTask(null);
    setStoredSelectedTaskId(null);
    setShowJobList(true);
    recenterMap();
  };

  const handleJobSelect = (task: Task) => {
    setShowJobList(false);
    setStoredSelectedTaskId(task.id);
    setTimeout(() => setSelectedTask(task), 50);
  };

  const handleMarkerClick = (task: Task) => {
    setShowJobList(false);
    setStoredSelectedTaskId(task.id);
    setTimeout(() => setSelectedTask(task), 50);
  };

  const handleClosePreview = () => {
    setSelectedTask(null);
    setStoredSelectedTaskId(null);
    setTimeout(() => {
      setShowJobList(true);
      resetToCollapsed();
    }, 100);
  };

  const handleViewDetails = () => {
    if (selectedTask) navigate(`/tasks/${selectedTask.id}`);
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

      {/* Community rules modal — blocks until accepted */}
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
                  icon={getJobPriceIcon(budget, isSelected)}
                  eventHandlers={{ click: () => handleMarkerClick(task) }}
                  zIndexOffset={isSelected ? 1000 : 0}
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

        {/* Recenter button */}
        {!selectedTask && showJobList && (
          <div
            className="absolute right-4 z-[1000]"
            style={{
              bottom: `${sheetHeight + 20}px`,
              transition: 'bottom 0.3s ease-out',
            }}
          >
            <button
              onClick={handleRecenter}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100"
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
              onViewDetails={handleViewDetails}
              onClose={handleClosePreview}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        )}

        {/* Bottom sheet */}
        {!selectedTask && showJobList && (
          <div
            className="fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{
              bottom: `${navHeight}px`,
              height: `${sheetHeight - navHeight}px`,
              transition: isDragging ? 'none' : 'height 0.3s ease-out, bottom 0.3s ease-out',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 100,
            }}
          >
            {/* Drag handle */}
            <div
              className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />

              <div className="flex items-center justify-between w-full px-4">
                <span className="text-base font-bold text-gray-800">
                  💰 {filteredTasks.length} {t('tasks.jobsNearby', 'jobs nearby')}
                  {urgentCount > 0 && (
                    <span className="text-red-600"> · ⚡{urgentCount}</span>
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

              {sheetPosition === 'collapsed' && (
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <span>↑</span> {t('tasks.swipeUpForJobs', 'Swipe up for jobs')}
                </span>
              )}
            </div>

            {/* Jobs list */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ touchAction: 'pan-y' }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('tasks.noJobsFound', 'No jobs found')}
                  </h3>
                  <p className="text-sm text-gray-500">
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
