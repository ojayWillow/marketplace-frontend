import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapMarkers } from '../../Tasks/components/Map';
import { MapLoadingOverlay } from '../../Tasks/components/Banners';

interface MapSectionProps {
  userLocation: { lat: number; lng: number };
  locationName: string;
  manualLocationSet: boolean;
  searchRadius: number;
  refreshing: boolean;
  mapTasks: any[];
  mapBoostedOfferings: any[];
  urgentJobsCount: number;
  maxBudget: number;
  hasHighValueJobs: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapSection = ({
  userLocation, locationName, manualLocationSet, searchRadius, refreshing,
  mapTasks, mapBoostedOfferings, urgentJobsCount, maxBudget, hasHighValueJobs,
  onLocationSelect,
}: MapSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Legend */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex flex-wrap items-center gap-4 text-sm">
        <span className="font-semibold text-gray-700">{t('map.legend', 'Map')}:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }} />
          <span className="text-gray-600">{t('map.you', 'You')}</span>
        </div>
        {searchRadius === 0 && (
          <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-full">
            <span className="text-sm">\uD83C\uDDF1\uD83C\uDDFB</span>
            <span className="text-blue-700 font-medium text-xs">{t('tasks.viewingAllLatvia', 'Viewing all of Latvia')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">\u20AC25</span>
          <span className="text-gray-500 text-xs">{t('map.quickTasks', 'Quick tasks')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">\u20AC50</span>
          <span className="text-gray-500 text-xs">{t('map.mediumJobs', 'Medium')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)' }}>\u20AC100+</span>
          <span className="text-gray-500 text-xs">{t('map.premiumJobs', 'Premium')} \u2728</span>
        </div>
        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <span className="w-6 h-6 flex items-center justify-center text-white rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>\uD83E\uDDF9</span>
          <span className="text-gray-500 text-xs">{t('map.boostedOfferings', 'Boosted services')}</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: '500px' }}>
        <MapLoadingOverlay isLoading={refreshing} searchRadius={searchRadius} />
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapMarkers
            tasks={mapTasks}
            boostedOfferings={mapBoostedOfferings}
            userLocation={userLocation}
            locationName={locationName}
            manualLocationSet={manualLocationSet}
            onLocationSelect={(lat, lng) => onLocationSelect(lat, lng)}
            searchRadius={searchRadius}
          />
        </MapContainer>
      </div>

      {/* Stats bar */}
      {(mapTasks.length > 0 || mapBoostedOfferings.length > 0) && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-blue-700">\uD83D\uDCB0 {t('tasks.jobsOnMap', '{{count}} job(s) on map', { count: mapTasks.length })}</span>
          {urgentJobsCount > 0 && <span className="font-medium text-red-600">\u26A1 {t('tasks.urgentOnMap', '{{count}} urgent', { count: urgentJobsCount })}</span>}
          {mapBoostedOfferings.length > 0 && <span className="font-medium text-amber-700">\uD83D\uDC4B {t('offerings.boostedOnMap', '{{count}} boosted service(s)', { count: mapBoostedOfferings.length })}</span>}
          {maxBudget > 0 && <span className="text-green-600">{t('tasks.topPayout', 'Top payout')}: \u20AC{maxBudget}</span>}
          {hasHighValueJobs && <span className="text-purple-600 font-medium">\u2728 {t('tasks.premiumAvailable', 'Premium jobs available!')}</span>}
        </div>
      )}
    </div>
  );
};

export default MapSection;
