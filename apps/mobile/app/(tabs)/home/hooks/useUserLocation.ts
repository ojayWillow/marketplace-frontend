import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import { DEFAULT_LOCATION } from '../constants';

interface UserLocationState {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  userLocation: UserLocationState;
  hasRealLocation: boolean;
  handleMyLocation: () => void;
}

export const useUserLocation = (mapRef: React.RefObject<MapView>): UseUserLocationResult => {
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);
  const [hasRealLocation, setHasRealLocation] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setUserLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
          setHasRealLocation(true);
          
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }, 500);
          }
        }
      } catch (e) {}

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setHasRealLocation(true);
        
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }, 500);
        }
      } catch (e) {
        console.log('Could not get current location:', e);
      }
    })();
  }, []);

  const handleMyLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  return {
    userLocation,
    hasRealLocation,
    handleMyLocation,
  };
};
