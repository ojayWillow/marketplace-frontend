import { useState, useEffect, useRef, useCallback } from 'react';

const LOCATION_TIMEOUT_MS = 3000;
const DEFAULT_LOCATION = { lat: 56.9496, lng: 24.1052 }; // Riga, Latvia

interface UseUserLocationOptions {
  onLocationReady?: (lat: number, lng: number) => void;
  onInitialFetch?: (lat: number, lng: number) => void;
}

/**
 * Hook managing user geolocation and map recentering.
 */
export const useUserLocation = ({
  onLocationReady,
  onInitialFetch,
}: UseUserLocationOptions = {}) => {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const hasAttemptedGeolocation = useRef(false);

  useEffect(() => {
    // Trigger initial fetch immediately with default location
    onInitialFetch?.(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);

    // Try to get user's actual location in background
    if (navigator.geolocation && !hasAttemptedGeolocation.current) {
      hasAttemptedGeolocation.current = true;

      const timeoutId = setTimeout(() => {
        // Timeout — stay with default location, data already loaded
      }, LOCATION_TIMEOUT_MS);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          onLocationReady?.(newLocation.lat, newLocation.lng);
        },
        () => {
          clearTimeout(timeoutId);
          // Permission denied — keep default location
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
