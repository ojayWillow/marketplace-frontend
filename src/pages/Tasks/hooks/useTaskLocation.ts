import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserLocation, LocationType } from '../types';

// Default location: Riga, Latvia
const DEFAULT_LOCATION: UserLocation = { lat: 56.9496, lng: 24.1052 };
const LOCATION_TIMEOUT_MS = 5000;

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
  
  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationType, setLocationType] = useState<LocationType>('default');
  const [manualLocationName, setManualLocationName] = useState<string | null>(null);
  
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-detect location on mount
  useEffect(() => {
    locationTimeoutRef.current = setTimeout(() => {
      if (locationLoading) {
        skipLocationDetection();
      }
    }, LOCATION_TIMEOUT_MS);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationType('auto');
          if (locationTimeoutRef.current) {
            clearTimeout(locationTimeoutRef.current);
          }
        },
        () => {
          // Permission denied or error - use default
          setLocationGranted(true);
          setLocationLoading(false);
          setLocationType('default');
        },
        { timeout: LOCATION_TIMEOUT_MS, enableHighAccuracy: false }
      );
    } else {
      // Geolocation not supported
      setLocationGranted(true);
      setLocationLoading(false);
    }

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
