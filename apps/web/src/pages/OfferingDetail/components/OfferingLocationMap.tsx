import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OfferingLocationMapProps } from '../types';
import { MAP_TILE_URL, MAP_ATTRIBUTION, MAP_TILE_PERF } from '../../../constants/map';

const offeringIcon = divIcon({
  className: 'custom-offering-icon',
  html: '<div style="background: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const OfferingLocationMap = ({ latitude, longitude, safeTitle, safeLocation, serviceRadius }: OfferingLocationMapProps) => (
  <div className="px-4 pb-4 md:px-6 md:pb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5 text-sm">
        <span>📍</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{safeLocation.split(',')[0] || 'Location'}</span>
        {serviceRadius && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-amber-600 dark:text-amber-500 text-xs">{serviceRadius}km radius</span>
          </>
        )}
      </div>
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
      >
        Open in Maps →
      </a>
    </div>
    <div className="h-32 md:h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={MAP_TILE_URL}
          {...MAP_TILE_PERF}
        />
        <Marker position={[latitude, longitude]} icon={offeringIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-xs">{safeTitle}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  </div>
);

export default OfferingLocationMap;
