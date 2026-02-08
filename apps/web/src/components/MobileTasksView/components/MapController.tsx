import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Task } from '@marketplace/shared';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
  recenterTrigger: number;
  selectedTask: Task | null;
  isMenuOpen?: boolean;
  sheetPosition?: string;
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
  isMenuOpen,
  sheetPosition,
}: MapControllerProps) => {
  const map = useMap();

  // Invalidate map size when menu closes or sheet position changes
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize({ pan: false });
    }, 350); // Wait for animation to complete
    return () => clearTimeout(timer);
  }, [isMenuOpen, sheetPosition, map]);

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

  // Invalidate size on mount to handle initial container size
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  // Fix map tiles not rendering on back navigation (e.g. from job details)
  // Leaflet doesn't know the container resized while it was off-screen,
  // so we need to invalidateSize when the page becomes visible again.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Small delay to let the DOM settle after navigation
        setTimeout(() => {
          map.invalidateSize({ pan: false });
        }, 150);
      }
    };

    const handleResize = () => {
      map.invalidateSize({ pan: false });
    };

    // Page Visibility API: fires when returning to the tab/app
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Window resize: catches orientation changes and navigation layout shifts
    window.addEventListener('resize', handleResize);
    // Focus: catches returning from another view in same-tab navigation
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [map]);

  return null;
};

export default MapController;
