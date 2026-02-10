import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { Offering } from '@marketplace/shared';
import { createUserLocationIcon, getJobPriceIcon, getBoostedOfferingIcon } from '../../utils/markerIcons';
import { addMarkerOffsets } from '../../utils';
import MapController from './MapController';
import LocationPicker from './LocationPicker';
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
      
      {/* Job/Task markers - Price labels */}
      {tasksWithOffsets.map((task) => {
        const budget = task.budget || task.reward || 0;
        const jobIcon = getJobPriceIcon(budget, task.is_urgent);
        // Use display coordinates (with offset if overlapping) or fall back to original
        const displayLat = task.displayLatitude || task.latitude;
        const displayLng = task.displayLongitude || task.longitude;
        
        return (
          <Marker 
            key={`task-${task.id}`} 
            position={[displayLat, displayLng]}
            icon={jobIcon}
          >
            <Popup
              maxWidth={260}
              minWidth={240}
              autoPan={true}
              autoPanPadding={[20, 20]}
              className="job-marker-popup"
            >
              <JobMapPopup task={task} userLocation={userLocation} />
            </Popup>
          </Marker>
        );
      })}
      
      {/* Boosted Offering markers - Category emoji in orange bubble */}
      {boostedOfferings.map((offering) => {
        const offeringIcon = getBoostedOfferingIcon(offering.category);
        
        return (
          <Marker 
            key={`offering-${offering.id}`} 
            position={[offering.latitude, offering.longitude]} 
            icon={offeringIcon}
          >
            <Popup
              maxWidth={260}
              minWidth={240}
              autoPan={true}
              autoPanPadding={[20, 20]}
              className="offering-marker-popup"
            >
              <OfferingMapPopup offering={offering} userLocation={userLocation} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default MapMarkers;
