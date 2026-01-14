import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../stores/authStore';
import { useMatchingStore } from '../stores/matchingStore';
import { CATEGORY_OPTIONS } from '../constants/categories';
import CompactFilterBar from '../components/ui/CompactFilterBar';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTasksView from '../components/MobileTasksView';
import QuickHelpIntroModal from '../components/QuickHelpIntroModal';

// Fix Leaflet default icon issue with Vite
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// EXTRACTED COMPONENTS ✅
import { TaskCard } from './Tasks/components/TaskCard';
import { OfferingCard } from './Tasks/components/OfferingCard';
import { MapMarkers } from './Tasks/components/Map';
import { LocationLoadingState, DataLoadingState, ErrorState } from './Tasks/components/LoadingStates';
import LocationModal from './Tasks/components/LocationModal';
import { UrgentJobsBanner, MatchingJobsBanner, MapLoadingOverlay } from './Tasks/components/Banners';

// EXTRACTED HOOKS ✅
import { useTaskLocation } from './Tasks/hooks/useTaskLocation';
import { useTaskData } from './Tasks/hooks/useTaskData';
import { useTaskFilters } from './Tasks/hooks/useTaskFilters';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// =====================================================
// MAIN TASKS COMPONENT WITH MOBILE/DESKTOP SWITCH
// =====================================================
const Tasks = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileTasksView />;
  }
  
  return <DesktopTasksView />;
};

