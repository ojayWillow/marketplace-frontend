import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Task } from '@marketplace/shared';
import { useMobileMapStore } from '../stores';
import L from 'leaflet';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
  recenterTrigger: number;
  selectedTask: Task | null;
  isMenuOpen?: boolean;
  sheetPosition?: string;
  fitBothPoints?: {
    userLat: number;
    userLng: number;
    taskLat: number;
    taskLng: number;
  } | null;
}

/**
 * Map controller component for handling zoom/center changes.
 *
 * `fitBothPoints` — when provided (shared link + real GPS), the map
 * fits bounds to show both the user's location and the job so the
 * visitor can visually gauge the distance.
 */
const MapController = ({
  lat,
  lng,
  radius,
  recenterTrigger,
  selectedTask,
  isMenuOpen,
  sheetPosition,
  fitBothPoints,
}: MapControllerProps) => {
  const map = useMap();
  const store = useMobileMapStore();
  const hasRestoredViewport = useRef(false);
  const isSettingView = useRef(false);
  const hasFitBothPoints = useRef(false);

  // --- Persist viewport on every map move/zoom ---
  useEffect(() => {
    const saveViewport = () => {
      if (isSettingView.current) return;
      const center = map.getCenter();
      const zoom = map.getZoom();
      store.setMapViewport([center.lat, center.lng], zoom);
    };

    map.on('moveend', saveViewport);
    map.on('zoomend', saveViewport);
    return () => {
      map.off('moveend', saveViewport);
      map.off('zoomend', saveViewport);
    };
  }, [map, store]);

  // --- Restore viewport on mount (if persisted) ---
  useEffect(() => {
    if (hasRestoredViewport.current) return;
    hasRestoredViewport.current = true;

    if (store.mapCenter && store.mapZoom) {
      isSettingView.current = true;
      map.setView(store.mapCenter, store.mapZoom, { animate: false });
      setTimeout(() => { isSettingView.current = false; }, 200);
      return;
    }
  }, [map, store]);

  // --- Fit map to show both user + job (shared link flow) ---
  useEffect(() => {
    if (!fitBothPoints || hasFitBothPoints.current) return;
    hasFitBothPoints.current = true;

    isSettingView.current = true;
    const bounds = L.latLngBounds(
      [fitBothPoints.userLat, fitBothPoints.userLng],
      [fitBothPoints.taskLat, fitBothPoints.taskLng]
    );
    map.fitBounds(bounds, {
      padding: [60, 40],
      maxZoom: 14,
      animate: true,
      duration: 0.6,
    });
    setTimeout(() => { isSettingView.current = false; }, 700);
  }, [fitBothPoints, map]);

  // Invalidate map size when menu closes or sheet position changes
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize({ pan: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [isMenuOpen, sheetPosition, map]);

  // Handle radius changes and recenter
  useEffect(() => {
    if (store.mapCenter && store.mapZoom && !recenterTrigger) return;

    isSettingView.current = true;
    if (radius === 0) {
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
    setTimeout(() => { isSettingView.current = false; }, 200);
  }, [lat, lng, radius, map, recenterTrigger]);

  // Pan to selected task (skip if fitBothPoints handled it)
  useEffect(() => {
    if (selectedTask) {
      // If we already fit both points for this task, don't override
      if (hasFitBothPoints.current) return;

      const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
      const taskLng = selectedTask.displayLongitude || selectedTask.longitude;

      isSettingView.current = true;
      map.invalidateSize();
      map.setView([taskLat, taskLng], 14, { animate: false });

      setTimeout(() => {
        const mapContainer = map.getContainer();
        const mapHeight = mapContainer.offsetHeight;
        const desiredMarkerPosition = mapHeight * 0.25;
        const currentMarkerPosition = mapHeight * 0.5;
        const panAmount = currentMarkerPosition - desiredMarkerPosition;

        map.panBy([0, panAmount], { animate: true, duration: 0.4 });
        setTimeout(() => { isSettingView.current = false; }, 500);
      }, 150);
    }
  }, [selectedTask, map]);

  // Invalidate size on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  // Fix map tiles on back-navigation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          map.invalidateSize({ pan: false });
        }, 150);
      }
    };

    const handleResize = () => {
      map.invalidateSize({ pan: false });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
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
