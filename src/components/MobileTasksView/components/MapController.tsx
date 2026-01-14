import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Task } from '../types';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
  recenterTrigger: number;
  selectedTask: Task | null;
}

/**
 * Map controller component for handling zoom/center changes
 * Must be used inside a MapContainer
 */
const MapController = ({
  lat,
  lng,
  radius,
  recenterTrigger,
  selectedTask,
}: MapControllerProps) => {
  const map = useMap();

  // Handle radius changes and recenter
  useEffect(() => {
    if (radius === 0) {
      // Show all of Latvia
      map.setView([56.8796, 24.6032], 7);
    } else {
      let zoom = 13;
      if (radius <= 5) zoom = 13;
      else if (radius <= 10) zoom = 12;
      else if (radius <= 25) zoom = 11;
      else if (radius <= 50) zoom = 10;
      else zoom = 9;
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, radius, map, recenterTrigger]);

  // Pan to selected task - Position marker in UPPER portion of map
  useEffect(() => {
    if (selectedTask) {
      const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
      const taskLng = selectedTask.displayLongitude || selectedTask.longitude;

      map.invalidateSize();
      map.setView([taskLat, taskLng], 14, { animate: false });

      setTimeout(() => {
        const mapContainer = map.getContainer();
        const mapHeight = mapContainer.offsetHeight;
        const desiredMarkerPosition = mapHeight * 0.25;
        const currentMarkerPosition = mapHeight * 0.5;
        const panAmount = currentMarkerPosition - desiredMarkerPosition;

        map.panBy([0, panAmount], { animate: true, duration: 0.4 });
      }, 150);
    }
  }, [selectedTask, map]);

  // Invalidate size on mount to handle container size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  });

  return null;
};

export default MapController;
