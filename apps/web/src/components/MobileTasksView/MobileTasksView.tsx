import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import { getTasks } from '@marketplace/shared';
import { useAuthStore } from '@marketplace/shared';
import { useUnreadCounts } from '../../api/hooks';
import { getCategoryIcon, CATEGORY_OPTIONS } from '../../constants/categories';
import QuickHelpIntroModal from '../QuickHelpIntroModal';
import { NotificationBell } from '../Layout/Header/NotificationBell';
import { useNotifications } from '../Layout/Header/hooks/useNotifications';

import { Task, SheetPosition } from './types';
import { mobileTasksStyles } from './styles';
import {
  addMarkerOffsets,
  createUserLocationIcon,
  getJobPriceIcon,
} from './utils';
import {
  MapController,
  MobileJobCard,
  JobPreviewCard,
  CreateChoiceModal,
  SlideOutMenu,
} from './components';

// Reduced timeout for faster perceived loading
const LOCATION_TIMEOUT_MS = 3000;

/**
 * Main Mobile Tasks View Component
 * Displays a map with task markers and a draggable bottom sheet with task list
 */
const MobileTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Fetch unread counts for notifications (only when authenticated)
  const { data: unreadCounts } = useUnreadCounts({ enabled: isAuthenticated });

  // Use notifications hook for the bell component
  const {
    notifications,
    totalNotifications,
    markNotificationsAsRead,
    clearNotificationType,
  } = useNotifications(isAuthenticated);

  // Task data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // Default location: Riga, Latvia
  const [userLocation, setUserLocation] = useState({ lat: 56.9496, lng: 24.1052 });
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Check if user has already seen and agreed to intro
  const hasSeenIntro = localStorage.getItem('quickHelpIntroSeen') === 'true';

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Show intro modal automatically only for first-time users
  const [showIntroModal, setShowIntroModal] = useState(!hasSeenIntro);
  // Track if this is a manual open (from menu) vs automatic (first time)
  const [isManualIntroOpen, setIsManualIntroOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showJobList, setShowJobList] = useState(true);

  // Bottom sheet state
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('half');
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  
  // Refs for controlling fetches and geolocation
  const hasAttemptedGeolocation = useRef(false);
  const hasFetchedInitial = useRef(false);

  // Calculate sheet height based on position
  const getSheetHeight = () => {
    const vh = window.innerHeight;
    switch (sheetPosition) {
      case 'collapsed':
        return 100;
      case 'half':
        return Math.round(vh * 0.4);
      case 'full':
        return Math.round(vh * 0.85);
      default:
        return Math.round(vh * 0.4);
    }
  };

  const sheetHeight = getSheetHeight();

  // Fetch tasks function
  const fetchTasks = async (lat: number, lng: number, radius: number, category: string) => {
    setLoading(true);
    try {
      const effectiveRadius = radius === 0 ? 500 : radius;
      const response = await getTasks({
        latitude: lat,
        longitude: lng,
        radius: effectiveRadius,
        status: 'open',
        category: category !== 'all' ? category : undefined,
      });

      const tasksWithIcons = response.tasks.map((task) => ({
        ...task,
        icon: getCategoryIcon(task.category),
      }));

      setTasks(tasksWithIcons);
    } catch (err) {
      console.error('Failed to load jobs', err);
    }
    setLoading(false);
  };

  // Initialize: Get saved radius, start geolocation, and fetch data immediately
  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;

    // Load saved radius
    const savedRadius = localStorage.getItem('taskSearchRadius');
    const initialRadius = savedRadius ? parseInt(savedRadius, 10) : 25;
    if (savedRadius) setSearchRadius(initialRadius);

    // Fetch immediately with default location (don't wait for geolocation)
    fetchTasks(56.9496, 24.1052, initialRadius, 'all');

    // Try to get user's actual location in background
    if (navigator.geolocation && !hasAttemptedGeolocation.current) {
      hasAttemptedGeolocation.current = true;
      
      const timeoutId = setTimeout(() => {
        // Timeout - stay with default location, data already loaded
      }, LOCATION_TIMEOUT_MS);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          // Refresh data with actual location
          fetchTasks(newLocation.lat, newLocation.lng, initialRadius, 'all');
        },
        () => {
          clearTimeout(timeoutId);
          // Permission denied - keep default location, data already loaded
        },
        { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
      );
    }
  }, []);

  // Refetch when filters change (but not on initial mount)
  useEffect(() => {
    if (!hasFetchedInitial.current) return;
    fetchTasks(userLocation.lat, userLocation.lng, searchRadius, selectedCategory);
  }, [searchRadius, selectedCategory]);

  // Memoized values
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Event handlers
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    localStorage.setItem('taskSearchRadius', newRadius.toString());
  };

  const handleRecenter = () => {
    setSelectedTask(null);
    setShowJobList(true);
    setRecenterTrigger((prev) => prev + 1);
  };

  const handleJobSelect = (task: Task) => {
    setShowJobList(false);
    setTimeout(() => setSelectedTask(task), 50);
  };

  const handleMarkerClick = (task: Task) => {
    setShowJobList(false);
    setTimeout(() => setSelectedTask(task), 50);
  };

  const handleClosePreview = () => {
    setSelectedTask(null);
    setTimeout(() => {
      setShowJobList(true);
      setSheetPosition('half');
    }, 100);
  };

  const handleViewDetails = () => {
    if (selectedTask) navigate(`/tasks/${selectedTask.id}`);
  };

  const handleCreatorClick = () => {
    if (selectedTask) {
      const creatorId =
        selectedTask.creator_id ||
        selectedTask.user_id ||
        selectedTask.created_by;
      if (creatorId) navigate(`/users/${creatorId}`);
    }
  };

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setShowCreateModal(true);
    } else {
      navigate('/login');
    }
  };

  // Handle opening intro from menu (manual open - no checkboxes)
  const handleShowIntroFromMenu = () => {
    setIsManualIntroOpen(true);
    setShowIntroModal(true);
  };

  // Handle closing intro modal
  const handleCloseIntro = () => {
    setShowIntroModal(false);
    setIsManualIntroOpen(false);
  };

  // Sheet drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = () => {};

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const endY = e.changedTouches[0].clientY;
    const deltaY = startYRef.current - endY;
    const threshold = 50;

    if (deltaY > threshold) {
      if (sheetPosition === 'collapsed') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('full');
    } else if (deltaY < -threshold) {
      if (sheetPosition === 'full') setSheetPosition('half');
      else if (sheetPosition === 'half') setSheetPosition('collapsed');
    }
  };

  // Category pills data
  const categories = [
    { value: 'all', icon: '🌐', label: 'All' },
    ...CATEGORY_OPTIONS.slice(1, 10),
  ];

  // Calculate total badge count for hamburger menu
  const totalUnread = unreadCounts?.total || 0;

  return (
    <>
      <style>{mobileTasksStyles}</style>

      {/* Slide-out Menu */}
      <SlideOutMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
        navigate={navigate}
        onShowIntro={handleShowIntroFromMenu}
        unreadMessages={unreadCounts?.messages || 0}
        newApplications={unreadCounts?.notifications || 0}
      />

      {/* Create Choice Modal */}
      <CreateChoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostJob={() => navigate('/tasks/create')}
        onOfferService={() => navigate('/offerings/create')}
      />

      {/* Quick Help Intro Modal */}
      {/* showCheckboxes: true for first-time (must agree), false when opened from menu */}
      <QuickHelpIntroModal
        isOpen={showIntroModal}
        onClose={handleCloseIntro}
        showCheckboxes={!hasSeenIntro && !isManualIntroOpen}
      />

      <div className="mobile-tasks-container">
        {/* TOP BAR - Menu + Notification Bell + Search + Radius */}
        {/* Higher z-index than map to ensure dropdowns appear above */}
        <div className="bg-white shadow-md flex-shrink-0 relative" style={{ zIndex: 10000 }}>
          {/* Search Bar Row */}
          <div className="p-3 pb-2">
            <div className="flex gap-2 items-center">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 active:bg-gray-200 relative"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tasks.searchPlaceholder', 'Search jobs...')}
                  className="w-full bg-gray-100 rounded-full px-4 py-2.5 pl-10 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>

              {/* Radius Selector */}
              <select
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="bg-gray-100 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 border-0 appearance-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                style={{ minWidth: '70px' }}
              >
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
                <option value={50}>50km</option>
                <option value={0}>
                  🇱🇻 {t('tasks.allLatvia', 'All')}
                </option>
              </select>

              {/* Notification Bell - Visible when authenticated */}
              {isAuthenticated && (
                <NotificationBell
                  notifications={notifications}
                  totalNotifications={totalNotifications}
                  onMarkAsRead={markNotificationsAsRead}
                  onClearType={clearNotificationType}
                  isMobile={true}
                />
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="px-3 pb-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAP AREA */}
        <div className="flex-1 relative" style={{ minHeight: '200px', zIndex: 1 }}>
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
              isMenuOpen={isMenuOpen}
              sheetPosition={sheetPosition}
            />

            {/* User Location Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold text-blue-600">
                    📍 {t('tasks.youAreHere', 'You are here')}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Job Markers */}
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

          {/* Floating Recenter Button */}
          {!selectedTask && showJobList && (
            <div
              className="absolute right-4 z-[1000]"
              style={{ bottom: '16px' }}
            >
              <button
                onClick={handleRecenter}
                className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100"
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

          {/* Job Preview Card */}
          {selectedTask && (
            <JobPreviewCard
              task={selectedTask}
              userLocation={userLocation}
              onViewDetails={handleViewDetails}
              onClose={handleClosePreview}
              onCreatorClick={handleCreatorClick}
            />
          )}
        </div>

        {/* BOTTOM SHEET - Job List */}
        {!selectedTask && showJobList && (
          <div
            className="bg-white rounded-t-3xl shadow-2xl flex-shrink-0 flex flex-col animate-slideUp"
            style={{
              height: `${sheetHeight}px`,
              transition: isDragging ? 'none' : 'height 0.3s ease-out',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
            }}
          >
            {/* Drag Handle Area */}
            <div
              className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />

              {/* Header Row */}
              <div className="flex items-center justify-between w-full px-4">
                <span className="text-base font-bold text-gray-800">
                  💰 {filteredTasks.length} {t('tasks.jobsNearby', 'jobs nearby')}
                </span>

                {/* Create Button */}
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label={t(
                    'tasks.createJobOrService',
                    'Create job or service'
                  )}
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

            {/* Jobs List - Scrollable */}
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
                    {t(
                      'tasks.tryDifferentCategory',
                      'Try a different category or increase radius'
                    )}
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
                  <div className="h-8" />
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
