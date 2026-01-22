import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Default location (Riga) if permission denied
const DEFAULT_LOCATION: UserLocation = {
  latitude: 56.9496,
  longitude: 24.1052,
};

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (!isMounted) return;

        if (status !== 'granted') {
          setUserLocation(DEFAULT_LOCATION);
          setLocationError('Location permission denied');
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        
        if (!isMounted) return;

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setLocationError(null);
      } catch (error) {
        if (!isMounted) return;
        setUserLocation(DEFAULT_LOCATION);
        setLocationError('Failed to get location');
      } finally {
        if (isMounted) {
          setIsLoadingLocation(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    userLocation,
    locationError,
    isLoadingLocation,
  };
};
