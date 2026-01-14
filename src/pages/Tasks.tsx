import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { getTasks, Task as APITask } from '../api/tasks';
import { getOfferings, getBoostedOfferings, Offering } from '../api/offerings';
import { useAuthStore } from '../stores/authStore';
import { useMatchingStore } from '../stores/matchingStore';
import { getCategoryIcon, getCategoryLabel, CATEGORY_OPTIONS } from '../constants/categories';
import CompactFilterBar, { CompactFilterValues } from '../components/ui/CompactFilterBar';
import { filterByDate, filterByPrice } from '../components/ui/AdvancedFilters';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTasksView from '../components/MobileTasksView';
import QuickHelpIntroModal from '../components/QuickHelpIntroModal';

// Fix Leaflet default icon issue with Vite
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// IMPORTED FROM EXTRACTED FILES ✅
import { TaskCard } from './Tasks/components/TaskCard';
import { OfferingCard } from './Tasks/components/OfferingCard';
import { MapMarkers } from './Tasks/components/Map';
import { LocationLoadingState, DataLoadingState, ErrorState } from './Tasks/components/LoadingStates';
import LocationModal from './Tasks/components/LocationModal';
import type { Task, UserLocation, LocationType } from './Tasks/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Default filter values
const DEFAULT_FILTERS: CompactFilterValues = {
  minPrice: 0,
  maxPrice: 500,
  distance: 25,
  datePosted: 'all',
  category: 'all'
};

// =====================================================
// MAP LOADING OVERLAY - Shows when data is refreshing
// =====================================================
const MapLoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslation();
  
  if (!isLoading) return null;
  
  return (
    <div 
      className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none"
      style={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
        <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full" />
        <span className="font-medium text-gray-700">
          {t('map.updating', 'Updating map...')}
        </span>
      </div>
    </div>
  );
};

// =====================================================
// MAIN TASKS COMPONENT WITH MOBILE/DESKTOP SWITCH
// =====================================================
const Tasks = () => {
  const isMobile = useIsMobile();
  
  // On mobile devices, render the dedicated mobile view
  if (isMobile) {
    return <MobileTasksView />;
  }
  
  // On desktop/tablet, render the full desktop experience
  return <DesktopTasksView />;
};

