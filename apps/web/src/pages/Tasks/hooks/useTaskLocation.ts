import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserLocation, LocationType } from '@marketplace/shared';
import { DEFAULT_LOCATION } from '../../../constants/locations';

// Reduced timeout from 5s to 3s for faster page load
const LOCATION_TIMEOUT_MS = 3000;
// localStorage key for cached location
const LOCATION_CACHE_KEY = 'user_last_location';
// Max age for cached location (24 hours in ms)
const LOCATION_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Read cached location from localStorage.
 * Returns the cached coordinates if valid and not expired, otherwise null.
 */
function getCachedLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    
    const cached: CachedLocation = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;
    
    // Expired — discard
    if (age > LOCATION_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    
    // Sanity check coordinates are in Latvia-ish range
    if (cached.lat < 55 || cached.lat > 58 || cached.lng < 20 || cached.lng > 29) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    
    return { lat: cached.lat, lng: cached.lng };
  } catch {
    return null;
  }
}

/**
 * Save location to localStorage with current timestamp.
 */
function setCachedLocation(lat: number, lng: number): void {
  try {
    const entry: CachedLocation = { lat, lng, timestamp: Date.now() };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export interface UseTaskLocationReturn {
  // Location state
  userLocation: UserLocation;
  locationGranted: boolean;
  locationLoading: boolean;
  locationType: LocationType;
  manualLocationName: string | null;
  
  // Computed values
  locationName: string;
  manualLocationSet: boolean;
  
  // Actions
  skipLocationDetection: () => void;
  handleLocationSelect: (lat: number, lng: number, name?: string) => void;
  resetToAutoLocation: (onLocationChange?: () => void) => void;
}

export const useTaskLocation = (
  onLocationChange?: () => void
): UseTaskLocationReturn => {
  const { t } = useTranslation();
  
  // Start with cached location (if any), otherwise Riga default.
  // This means returning users from Liepaja see Liepaja tasks instantly.
  const cachedLoc = getCachedLocation();
  const initialLocation = cachedLoc || DEFAULT_LOCATION;
  const initialType: LocationType = cachedLoc ? 'auto' : 'default';
  
  const [userLocation, setUserLocation] = useState<UserLocation>(initialLocation);
  const [locationGranted, setLocationGranted] = useState(true); // Don't block UI
  const [locationLoading, setLocationLoading] = useState(false); // No loading screen
  const [locationType, setLocationType] = useState<LocationType>(initialType);
  const [manualLocationName, setManualLocationName] = useState<string | null>(null);
  
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedGeolocation = useRef(false);

  // Compute display location name based on type
  const getLocationDisplayName = useCallback(() => {
    switch (locationType) {
      case 'auto':
        return t('tasks.yourLocation', 'Your location');
      case 'manual':
        return manualLocationName || t('tasks.selectedLocation', 'Selected location');
      case 'default':
      default:
        return t('tasks.defaultLocation', 'Riga, Latvia');
    }
  }, [locationType, manualLocationName, t]);

  const locationName = getLocationDisplayName();
  const manualLocationSet = locationType === 'manual';

  // Skip location detection function
  const skipLocationDetection = useCallback(() => {
    setLocationLoading(false);
    setLocationGranted(true);
    setLocationType('default');
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
  }, []);

  // Handle manual location selection
  const handleLocationSelect = useCallback((lat: number, lng: number, name?: string) => {
    setUserLocation({ lat, lng });
    setLocationType('manual');
    setManualLocationName(name || null);
    // Cache manual selections too — they represent user intent
    setCachedLocation(lat, lng);
    onLocationChange?.();
  }, [onLocationChange]);

  // Reset to auto-detected location
  const resetToAutoLocation = useCallback((onReset?: () => void) => {
    setLocationType('auto');
    setManualLocationName(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setCachedLocation(latitude, longitude);
        onReset?.();
        onLocationChange?.();
      });
    }
  }, [onLocationChange]);

  // Auto-detect location on mount (non-blocking)
  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasAttemptedGeolocation.current) return;
    hasAttemptedGeolocation.current = true;

    if (!navigator.geolocation) return;

    // Set a timeout to stop waiting for geolocation
    locationTimeoutRef.current = setTimeout(() => {
      // Timeout reached — keep whatever we started with (cached or default)
      if (!cachedLoc) {
        setLocationType('default');
      }
    }, LOCATION_TIMEOUT_MS);

    // Try to get user's location in background
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationType('auto');
        // Persist for next visit
        setCachedLocation(latitude, longitude);
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
        // Only trigger refresh if location actually changed significantly
        // (avoid unnecessary refetch if cached location was close enough)
        if (cachedLoc) {
          const moved = Math.abs(latitude - cachedLoc.lat) + Math.abs(longitude - cachedLoc.lng);
          if (moved < 0.005) return; // ~500m — not worth refetching
        }
        onLocationChange?.();
      },
      () => {
        // Permission denied or error — keep cached or default
        if (!cachedLoc) {
          setLocationType('default');
        }
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
      },
      { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
    );

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    userLocation,
    locationGranted,
    locationLoading,
    locationType,
    manualLocationName,
    
    // Computed
    locationName,
    manualLocationSet,
    
    // Actions
    skipLocationDetection,
    handleLocationSelect,
    resetToAutoLocation,
  };
};

export default useTaskLocation;
