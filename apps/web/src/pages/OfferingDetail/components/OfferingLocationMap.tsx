import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OfferingLocationMapProps } from '../types';

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
        <span>\ud83d\udccd</span>
        <span className="font-medium text-gray-700">{safeLocation.split(',')[0] || 'Location'}</span>
        {serviceRadius && (
          <>
            <span className="text-gray-300">\u00b7</span>
            <span className="text-amber-600 text-xs">{serviceRadius}km radius</span>
          </>
        )}
      </div>
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
      >
        Open in Maps \u2192
      </a>
    </div>
    <div className="h-32 md:h-48 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
