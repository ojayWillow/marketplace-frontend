import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserLocation, LocationType } from '../types';

// Default location: Riga, Latvia
const DEFAULT_LOCATION: UserLocation = { lat: 56.9496, lng: 24.1052 };
// Reduced timeout from 5s to 3s for faster page load
const LOCATION_TIMEOUT_MS = 3000;

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
  
  // Start with location granted = true to not block UI
  // We'll show content immediately with default location
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [locationGranted, setLocationGranted] = useState(true); // Changed: don't block UI
  const [locationLoading, setLocationLoading] = useState(false); // Changed: no loading screen
  const [locationType, setLocationType] = useState<LocationType>('default');
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
    onLocationChange?.();
  }, [onLocationChange]);

  // Reset to auto-detected location
  const resetToAutoLocation = useCallback((onReset?: () => void) => {
    setLocationType('auto');
    setManualLocationName(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
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
      // Timeout reached - stay with default location
      setLocationType('default');
    }, LOCATION_TIMEOUT_MS);

    // Try to get user's location in background
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - update to user's location
        setUserLocation({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        setLocationType('auto');
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
        // Trigger a refresh with new location
        onLocationChange?.();
      },
      () => {
        // Permission denied or error - keep default location
        setLocationType('default');
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
