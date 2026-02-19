import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { divIcon, type LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useAddressSearch } from '../hooks';
import { GeocodingResult } from '@marketplace/shared';
import { DEFAULT_LOCATION } from '../../../constants/locations';
import { MAP_TILE_URL, MAP_ATTRIBUTION, MAP_TILE_PERF, MAP_CONTAINER_PROPS } from '../../../constants/map';

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
  className: '',
  html: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.477 15.523 0 10 0z" fill="#f59e0b"/>
    <circle cx="10" cy="10" r="4" fill="white"/>
  </svg>`,
  iconSize: [20, 28],
  iconAnchor: [10, 28],
});

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
  const { t } = useTranslation();
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
  }, [onCoordsChange]);

  const handleMarkerDragEnd = useCallback((e: { target: { getLatLng: () => LatLng } }) => {
    const latlng = e.target.getLatLng();
    setReverseLoading(true);
    onCoordsChange(latlng.lat, latlng.lng);
  }, [onCoordsChange]);

  useEffect(() => {
    if (location && reverseLoading) {
      setReverseLoading(false);
    }
  }, [location, reverseLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
    onChange(e);
  };

  const handleInputFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200);
  };

  const shortLocation = location
    ? location.split(',').slice(0, 2).join(',').trim()
    : '';

  const effectiveLat = latitude || DEFAULT_LOCATION.lat;
  const effectiveLng = longitude || DEFAULT_LOCATION.lng;

  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('createOffering.location', 'Your Location')} *
        {(searching || reverseLoading) && (
          <span className="text-amber-500 dark:text-amber-400 text-xs ml-2 animate-pulse">
            {reverseLoading ? t('createOffering.locating', '(locating...)') : t('createOffering.searching', '(searching...)')}
          </span>
        )}
      </label>

      <div className="relative mb-2 z-[1000]">
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
          placeholder={t('createOffering.searchLocation', 'Search address or tap the map')}
          className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          autoComplete="off"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 max-h-48 overflow-y-auto">
            {suggestions.map((result, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="text-xs text-gray-900 dark:text-gray-100 line-clamp-1">{result.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-36 sm:h-44 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
        <MapContainer
          center={[effectiveLat, effectiveLng]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={false}
          {...MAP_CONTAINER_PROPS}
        >
          <TileLayer
            attribution={MAP_ATTRIBUTION}
            url={MAP_TILE_URL}
            {...MAP_TILE_PERF}
          />
          <MapController lat={effectiveLat} lng={effectiveLng} />
          <Marker
            position={[effectiveLat, effectiveLng]}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        {!location && !reverseLoading && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-[1000]">
            {t('createOffering.tapToSetLocation', 'Tap to set location')}
          </div>
        )}

        {reverseLoading && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-[1000] animate-pulse">
            {t('createOffering.findingAddress', 'Finding address...')}
          </div>
        )}
      </div>

      {locationConfirmed && location && !reverseLoading && (
        <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
          <span className="text-amber-600 dark:text-amber-400 text-xs">✅</span>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate flex-1">
            {shortLocation}
          </p>
          <p className="text-[10px] text-amber-500 dark:text-amber-400 shrink-0">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      )}

      {!locationConfirmed && location && !reverseLoading && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationInput;
