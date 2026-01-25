import { useCallback, RefObject } from 'react';
import { Keyboard } from 'react-native';
import { router } from 'expo-router';
import MapView, { Region } from 'react-native-maps';
import { type Task } from '@marketplace/shared';
import { haptic } from '../../../utils/haptics';
import { SHEET_MID_HEIGHT } from '../constants';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface UseHomeActionsParams {
  mapRef: RefObject<MapView>;
  listRef: RefObject<any>;
  userLocation: { latitude: number; longitude: number };
  animateSheetTo: (height: number) => void;
  setFocusedTaskId: (id: number | null) => void;
  setSelectedOffering: (offering: any) => void;
  clearSearch: () => void;
  debouncedSearchQuery: string;
  hasNextPage: boolean;
  hasNextSearchPage: boolean;
  isFetchingNextPage: boolean;
  isFetchingNextSearchPage: boolean;
  fetchNextPage: () => void;
  fetchNextSearchPage: () => void;
}

export interface UseHomeActionsReturn {
  handleMarkerPress: (task: Task) => void;
  handleJobItemPress: (task: Task) => void;
  handleViewFullDetails: (id: number) => void;
  handleCloseFocusedJob: () => void;
  handleMyLocation: () => void;
  handleClearSearch: () => void;
  handleLoadMore: () => void;
  handleRegionChangeComplete: (region: Region) => void;
}

export function useHomeActions(params: UseHomeActionsParams): UseHomeActionsReturn {
  const {
    mapRef,
    listRef,
    userLocation,
    animateSheetTo,
    setFocusedTaskId,
    setSelectedOffering,
    clearSearch,
    debouncedSearchQuery,
    hasNextPage,
    hasNextSearchPage,
    isFetchingNextPage,
    isFetchingNextSearchPage,
    fetchNextPage,
    fetchNextSearchPage,
  } = params;

  const handleMarkerPress = useCallback((task: Task) => {
    haptic.light();
    if (mapRef.current && task.latitude && task.longitude) {
      const latitudeDelta = 0.03;
      const latitudeOffset = latitudeDelta * (SHEET_MID_HEIGHT / SCREEN_HEIGHT) * 0.4;
      mapRef.current.animateToRegion(
        {
          latitude: task.latitude - latitudeOffset,
          longitude: task.longitude,
          latitudeDelta,
          longitudeDelta: latitudeDelta,
        },
        350
      );
    }
    setFocusedTaskId(task.id);
    setSelectedOffering(null);
    animateSheetTo(SHEET_MID_HEIGHT);
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
  }, [mapRef, animateSheetTo, setFocusedTaskId, setSelectedOffering, listRef]);

  const handleJobItemPress = useCallback(
    (task: Task) => {
      haptic.medium();
      handleMarkerPress(task);
    },
    [handleMarkerPress]
  );

  const handleViewFullDetails = useCallback((id: number) => {
    haptic.light();
    router.push(`/task/${id}`);
  }, []);

  const handleCloseFocusedJob = useCallback(() => {
    haptic.soft();
    setFocusedTaskId(null);
    animateSheetTo(SHEET_MID_HEIGHT);
  }, [animateSheetTo, setFocusedTaskId]);

  const handleMyLocation = useCallback(() => {
    haptic.medium();
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  }, [userLocation, mapRef]);

  const handleClearSearch = useCallback(() => {
    haptic.soft();
    clearSearch();
    setFocusedTaskId(null);
    Keyboard.dismiss();
  }, [clearSearch, setFocusedTaskId]);

  const handleLoadMore = useCallback(() => {
    if (debouncedSearchQuery.trim()) {
      if (hasNextSearchPage && !isFetchingNextSearchPage) {
        fetchNextSearchPage();
      }
    } else {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [
    debouncedSearchQuery,
    hasNextPage,
    hasNextSearchPage,
    isFetchingNextPage,
    isFetchingNextSearchPage,
    fetchNextPage,
    fetchNextSearchPage,
  ]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    // Can store region state if needed
  }, []);

  return {
    handleMarkerPress,
    handleJobItemPress,
    handleViewFullDetails,
    handleCloseFocusedJob,
    handleMyLocation,
    handleClearSearch,
    handleLoadMore,
    handleRegionChangeComplete,
  };
}
