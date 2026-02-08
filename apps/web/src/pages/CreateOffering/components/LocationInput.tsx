import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { divIcon, type LatLng } from 'leaflet';
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
  locationConfirmed?: boolean;
}

const pinIcon = divIcon({
  className: 'custom-pin-icon',
  html: '<div style="background:#f59e0b;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Flies/pans the map when coordinates change from outside (e.g. address selection)
const MapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const prevCoords = useRef({ lat, lng });

  useEffect(() => {
    const moved = Math.abs(prevCoords.current.lat - lat) > 0.0001 || Math.abs(prevCoords.current.lng - lng) > 0.0001;
    if (moved) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
      prevCoords.current = { lat, lng };
    }
  }, [lat, lng, map]);

  return null;
};

// Handles map click events
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationInput = ({
  location,
  latitude,
  longitude,
  onChange,
  onSelect,
  onCoordsChange,
  locationConfirmed = false,
}: LocationInputProps) => {
  const { searching, suggestions, clearSuggestions } = useAddressSearch(location);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [reverseLoading, setReverseLoading] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result);
    clearSuggestions();
    setShowSuggestions(false);
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReverseLoading(true);
    onCoordsChange(lat, lng);
    // Parent will handle reverse geocoding; loading state cleared when location updates
  }, [onCoordsChange]);

  const handleMarkerDragEnd = useCallback((e: { target: { getLatLng: () => LatLng } }) => {
    const latlng = e.target.getLatLng();
    setReverseLoading(true);
    onCoordsChange(latlng.lat, latlng.lng);
  }, [onCoordsChange]);

  // Clear reverse loading when location text updates (meaning reverse geocode finished)
  useEffect(() => {
    if (location && reverseLoading) {
      setReverseLoading(false);
    }
  }, [location, reverseLoading]);

  // Show suggestions again when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
    onChange(e);
  };

  const handleInputFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestion
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Shorten display name for the confirmation badge
  const shortLocation = location
    ? location.split(',').slice(0, 2).join(',').trim()
    : '';

  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
        Your Location *
        {(searching || reverseLoading) && (
          <span className="text-amber-500 text-xs ml-2 animate-pulse">
            {reverseLoading ? '(locating...)' : '(searching...)'}
          </span>
        )}
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
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search address or tap the map"
          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          autoComplete="off"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((result, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
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
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={latitude} lng={longitude} />
          <Marker
            position={[latitude, longitude]}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        {/* Tap hint overlay — shown only when no location set */}
        {!location && !reverseLoading && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-[1000]">
            Tap to set location
          </div>
        )}

        {/* Reverse geocoding loading overlay */}
        {reverseLoading && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-[1000] animate-pulse">
            Finding address...
          </div>
        )}
      </div>

      {/* Confirmed location badge */}
      {locationConfirmed && location && !reverseLoading && (
        <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-600 text-xs">✅</span>
          <p className="text-[11px] text-green-700 font-medium truncate flex-1">
            {shortLocation}
          </p>
          <p className="text-[10px] text-green-500 shrink-0">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      )}

      {/* Fallback: show raw coords if location text exists but not confirmed */}
      {!locationConfirmed && location && !reverseLoading && (
        <p className="text-[10px] text-gray-400 mt-1">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationInput;