// Desktop Tasks View (refactored implementation)
const DesktopTasksView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { loadMyOfferings, isJobMatchingMyOfferings, myOfferingCategories } = useMatchingStore();
  
  // Three main tabs: jobs, offerings, all
  const [activeTab, setActiveTab] = useState<'jobs' | 'offerings' | 'all'>('all');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [boostedOfferings, setBoostedOfferings] = useState<Offering[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>({ lat: 56.9496, lng: 24.1052 });
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationType, setLocationType] = useState<LocationType>('default');
  const [manualLocationName, setManualLocationName] = useState<string | null>(null);
  
  // Intro modal state
  const [showIntroModal, setShowIntroModal] = useState(false);
  
  // Compact Filters state
  const [filters, setFilters] = useState<CompactFilterValues>(() => {
    const saved = localStorage.getItem('taskAdvancedFilters');
    if (saved) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    const savedRadius = localStorage.getItem('taskSearchRadius');
    if (savedRadius) {
      return { ...DEFAULT_FILTERS, distance: parseInt(savedRadius, 10) };
    }
    return DEFAULT_FILTERS;
  });
  
  const searchRadius = filters.distance;
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const hasFetchedRef = useRef(false);
  const hasEverLoadedRef = useRef(false);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has seen intro modal on mount
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('quickHelpIntroSeen');
    if (!hasSeenIntro) {
      setShowIntroModal(true);
    }
  }, []);

  // Compute display location name based on type
  const getLocationDisplayName = () => {
    switch (locationType) {
      case 'auto':
        return t('tasks.yourLocation', 'Your location');
      case 'manual':
        return manualLocationName || t('tasks.selectedLocation', 'Selected location');
      case 'default':
      default:
        return t('tasks.defaultLocation', 'Riga, Latvia');
    }
  };

  const locationName = getLocationDisplayName();
  const manualLocationSet = locationType === 'manual';

  // Load user's offerings for matching (when logged in)
  useEffect(() => {
    if (isAuthenticated) {
      loadMyOfferings();
    }
  }, [isAuthenticated, loadMyOfferings]);

  // Skip location detection function
  const skipLocationDetection = () => {
    setLocationLoading(false);
    setLocationGranted(true);
    setLocationType('default');
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
  };

  useEffect(() => {
    locationTimeoutRef.current = setTimeout(() => {
      if (locationLoading) {
        skipLocationDetection();
      }
    }, 5000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationType('auto');
          if (locationTimeoutRef.current) {
            clearTimeout(locationTimeoutRef.current);
          }
        },
        () => {
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationType('default');
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLocationGranted(true);
      setLocationLoading(false);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    setUserLocation({ lat, lng });
    setLocationType('manual');
    setManualLocationName(name || null);
    hasFetchedRef.current = false;
    fetchData(true);
    setShowLocationModal(false);
  };

  const handleFiltersChange = (newFilters: CompactFilterValues) => {
    const distanceChanged = newFilters.distance !== filters.distance;
    const categoryChanged = newFilters.category !== filters.category;
    
    setFilters(newFilters);
    localStorage.setItem('taskAdvancedFilters', JSON.stringify(newFilters));
    localStorage.setItem('taskSearchRadius', newFilters.distance.toString());
    
    if (distanceChanged || categoryChanged) {
      hasFetchedRef.current = false;
      fetchData(true, newFilters.distance, newFilters.category);
    }
  };

  const resetToAutoLocation = () => {
    setLocationType('auto');
    setManualLocationName(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        hasFetchedRef.current = false;
        fetchData(true);
      });
    }
  };

  const fetchData = async (forceRefresh = false, radiusOverride?: number, categoryOverride?: string) => {
    if (hasFetchedRef.current && !forceRefresh) return;
    
    if (!hasEverLoadedRef.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const baseRadius = radiusOverride ?? searchRadius;
      const selectedCategory = categoryOverride ?? filters.category;
      const effectiveRadius = baseRadius === 0 ? 500 : baseRadius;
      
      const tasksResponse = await getTasks({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: effectiveRadius,
        status: 'open',
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      const tasksWithIcons = tasksResponse.tasks.map(task => ({
        ...task,
        icon: getCategoryIcon(task.category)
      }));
      
      setTasks(tasksWithIcons);
      
      try {
        const offeringsResponse = await getOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          status: 'active',
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setOfferings(offeringsResponse.offerings || []);
      } catch {
        setOfferings([]);
      }
      
      try {
        const boostedResponse = await getBoostedOfferings({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: effectiveRadius,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        setBoostedOfferings(boostedResponse.offerings || []);
      } catch {
        setBoostedOfferings([]);
      }
      
      hasFetchedRef.current = true;
      hasEverLoadedRef.current = true;
    } catch {
      setError(t('tasks.errorLoad', 'Failed to load data. Please try again later.'));
    }
    
    setInitialLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (locationGranted) fetchData();
  }, [locationGranted]);

  // Filter functions
  const filterTasks = (taskList: Task[]) => {
    let filtered = taskList;
    
    filtered = filtered.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    filtered = filterByDate(filtered, filters.datePosted);
    
    filtered = filtered.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    
    return filtered;
  };

  const filterOfferings = (offeringList: Offering[]) => {
    let filtered = offeringList;
    
    filtered = filtered.filter(offering => {
      const matchesSearch = searchQuery === '' || 
        offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offering.experience && offering.experience.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
    
    filtered = filterByPrice(filtered, filters.minPrice, filters.maxPrice, 500);
    filtered = filterByDate(filtered, filters.datePosted);
    
    return filtered;
  };

  // Loading states using extracted components
  if (locationLoading) {
    return <LocationLoadingState onSkip={skipLocationDetection} />;
  }

  if (initialLoading && !hasEverLoadedRef.current) {
    return <DataLoadingState searchRadius={searchRadius} locationName={locationName} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => { hasFetchedRef.current = false; fetchData(true); }} 
      />
    );
  }

  const filteredTasks = filterTasks(tasks);
  const filteredOfferings = filterOfferings(offerings);
  
  const matchingJobsCount = isAuthenticated 
    ? filteredTasks.filter(t => isJobMatchingMyOfferings(t.category)).length 
    : 0;
  
  const urgentJobsCount = filteredTasks.filter(t => t.is_urgent).length;

  const getMapMarkers = () => {
    if (activeTab === 'jobs') return { tasks: filteredTasks, boostedOfferings: [] };
    if (activeTab === 'offerings') return { tasks: [], boostedOfferings: boostedOfferings };
    return { tasks: filteredTasks, boostedOfferings: boostedOfferings };
  };

  const { tasks: mapTasks, boostedOfferings: mapBoostedOfferings } = getMapMarkers();
  
  const maxBudget = Math.max(...filteredTasks.map(t => t.budget || t.reward || 0), 0);
  const hasHighValueJobs = filteredTasks.some(t => (t.budget || t.reward || 0) > 75);

  const hasActiveFilters = 
    filters.minPrice > 0 || 
    filters.maxPrice < 500 || 
    filters.datePosted !== 'all' ||
    filters.category !== 'all';

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

        {/* Urgent jobs banner */}
        {urgentJobsCount > 0 && (
          <div className="mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold">{t('tasks.urgentJobsAvailable', '{{count}} urgent job(s) need help ASAP!', { count: urgentJobsCount })}</p>
                  <p className="text-red-100 text-sm">{t('tasks.urgentJobsDesc', 'These jobs are time-sensitive and need immediate attention')}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                {t('tasks.viewUrgentJobs', 'View Urgent Jobs')} →
              </button>
            </div>
          </div>
        )}

        {/* Matching notification banner */}
        {isAuthenticated && matchingJobsCount > 0 && myOfferingCategories.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold">{t('tasks.matchingJobs', '{{count}} job(s) match your offerings!', { count: matchingJobsCount })}</p>
                  <p className="text-blue-100 text-sm">{t('tasks.basedOnServices', 'Based on your services')}: {myOfferingCategories.map(c => getCategoryLabel(c)).join(', ')}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {t('tasks.viewMatchingJobs', 'View Matching Jobs')} →
              </button>
            </div>
          </div>
        )}

        {/* COMPACT FILTER BAR */}
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
          
          {/* Location Modal */}
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onLocationSelect={handleLocationSelect}
            onResetToAuto={resetToAutoLocation}
            manualLocationSet={manualLocationSet}
          />
        </div>

        {/* THREE TABS */}
        <div className="mb-4 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
          <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            🌐 {t('common.all', 'All')} ({filteredTasks.length + filteredOfferings.length})
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors relative ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            💰 {t('common.jobs', 'Jobs')} ({filteredTasks.length})
            {urgentJobsCount > 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {urgentJobsCount} ⚡
              </span>
            )}
            {isAuthenticated && matchingJobsCount > 0 && urgentJobsCount === 0 && activeTab !== 'jobs' && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {matchingJobsCount} {t('tasks.match', 'match')}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('offerings')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'offerings' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
            👋 {t('common.offerings', 'Offerings')} ({filteredOfferings.length})
          </button>
        </div>

        {/* MAP - Now with loading overlay */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Map Legend */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">{t('map.legend', 'Map')}:</span>
            
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }}></div>
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
          
          {/* Map container with loading overlay */}
          <div className="relative" style={{ height: '350px' }}>
            <MapLoadingOverlay isLoading={refreshing} />
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              />
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
          
          {/* Quick stats below map */}
          {(filteredTasks.length > 0 || mapBoostedOfferings.length > 0) && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-blue-700">
                💰 {t('tasks.jobsOnMap', '{{count}} job(s) on map', { count: mapTasks.length })}
              </span>
              {urgentJobsCount > 0 && (
                <span className="font-medium text-red-600">
                  ⚡ {t('tasks.urgentOnMap', '{{count}} urgent', { count: urgentJobsCount })}
                </span>
              )}
              {mapBoostedOfferings.length > 0 && (
                <span className="font-medium text-amber-700">
                  👋 {t('offerings.boostedOnMap', '{{count}} boosted service(s)', { count: mapBoostedOfferings.length })}
                </span>
              )}
              {maxBudget > 0 && (
                <span className="text-green-600">{t('tasks.topPayout', 'Top payout')}: €{maxBudget}</span>
              )}
              {hasHighValueJobs && (
                <span className="text-purple-600 font-medium">✨ {t('tasks.premiumAvailable', 'Premium jobs available!')}</span>
              )}
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
                {filteredTasks.map((task) => {
                  const isMatching = isAuthenticated && isJobMatchingMyOfferings(task.category);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      userLocation={userLocation}
                      isMatching={isMatching}
                    />
                  );
                })}
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
                  <OfferingCard
                    key={offering.id}
                    offering={offering}
                    userLocation={userLocation}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Intro Modal */}
      <QuickHelpIntroModal
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
        showCheckboxes={!localStorage.getItem('quickHelpIntroSeen')}
      />
    </div>
  );
};

export default Tasks;
