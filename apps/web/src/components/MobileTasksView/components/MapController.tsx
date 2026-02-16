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
  /** When set, map fits to show both user + job (shared link + real GPS) */
  fitBothPoints?: {
    userLat: number;
    userLng: number;
    taskLat: number;
    taskLng: number;
  } | null;
  /** When true AND fitBothPoints is null, we’re on a deep link without GPS —
   *  zoom in tighter on the job bubble so it’s the clear focal point. */
  isDeepLinkNoLocation?: boolean;
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
  isDeepLinkNoLocation,
}: MapControllerProps) => {
  const map = useMap();
  const store = useMobileMapStore();
  const hasRestoredViewport = useRef(false);
  const isSettingView = useRef(false);
  const hasFitBothPoints = useRef(false);
  const hasHandledDeepLinkNoLoc = useRef(false);

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
    if (!fitBothPoints || hasFitBothPoints.current) return;
    hasFitBothPoints.current = true;

    isSettingView.current = true;

    const bounds = L.latLngBounds(
      [fitBothPoints.userLat, fitBothPoints.userLng],
      [fitBothPoints.taskLat, fitBothPoints.taskLng]
    );

    // Account for the JobPreviewCard covering the bottom ~55% of screen.
    // Use asymmetric padding: more on bottom so both points are visible
    // in the top portion of the map.
    const mapContainer = map.getContainer();
    const mapHeight = mapContainer.offsetHeight;
    const bottomPadding = Math.round(mapHeight * 0.50); // card height

    map.fitBounds(bounds, {
      paddingTopLeft: [40, 60],
      paddingBottomRight: [40, bottomPadding],
      maxZoom: 14,
      animate: true,
      duration: 0.6,
    });
    setTimeout(() => { isSettingView.current = false; }, 700);
  }, [fitBothPoints, map]);

  // --- Deep link without GPS: zoom in on the job, centered in visible area ---
  useEffect(() => {
    if (!isDeepLinkNoLocation || !selectedTask || hasHandledDeepLinkNoLoc.current) return;
    if (hasFitBothPoints.current) return; // GPS arrived, fitBothPoints takes over
    hasHandledDeepLinkNoLoc.current = true;

    const taskLat = selectedTask.displayLatitude || selectedTask.latitude;
    const taskLng = selectedTask.displayLongitude || selectedTask.longitude;

    isSettingView.current = true;
    map.invalidateSize();

    // Zoom in closer (15) to emphasise the job since there’s no user dot to show
    map.setView([taskLat, taskLng], 15, { animate: false });

    // Pan marker into the visible top portion (above the preview card).
    // Card covers ~55% from bottom, so we want the marker at ~20% from top.
    setTimeout(() => {
      const mapContainer = map.getContainer();
      const mapHeight = mapContainer.offsetHeight;
      const desiredPosition = mapHeight * 0.20;
      const currentPosition = mapHeight * 0.5;
      const panAmount = currentPosition - desiredPosition;

      map.panBy([0, panAmount], { animate: true, duration: 0.4 });
      setTimeout(() => { isSettingView.current = false; }, 500);
    }, 150);
  }, [isDeepLinkNoLocation, selectedTask, map]);

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

  // Pan to selected task (normal flow — skip if deep link already handled)
  useEffect(() => {
    if (selectedTask) {
      if (hasFitBothPoints.current) return;
      if (hasHandledDeepLinkNoLoc.current) return;

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