// =====================================================
// DESKTOP TASKS VIEW - Now using extracted hooks!
// =====================================================
const DesktopTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { loadMyOfferings, isJobMatchingMyOfferings, myOfferingCategories } = useMatchingStore();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'jobs' | 'offerings' | 'all'>('all');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ✅ LOCATION HOOK - handles geolocation, manual selection, display names
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

  // ✅ FILTERS HOOK - handles filter state, search, localStorage
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

  // ✅ DATA HOOK - handles API calls, loading states
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

  // Check intro modal on mount
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('quickHelpIntroSeen');
    if (!hasSeenIntro) setShowIntroModal(true);
  }, []);

  // Load user's offerings for matching
  useEffect(() => {
    if (isAuthenticated) loadMyOfferings();
  }, [isAuthenticated, loadMyOfferings]);

  // Wrapped handlers that trigger data refresh
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

  // Loading states
  if (locationLoading) {
    return <LocationLoadingState onSkip={skipLocationDetection} />;
  }

  if (initialLoading && !hasEverLoaded) {
    return <DataLoadingState searchRadius={searchRadius} locationName={locationName} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => { resetFetchFlag(); fetchData(true); }} 
      />
    );
  }

  // Apply filters
  const filteredTasks = filterTasks(tasks);
  const filteredOfferings = filterOfferings(offerings);
  
  // Computed values
  const matchingJobsCount = isAuthenticated 
    ? filteredTasks.filter(task => isJobMatchingMyOfferings(task.category)).length 
    : 0;
  const urgentJobsCount = filteredTasks.filter(task => task.is_urgent).length;
  const maxBudget = Math.max(...filteredTasks.map(t => t.budget || t.reward || 0), 0);
  const hasHighValueJobs = filteredTasks.some(t => (t.budget || t.reward || 0) > 75);

  // Map markers based on active tab
  const getMapMarkers = () => {
    if (activeTab === 'jobs') return { tasks: filteredTasks, boosted: [] };
    if (activeTab === 'offerings') return { tasks: [], boosted: boostedOfferings };
    return { tasks: filteredTasks, boosted: boostedOfferings };
  };
  const { tasks: mapTasks, boosted: mapBoostedOfferings } = getMapMarkers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tasks.title', 'Quick Help')}</h1>
              <p className="text-gray-600">{t('tasks.subtitle', 'Find jobs nearby and earn money')} 💰</p>
            </div>
            <button
              onClick={() => setShowIntroModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
              title={t('quickHelp.howItWorks', 'How it works')}
            >
              <span>❓</span>
              <span className="hidden sm:inline">{t('quickHelp.howItWorks', 'How it works')}</span>
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/tasks/create')} className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center gap-2">
                  <span>💰</span> {t('tasks.postJob', 'Post a Job')}
                </button>
                <button onClick={() => navigate('/offerings/create')} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2">
                  <span>👋</span> {t('tasks.offerService', 'Offer Service')}
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                {t('tasks.loginToPost', 'Login to Post Jobs or Offer Services')}
              </button>
            )}
          </div>
        </div>

        {/* Banners */}
        <UrgentJobsBanner urgentCount={urgentJobsCount} onViewJobs={() => setActiveTab('jobs')} />
        {isAuthenticated && (
          <MatchingJobsBanner 
            matchingCount={matchingJobsCount} 
            categories={myOfferingCategories} 
            onViewJobs={() => setActiveTab('jobs')} 
          />
        )}

        {/* Filter Bar */}
        <div className="mb-4 relative" style={{ zIndex: 1000 }}>
          <CompactFilterBar
            filters={filters}
            onChange={handleFiltersChange}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            locationName={locationName}
            onLocationClick={() => setShowLocationModal(!showLocationModal)}
            maxPriceLimit={500}
            categoryOptions={CATEGORY_OPTIONS}
            variant={activeTab === 'offerings' ? 'offerings' : 'jobs'}
          />
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onLocationSelect={handleLocationSelect}
            onResetToAuto={handleResetToAuto}
            manualLocationSet={manualLocationSet}
          />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🌐 {t('common.all', 'All')} ({filteredTasks.length + filteredOfferings.length})
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors relative ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            💰 {t('common.jobs', 'Jobs')} ({filteredTasks.length})
            {urgentJobsCount > 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{urgentJobsCount} ⚡</span>
            )}
            {isAuthenticated && matchingJobsCount > 0 && urgentJobsCount === 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{matchingJobsCount} {t('tasks.match', 'match')}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('offerings')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'offerings' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            👋 {t('common.offerings', 'Offerings')} ({filteredOfferings.length})
          </button>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Map Legend */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">{t('map.legend', 'Map')}:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }} />
              <span className="text-gray-600">{t('map.you', 'You')}</span>
            </div>
            {searchRadius === 0 && (
              <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-full">
                <span className="text-sm">🇱🇻</span>
                <span className="text-blue-700 font-medium text-xs">{t('tasks.viewingAllLatvia', 'Viewing all of Latvia')}</span>
              </div>
            )}
            {urgentJobsCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold border-2 border-red-400">€</span>
                <span className="text-red-600 text-xs font-medium">{t('map.urgentJobs', 'Urgent')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">€25</span>
              <span className="text-gray-500 text-xs">{t('map.quickTasks', 'Quick tasks')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">€50</span>
              <span className="text-gray-500 text-xs">{t('map.mediumJobs', 'Medium')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)' }}>€100+</span>
              <span className="text-gray-500 text-xs">{t('map.premiumJobs', 'Premium')} ✨</span>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span className="w-6 h-6 flex items-center justify-center text-white rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>🧹</span>
              <span className="text-gray-500 text-xs">{t('map.boostedOfferings', 'Boosted services')}</span>
            </div>
          </div>
          
          {/* Map Container */}
          <div className="relative" style={{ height: '350px' }}>
            <MapLoadingOverlay isLoading={refreshing} searchRadius={searchRadius} />
            <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapMarkers
                tasks={mapTasks}
                boostedOfferings={mapBoostedOfferings}
                userLocation={userLocation}
                locationName={locationName}
                manualLocationSet={manualLocationSet}
                onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)}
                searchRadius={searchRadius}
              />
            </MapContainer>
          </div>
          
          {/* Map Stats */}
          {(filteredTasks.length > 0 || mapBoostedOfferings.length > 0) && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-blue-700">💰 {t('tasks.jobsOnMap', '{{count}} job(s) on map', { count: mapTasks.length })}</span>
              {urgentJobsCount > 0 && <span className="font-medium text-red-600">⚡ {t('tasks.urgentOnMap', '{{count}} urgent', { count: urgentJobsCount })}</span>}
              {mapBoostedOfferings.length > 0 && <span className="font-medium text-amber-700">👋 {t('offerings.boostedOnMap', '{{count}} boosted service(s)', { count: mapBoostedOfferings.length })}</span>}
              {maxBudget > 0 && <span className="text-green-600">{t('tasks.topPayout', 'Top payout')}: €{maxBudget}</span>}
              {hasHighValueJobs && <span className="text-purple-600 font-medium">✨ {t('tasks.premiumAvailable', 'Premium jobs available!')}</span>}
            </div>
          )}
        </div>

        {/* Jobs List */}
        {(activeTab === 'all' || activeTab === 'jobs') && (
          <div className="mb-8">
            {activeTab === 'all' && <h2 className="text-2xl font-bold mb-4 text-gray-900">💰 {t('tasks.availableJobs', 'Available Jobs')}</h2>}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg mb-2">{t('tasks.noJobsFound', 'No jobs found')}</p>
                <p className="text-gray-400">{hasActiveFilters ? t('tasks.tryDifferentFilters', 'Try adjusting your filters') : t('tasks.checkBackLater', 'Check back later for new opportunities')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} userLocation={userLocation} isMatching={isAuthenticated && isJobMatchingMyOfferings(task.category)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offerings List */}
        {(activeTab === 'all' || activeTab === 'offerings') && (
          <div>
            {activeTab === 'all' && <h2 className="text-2xl font-bold mb-4 text-gray-900">👋 {t('offerings.availableServices', 'Available Services')}</h2>}
            {filteredOfferings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg mb-2">{t('offerings.noOfferingsFound', 'No services found')}</p>
                <p className="text-gray-400">{hasActiveFilters ? t('tasks.tryDifferentFilters', 'Try adjusting your filters') : t('offerings.checkBackLater', 'Check back later for new services')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOfferings.map((offering) => (
                  <OfferingCard key={offering.id} offering={offering} userLocation={userLocation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Intro Modal */}
      <QuickHelpIntroModal isOpen={showIntroModal} onClose={() => setShowIntroModal(false)} showCheckboxes={!localStorage.getItem('quickHelpIntroSeen')} />
    </div>
  );
};

export default Tasks;
