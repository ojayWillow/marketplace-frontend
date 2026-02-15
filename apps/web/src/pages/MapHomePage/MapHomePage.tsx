import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { CATEGORY_OPTIONS } from '../../constants/categories';
import CompactFilterBar from '../../components/ui/CompactFilterBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import MobileTasksView from '../../components/MobileTasksView';
import QuickHelpIntroModal, { COMMUNITY_RULES_KEY } from '../../components/QuickHelpIntroModal';
import LocationModal from '../Tasks/components/LocationModal';
import { LocationLoadingState, DataLoadingState, ErrorState } from '../Tasks/components/LoadingStates';
import { UrgentJobsBanner, MatchingJobsBanner } from '../Tasks/components/Banners';

import { useDesktopMapPage } from './hooks';
import { PageHeader, MapSection, TabBar, ItemLists } from './components';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const MapHomePage = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileTasksView /> : <DesktopMapView />;
};

const DesktopMapView = () => {
  const {
    activeTab, setActiveTab,
    showIntroModal, setShowIntroModal,
    showLocationModal, setShowLocationModal,
    userLocation, locationLoading, locationName, manualLocationSet,
    skipLocationDetection,
    filters, searchQuery, searchRadius, hasActiveFilters, setSearchQuery,
    filteredTasks, filteredOfferings,
    mapTasks, mapBoostedOfferings,
    initialLoading, refreshing, error, hasEverLoaded,
    matchingJobsCount, urgentJobsCount, maxBudget, hasHighValueJobs,
    myOfferingCategories,
    isAuthenticated,
    isJobMatchingMyOfferings,
    handleLocationSelect, handleFiltersChange, handleResetToAuto,
    handlePostJob, handleOfferService, handleRetry,
  } = useDesktopMapPage();

  if (locationLoading) return <LocationLoadingState onSkip={skipLocationDetection} />;
  if (initialLoading && !hasEverLoaded) return <DataLoadingState searchRadius={searchRadius} locationName={locationName} />;
  if (error) return <ErrorState error={error} onRetry={handleRetry} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4">
        <PageHeader
          onPostJob={handlePostJob}
          onOfferService={handleOfferService}
        />

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

        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          jobsCount={filteredTasks.length}
          offeringsCount={filteredOfferings.length}
          urgentJobsCount={urgentJobsCount}
        />

        <MapSection
          userLocation={userLocation}
          locationName={locationName}
          manualLocationSet={manualLocationSet}
          searchRadius={searchRadius}
          refreshing={refreshing}
          mapTasks={mapTasks}
          mapBoostedOfferings={mapBoostedOfferings}
          urgentJobsCount={urgentJobsCount}
          maxBudget={maxBudget}
          hasHighValueJobs={hasHighValueJobs}
          onLocationSelect={handleLocationSelect}
        />

        <ItemLists
          activeTab={activeTab}
          filteredTasks={filteredTasks}
          filteredOfferings={filteredOfferings}
          userLocation={userLocation}
          hasActiveFilters={hasActiveFilters}
          isAuthenticated={isAuthenticated}
          isJobMatchingMyOfferings={isJobMatchingMyOfferings}
        />
      </div>

      <QuickHelpIntroModal
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
        showCheckboxes={!localStorage.getItem(COMMUNITY_RULES_KEY)}
      />
    </div>
  );
};

export default MapHomePage;
