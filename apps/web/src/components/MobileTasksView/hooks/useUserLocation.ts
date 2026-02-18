import { useState, useEffect, useRef, useCallback } from 'react';

const LOCATION_TIMEOUT_MS = 10000; // 10s — generous for shared link visitors
const DEFAULT_LOCATION = { lat: 56.9496, lng: 24.1052 }; // Riga, Latvia
const LOCATION_CACHE_KEY = 'user_last_location';
const LOCATION_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

function getCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;

    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > LOCATION_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    if (cached.lat < 55 || cached.lat > 58 || cached.lng < 20 || cached.lng > 29) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return { lat: cached.lat, lng: cached.lng };
  } catch {
    return null;
  }
}

function setCachedLocation(lat: number, lng: number): void {
  try {
    const entry: CachedLocation = { lat, lng, timestamp: Date.now() };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore
  }
}

interface UseUserLocationOptions {
  onLocationReady?: (lat: number, lng: number) => void;
  onInitialFetch?: (lat: number, lng: number) => void;
}

/**
 * Hook managing user geolocation and map recentering.
 *
 * Exposes `hasRealLocation` so consumers know whether the coordinates
 * come from actual GPS/cache or the hardcoded Riga default.
 *
 * Uses a 10s timeout to give the user time to handle the community
 * rules modal before the browser’s location prompt.
 */
export const useUserLocation = ({
  onLocationReady,
  onInitialFetch,
}: UseUserLocationOptions = {}) => {
  const cachedLoc = useRef(getCachedLocation());
  const initialLocation = cachedLoc.current || DEFAULT_LOCATION;

  const [userLocation, setUserLocation] = useState(initialLocation);
  const [hasRealLocation, setHasRealLocation] = useState(!!cachedLoc.current);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const hasAttemptedGeolocation = useRef(false);

  useEffect(() => {
    onInitialFetch?.(initialLocation.lat, initialLocation.lng);

    if (navigator.geolocation && !hasAttemptedGeolocation.current) {
      hasAttemptedGeolocation.current = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };

          setUserLocation(newLocation);
          setHasRealLocation(true);
          setCachedLocation(latitude, longitude);

          const cached = cachedLoc.current;
          if (cached) {
            const moved = Math.abs(latitude - cached.lat) + Math.abs(longitude - cached.lng);
            if (moved < 0.005) return;
          }

          onLocationReady?.(latitude, longitude);
        },
        () => {
          // Permission denied or timeout — keep initial location
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
    hasRealLocation,
    recenterTrigger,
    handleRecenter,
  };
};
