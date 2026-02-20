import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { Offering } from '@marketplace/shared';
import { createUserLocationIcon, getJobPriceIcon, getBoostedOfferingIcon } from '../../utils/markerIcons';
import { addMarkerOffsets } from '../../utils';
import MapController from './MapController';
import LocationPicker from './LocationPicker';
import LazyPopupMarker from './LazyPopupMarker';
import JobMapPopup from './JobMapPopup';
import OfferingMapPopup from './OfferingMapPopup';
import type { Task, UserLocation } from '@marketplace/shared';

interface MapMarkersProps {
  tasks: Task[];
  boostedOfferings: Offering[];
  userLocation: UserLocation;
  locationName: string;
  manualLocationSet: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  searchRadius: number;
}

// Cache for memoized job icons to avoid re-creating divIcon objects
// Key: "budget-isUrgent", Value: L.DivIcon
const jobIconCache = new Map<string, ReturnType<typeof getJobPriceIcon>>();
const offeringIconCache = new Map<string, ReturnType<typeof getBoostedOfferingIcon>>();

const getCachedJobIcon = (budget: number, isUrgent: boolean) => {
  const key = `${budget}-${isUrgent}`;
  if (!jobIconCache.has(key)) {
    jobIconCache.set(key, getJobPriceIcon(budget, isUrgent));
  }
  return jobIconCache.get(key)!;
};

const getCachedOfferingIcon = (category: string) => {
  if (!offeringIconCache.has(category)) {
    offeringIconCache.set(category, getBoostedOfferingIcon(category));
  }
  return offeringIconCache.get(category)!;
};

const POPUP_PROPS_JOB = {
  maxWidth: 260,
  minWidth: 240,
  autoPan: true as const,
  autoPanPadding: [20, 20] as [number, number],
  className: 'job-marker-popup',
};

const POPUP_PROPS_OFFERING = {
  maxWidth: 260,
  minWidth: 240,
  autoPan: true as const,
  autoPanPadding: [20, 20] as [number, number],
  className: 'offering-marker-popup',
};

// Memoized Map Markers Component - updates without re-creating the map
const MapMarkers = ({ 
  tasks, 
  boostedOfferings, 
  userLocation, 
  locationName,
  manualLocationSet,
  onLocationSelect,
  searchRadius
}: MapMarkersProps) => {
  const { t } = useTranslation();
  
  // Memoize the user location icon
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  // Apply offsets to tasks with overlapping coordinates
  const tasksWithOffsets = useMemo(() => addMarkerOffsets(tasks), [tasks]);

  return (
    <>
      <MapController lat={userLocation.lat} lng={userLocation.lng} radius={searchRadius} />
      <LocationPicker onLocationSelect={onLocationSelect} />
      
      {/* User Location Marker - Red pin - ALWAYS visible so users can see distances */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup>
          <div className="p-1 text-center" style={{ width: '120px' }}>
            <p className="font-medium text-gray-900 text-sm">📍 {t('map.you', 'You')}</p>
            <p className="text-xs text-gray-500">{t('map.yourLocation', 'Your location')}</p>
          </div>
        </Popup>
      </Marker>
      
      {/* Job/Task markers - Price labels with lazy popups */}
      {tasksWithOffsets.map((task) => {
        const budget = task.budget || task.reward || 0;
        const jobIcon = getCachedJobIcon(budget, task.is_urgent);
        const displayLat = task.displayLatitude || task.latitude;
        const displayLng = task.displayLongitude || task.longitude;
        
        return (
          <LazyPopupMarker
            key={`task-${task.id}`}
            markerKey={`task-${task.id}`}
            position={[displayLat, displayLng]}
            icon={jobIcon}
            popupProps={POPUP_PROPS_JOB}
          >
            <JobMapPopup task={task} userLocation={userLocation} />
          </LazyPopupMarker>
        );
      })}
      
      {/* Boosted Offering markers - Category emoji with lazy popups */}
      {boostedOfferings.map((offering) => {
        const offeringIcon = getCachedOfferingIcon(offering.category);
        
        return (
          <LazyPopupMarker
            key={`offering-${offering.id}`}
            markerKey={`offering-${offering.id}`}
            position={[offering.latitude, offering.longitude]}
            icon={offeringIcon}
            popupProps={POPUP_PROPS_OFFERING}
          >
            <OfferingMapPopup offering={offering} userLocation={userLocation} />
          </LazyPopupMarker>
        );
      })}
    </>
  );
};

export default MapMarkers;
