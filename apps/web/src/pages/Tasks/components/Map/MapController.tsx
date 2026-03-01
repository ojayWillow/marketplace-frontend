import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LATVIA_CENTER, LATVIA_ZOOM } from '../../../../constants/locations';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
}

const MapController = ({ lat, lng, radius }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !map.getContainer()) return;

    if (radius === 0) {
      map.setView([LATVIA_CENTER.lat, LATVIA_CENTER.lng], LATVIA_ZOOM);
    } else {
      let zoom = 13;
      if (radius <= 5) zoom = 13;
      else if (radius <= 10) zoom = 12;
      else if (radius <= 25) zoom = 11;
      else if (radius <= 50) zoom = 10;
      else if (radius <= 100) zoom = 9;
      else zoom = 8;

      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, radius, map]);

  // Stop all animations and clean up on unmount to prevent _leaflet_pos errors
  useEffect(() => {
    return () => {
      if (map) {
        try {
          map.stop();
        } catch {
          // map may already be removed
        }
      }
    };
  }, [map]);

  return null;
};

export default MapController;
