import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Task } from '@marketplace/shared';
import { useMobileMapStore } from '../stores';
import { LATVIA_CENTER, LATVIA_ZOOM } from '../../../constants/locations';
import L from 'leaflet';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
  recenterTrigger: number;
  selectedTask: Task | null;
  isMenuOpen?: boolean;
  sheetPosition?: string;
  /** When set, map fits to show both user + job (shared link + real GPS) */
  fitBothPoints?: {
    userLat: number;
    userLng: number;
    taskLat: number;
    taskLng: number;
  } | null;
  /** Deep link is active (suppress radius/recenter override) */
  isFromDeepLink?: boolean;
}

const MapController = ({
  lat,
  lng,
  radius,
  recenterTrigger,
  selectedTask,
  isMenuOpen,
  sheetPosition,
  fitBothPoints,
  isFromDeepLink,
}: MapControllerProps) => {
  const map = useMap();
  const store = useMobileMapStore();
  const hasRestoredViewport = useRef(false);
  const isSettingView = useRef(false);
  const hasFitBothPoints = useRef(false);
  const hasHandledSelectedTask = useRef(false);
  const prevRadius = useRef(radius);

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

  // --- Fit map to show both user + job (shared link + real GPS) ---
  useEffect(() => {
    if (!fitBothPoints) return;
    if (hasFitBothPoints.current) return;
    hasFitBothPoints.current = true;

    isSettingView.current = true;

    const bounds = L.latLngBounds(
      [fitBothPoints.userLat, fitBothPoints.userLng],
      [fitBothPoints.taskLat, fitBothPoints.taskLng]
    );

    const mapContainer = map.getContainer();
    const mapHeight = mapContainer.offsetHeight;
    const bottomPadding = Math.round(mapHeight * 0.62);

    map.fitBounds(bounds, {
      paddingTopLeft: [40, 60],
      paddingBottomRight: [40, bottomPadding],
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

  // Handle radius changes and recenter.
  useEffect(() => {
    if (isFromDeepLink) return;

    const radiusChanged = prevRadius.current !== radius;
    prevRadius.current = radius;

    // Only respect the persisted viewport guard when radius hasn't changed.
    // If radius changed, the user explicitly asked to see a different area.
    if (!radiusChanged && store.mapCenter && store.mapZoom && !recenterTrigger) return;

    isSettingView.current = true;
    if (radius === 0) {
      map.setView([LATVIA_CENTER.lat, LATVIA_CENTER.lng], LATVIA_ZOOM);
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
  }, [lat, lng, radius, map, recenterTrigger, isFromDeepLink]);

  // Pan to selected task
  useEffect(() => {
    if (!selectedTask) return;
    if (hasFitBothPoints.current) return;
    if (hasHandledSelectedTask.current && isFromDeepLink) return;
    hasHandledSelectedTask.current = true;

    const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
    const taskLng = selectedTask.displayLongitude || selectedTask.longitude;

    isSettingView.current = true;
    map.invalidateSize();

    const zoom = isFromDeepLink ? 15 : 14;
    map.setView([taskLat, taskLng], zoom, { animate: false });

    setTimeout(() => {
      const mapContainer = map.getContainer();
      const mapHeight = mapContainer.offsetHeight;
      const desiredPosition = isFromDeepLink ? mapHeight * 0.18 : mapHeight * 0.25;
      const currentPosition = mapHeight * 0.5;
      const panAmount = currentPosition - desiredPosition;

      map.panBy([0, panAmount], { animate: true, duration: 0.4 });
      setTimeout(() => { isSettingView.current = false; }, 500);
    }, 150);
  }, [selectedTask, map, isFromDeepLink]);

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
