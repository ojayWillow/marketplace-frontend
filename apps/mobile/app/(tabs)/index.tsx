import { View, FlatList, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { getTasks, getOfferings, searchTasks } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import { BlurView } from 'expo-blur';
import { calculateDistance } from '../../utils/mapClustering';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeStore } from '../../src/stores/themeStore';
import { darkMapStyle, lightMapStyle } from '../../src/theme/mapStyles';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useCategories } from '../../src/hooks/useCategories';

// Feature imports
import { useLocation } from '../../src/features/home/hooks/useLocation';
import { useTaskFilters } from '../../src/features/home/hooks/useTaskFilters';
import { useSearchDebounce } from '../../src/features/home/hooks/useSearchDebounce';
import { useBottomSheet } from '../../src/features/home/hooks/useBottomSheet';
import { createStyles } from '../../src/features/home/styles/homeStyles';
import { SHEET_MIN_HEIGHT, SHEET_MID_HEIGHT, JOB_COLOR } from '../../src/features/home/constants';
import { applyOverlapOffset } from '../../src/features/home/utils/markerHelpers';

// Extracted components
import { HomeFloatingControls, HomeMapMarkers, HomeBottomSheet } from './home/components';

// Modals
import CategoryModal from '../../src/features/home/components/modals/CategoryModal';
import FiltersModal from '../../src/features/home/components/modals/FiltersModal';
import CreateModal from '../../src/features/home/components/modals/CreateModal';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { getCategoryLabel } = useCategories();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const styles = useMemo(() => createStyles(activeTheme), [activeTheme]);
  const blurTint = activeTheme === 'dark' ? 'dark' : 'light';
  const insets = useSafeAreaInsets();
  
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  // Custom hooks
  const { userLocation, hasRealLocation } = useLocation(mapRef);
  const { searchQuery, setSearchQuery, debouncedSearchQuery, clearSearch } = useSearchDebounce();
  const {
    selectedCategories,
    setSelectedCategories,
    selectedRadius,
    setSelectedRadius,
    selectedDifficulty,
    setSelectedDifficulty,
    hasActiveFilters,
    hasActiveCategory,
    matchesCategory,
  } = useTaskFilters();
  
  // UI State
  const [focusedOffering, setFocusedOffering] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('min');

  // Bottom sheet animation
  const { sheetHeight, panResponder, animateSheetTo } = useBottomSheet('min', setSheetPosition);

  // Data fetching
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks-home-all'],
    queryFn: async () => {
      const result = await getTasks({ page: 1, per_page: 500, status: 'open' });
      return result.tasks;
    },
    staleTime: 30000,
  });

  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    queryKey: ['tasks-search', debouncedSearchQuery],
    queryFn: async () => {
      const result = await searchTasks({ q: debouncedSearchQuery, page: 1, per_page: 500, status: 'open' });
      return result.tasks;
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 10000,
  });

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: () => getOfferings({ page: 1, per_page: 100, status: 'active' }),
    staleTime: 30000,
  });

  // Handlers
  const handleMarkerPress = useCallback((task: any) => {
    haptic.light();
    if (mapRef.current && task.latitude && task.longitude) {
      // Clamp zoom level to prevent gray tiles
      const latitudeDelta = Math.max(0.01, Math.min(0.05, 0.03));
      const { height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');
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
    setFocusedOffering(null);
    animateSheetTo(SHEET_MID_HEIGHT);
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
  }, [animateSheetTo]);

  const handleOfferingMarkerPress = useCallback((offering: any) => {
    haptic.light();
    if (mapRef.current && offering.latitude && offering.longitude) {
      // Clamp zoom level to prevent gray tiles
      const latitudeDelta = Math.max(0.01, Math.min(0.05, 0.03));
      const { height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');
      const latitudeOffset = latitudeDelta * (SHEET_MID_HEIGHT / SCREEN_HEIGHT) * 0.4;
      mapRef.current.animateToRegion(
        {
          latitude: offering.latitude - latitudeOffset,
          longitude: offering.longitude,
          latitudeDelta,
          longitudeDelta: latitudeDelta,
        },
        350
      );
    }
    setFocusedOffering(offering);
    setFocusedTaskId(null);
    animateSheetTo(SHEET_MID_HEIGHT);
  }, [animateSheetTo]);

  const handleJobItemPress = useCallback((task: any) => {
    haptic.medium();
    handleMarkerPress(task);
  }, [handleMarkerPress]);

  const handleViewFullDetails = useCallback((id: number) => {
    haptic.light();
    router.push(`/task/${id}`);
  }, []);

  const handleViewOfferingDetails = useCallback((id: number) => {
    haptic.light();
    router.push(`/offering/${id}`);
  }, []);

  const handleCloseFocusedJob = useCallback(() => {
    haptic.soft();
    setFocusedTaskId(null);
    animateSheetTo(SHEET_MIN_HEIGHT);
  }, [animateSheetTo]);

  const handleCloseFocusedOffering = useCallback(() => {
    haptic.soft();
    setFocusedOffering(null);
    animateSheetTo(SHEET_MIN_HEIGHT);
  }, [animateSheetTo]);

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
  }, [userLocation]);

  const handleClearSearch = useCallback(() => {
    haptic.soft();
    clearSearch();
    setFocusedTaskId(null);
    Keyboard.dismiss();
  }, [clearSearch]);

  // Memoized data transformations
  const allTasks = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchData) return searchData;
    if (debouncedSearchQuery.trim() && isSearchFetching) return [];
    return tasksData || [];
  }, [debouncedSearchQuery, searchData, isSearchFetching, tasksData]);
  
  const boostedOfferings = useMemo(() => 
    (offeringsData?.offerings || []).filter(o => o.is_boost_active && o.latitude && o.longitude),
    [offeringsData]
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      if (!matchesCategory(task.category)) return false;
      if (selectedRadius && hasRealLocation) {
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, task.latitude, task.longitude);
        if (distance > selectedRadius) return false;
      }
      if (selectedDifficulty && task.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [allTasks, matchesCategory, selectedRadius, selectedDifficulty, userLocation, hasRealLocation]);

  const tasksWithOffset = useMemo(() => applyOverlapOffset(filteredTasks), [filteredTasks]);

  const sortedTasks = useMemo(() => {
    if (!hasRealLocation) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
  }, [filteredTasks, userLocation, hasRealLocation]);

  const focusedTask = focusedTaskId ? sortedTasks.find(t => t.id === focusedTaskId) : null;
  const showSearchLoading = debouncedSearchQuery.trim() && isSearchFetching && !searchData;
  
  // Get translated category button text
  const getCategoryButtonText = () => {
    if (!hasActiveCategory) return t.home.categories;
    if (selectedCategories.length === 1) {
      return getCategoryLabel(selectedCategories[0]);
    }
    return `${selectedCategories.length} ${t.home.categories}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          customMapStyle={activeTheme === 'dark' ? darkMapStyle : lightMapStyle}
          initialRegion={{ 
            latitude: userLocation.latitude, 
            longitude: userLocation.longitude, 
            latitudeDelta: 0.15, 
            longitudeDelta: 0.15 
          }}
          maxZoomLevel={18}
          minZoomLevel={5}
          cacheEnabled={true}
          loadingEnabled={true}
          loadingIndicatorColor="#4285F4"
          showsUserLocation={hasRealLocation}
          showsMyLocationButton={false}
        >
          <HomeMapMarkers
            tasks={tasksWithOffset}
            offerings={boostedOfferings}
            focusedTaskId={focusedTaskId}
            onTaskMarkerPress={handleMarkerPress}
            onOfferingMarkerPress={handleOfferingMarkerPress}
            styles={styles}
          />
        </MapView>

        {/* Floating Header */}
        <HomeFloatingControls
          getCategoryButtonText={getCategoryButtonText}
          hasActiveCategory={hasActiveCategory}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleClearSearch}
          showSearchLoading={showSearchLoading}
          onCategoryPress={() => { haptic.light(); setShowCategoryModal(true); }}
          onFiltersPress={() => { haptic.light(); setShowFiltersModal(true); }}
          blurTint={blurTint}
          topInset={insets.top}
          styles={styles}
          searchInputRef={searchInputRef}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <BlurView intensity={80} tint={blurTint} style={styles.loadingCard}>
              <ActivityIndicator size="small" color={JOB_COLOR} />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </BlurView>
          </View>
        )}

        {/* My Location Button */}
        {sheetPosition === 'min' && (
          <TouchableOpacity 
            style={styles.myLocationButton} 
            onPress={handleMyLocation}
            activeOpacity={0.7}
          >
            <View style={styles.compassButton}>
              <Icon name="navigation" size={24} color="#4285F4" />
            </View>
          </TouchableOpacity>
        )}

        {/* Bottom Sheet */}
        <HomeBottomSheet
          sheetHeight={sheetHeight}
          panResponder={panResponder}
          focusedTask={focusedTask || null}
          focusedOffering={focusedOffering}
          sortedTasks={sortedTasks}
          userLocation={userLocation}
          hasRealLocation={hasRealLocation}
          onViewTaskDetails={handleViewFullDetails}
          onViewOfferingDetails={handleViewOfferingDetails}
          onCloseFocusedTask={handleCloseFocusedJob}
          onCloseFocusedOffering={handleCloseFocusedOffering}
          onTaskItemPress={handleJobItemPress}
          onCreatePress={() => { haptic.medium(); setShowCreateModal(true); }}
          listRef={listRef}
          styles={styles}
        />
      </View>

      {/* Modals */}
      <CategoryModal
        visible={showCategoryModal}
        selectedCategories={selectedCategories}
        onSelect={(cats) => { setSelectedCategories(cats); setFocusedTaskId(null); }}
        onClose={() => setShowCategoryModal(false)}
        styles={styles}
      />
      <FiltersModal
        visible={showFiltersModal}
        selectedRadius={selectedRadius}
        selectedDifficulty={selectedDifficulty}
        onRadiusChange={setSelectedRadius}
        onDifficultyChange={setSelectedDifficulty}
        onClear={() => { setSelectedRadius(null); setSelectedDifficulty(null); }}
        onClose={() => setShowFiltersModal(false)}
        styles={styles}
      />
      <CreateModal
        visible={showCreateModal}
        onCreateJob={() => { setShowCreateModal(false); router.push('/task/create'); }}
        onCreateService={() => { setShowCreateModal(false); router.push('/offering/create'); }}
        onClose={() => setShowCreateModal(false)}
        styles={styles}
      />
    </View>
  );
}
