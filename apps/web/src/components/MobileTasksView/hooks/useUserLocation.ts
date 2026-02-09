import { useState, useEffect, useRef, useCallback } from 'react';

const LOCATION_TIMEOUT_MS = 3000;
const DEFAULT_LOCATION = { lat: 56.9496, lng: 24.1052 }; // Riga, Latvia
const LOCATION_CACHE_KEY = 'user_last_location';
const LOCATION_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Read cached location from localStorage.
 * Returns valid, non-expired coordinates or null.
 */
function getCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;

    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > LOCATION_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    // Sanity: must be roughly within Latvia
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
 * Persist location to localStorage.
 */
function setCachedLocation(lat: number, lng: number): void {
  try {
    const entry: CachedLocation = { lat, lng, timestamp: Date.now() };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore — localStorage may be full or unavailable
  }
}

interface UseUserLocationOptions {
  onLocationReady?: (lat: number, lng: number) => void;
  onInitialFetch?: (lat: number, lng: number) => void;
}

/**
 * Hook managing user geolocation and map recentering.
 *
 * Now uses localStorage-cached location as initial value so returning
 * users start from their real location, not always Riga.
 * Background GPS still fires and updates the cache.
 */
export const useUserLocation = ({
  onLocationReady,
  onInitialFetch,
}: UseUserLocationOptions = {}) => {
  // Start from cached location (if available), otherwise Riga default
  const cachedLoc = useRef(getCachedLocation());
  const initialLocation = cachedLoc.current || DEFAULT_LOCATION;

  const [userLocation, setUserLocation] = useState(initialLocation);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const hasAttemptedGeolocation = useRef(false);

  useEffect(() => {
    // Trigger initial fetch with best-known location (cached or default)
    onInitialFetch?.(initialLocation.lat, initialLocation.lng);

    // Try to get user's actual location in background
    if (navigator.geolocation && !hasAttemptedGeolocation.current) {
      hasAttemptedGeolocation.current = true;

      const timeoutId = setTimeout(() => {
        // Timeout — stay with initial location, data already loaded
      }, LOCATION_TIMEOUT_MS);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };

          setUserLocation(newLocation);
          setCachedLocation(latitude, longitude);

          // Only trigger refetch if user moved significantly from
          // the initial location (>500m). Avoids redundant API call
          // when cached location is still accurate.
          const cached = cachedLoc.current;
          if (cached) {
            const moved = Math.abs(latitude - cached.lat) + Math.abs(longitude - cached.lng);
            if (moved < 0.005) return; // ~500m — not worth refetching
          }

          onLocationReady?.(latitude, longitude);
        },
        () => {
          clearTimeout(timeoutId);
          // Permission denied — keep initial location
        },
        { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
      );
    }
  }, []);

  const handleRecenter = useCallback(() => {
    setRecenterTrigger((prev) => prev + 1);
  }, []);

  return {
    userLocation,
    recenterTrigger,
    handleRecenter,
  };
};
