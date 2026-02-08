import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAddressSearch } from '../hooks';
import { GeocodingResult } from '@marketplace/shared';

interface LocationInputProps {
  location: string;
  latitude: number;
  longitude: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (result: GeocodingResult) => void;
  onCoordsChange: (lat: number, lng: number) => void;
}

const pinIcon = divIcon({
  className: 'custom-pin-icon',
  html: '<div style="background:#f59e0b;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Inner component that handles map click events
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationInput = ({ location, latitude, longitude, onChange, onSelect, onCoordsChange }: LocationInputProps) => {
  const { searching, suggestions, clearSuggestions } = useAddressSearch(location);
  const [mapReady, setMapReady] = useState(false);

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result);
    clearSuggestions();
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    onCoordsChange(lat, lng);
  }, [onCoordsChange]);

  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
        Your Location *
        {searching && <span className="text-amber-500 text-xs ml-2">(searching...)</span>}
      </label>

      {/* Search input */}
      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📍</span>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={location}
          onChange={onChange}
          placeholder="Search address or tap the map"
          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          autoComplete="off"
        />

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="text-xs text-gray-900 line-clamp-1">{result.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive map */}
      <div className="h-36 sm:h-44 rounded-lg overflow-hidden border border-gray-200 relative">
        <MapContainer
          center={[latitude, longitude]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={false}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={pinIcon} />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
        {/* Tap hint overlay */}
        {!location && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-[1000]">
            Tap to set location
          </div>
        )}
      </div>

      {location && (
        <p className="text-[10px] text-gray-400 mt-1">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationInput;
