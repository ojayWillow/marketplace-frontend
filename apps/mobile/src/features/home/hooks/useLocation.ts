import { useState, useEffect, RefObject } from 'react';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

const DEFAULT_LOCATION = { latitude: 56.9496, longitude: 24.1052 };

export function useLocation(mapRef: RefObject<MapView>) {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [hasRealLocation, setHasRealLocation] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          const coords = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
          setUserLocation(coords);
          setHasRealLocation(true);
          
          mapRef.current?.animateToRegion({
            ...coords,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }, 500);
        }
      } catch (e) {}

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(coords);
        setHasRealLocation(true);
        
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }, 500);
      } catch (e) {
        console.log('Could not get current location:', e);
      }
    })();
  }, []);

  return { userLocation, hasRealLocation };
}
