import { View, FlatList, Animated, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { getTasks, getOfferings, searchTasks, type Task, type Offering, getCategoryByKey } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import { BlurView } from 'expo-blur';
import { calculateDistance } from '../../utils/mapClustering';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeStore } from '../../src/stores/themeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { darkMapStyle, lightMapStyle } from '../../src/theme/mapStyles';

// Feature imports
import { 
  TaskCard, 
  FocusedTaskCard, 
  OfferingMarker,
} from '../../src/features/home/components';
import { useLocation } from '../../src/features/home/hooks/useLocation';
import { useTaskFilters } from '../../src/features/home/hooks/useTaskFilters';
import { useSearchDebounce } from '../../src/features/home/hooks/useSearchDebounce';
import { useBottomSheet } from '../../src/features/home/hooks/useBottomSheet';
import { createStyles } from '../../src/features/home/styles/homeStyles';
import { 
  SHEET_MIN_HEIGHT,
  SHEET_MID_HEIGHT,
  JOB_COLOR, 
  OFFERING_COLOR, 
  getMarkerColor,
} from '../../src/features/home/constants';
import { applyOverlapOffset } from '../../src/features/home/utils/markerHelpers';

// Modals
import CategoryModal from '../../src/features/home/components/modals/CategoryModal';
import FiltersModal from '../../src/features/home/components/modals/FiltersModal';
import CreateModal from '../../src/features/home/components/modals/CreateModal';

export default function HomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const styles = useMemo(() => createStyles(activeTheme), [activeTheme]);
  
  // Get safe area insets for stable positioning
  const insets = useSafeAreaInsets();
  
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  // Custom hooks
  const { userLocation, hasRealLocation } = useLocation(mapRef);
  const { searchQuery, setSearchQuery, debouncedSearchQuery, clearSearch } = useSearchDebounce();
  const {
    selectedCategories, setSelectedCategories,
    selectedRadius, setSelectedRadius,
    selectedDifficulty, setSelectedDifficulty,
    hasActiveFilters, hasActiveCategory,
    matchesCategory,
  } = useTaskFilters();
  
  // UI State
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('min');

  // Bottom sheet animation
  const { sheetHeight, panResponder, animateSheetTo } = useBottomSheet('min', setSheetPosition);

  // Data fetching - ALL tasks at once (no pagination for home map)
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks-home-all'],
    queryFn: async () => {
      const result = await getTasks({ page: 1, per_page: 500, status: 'open' });
      return result.tasks;
    },
    staleTime: 30000,
  });

  // Data fetching - Search
  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    queryKey: ['tasks-search', debouncedSearchQuery],
    queryFn: async () => {
      const result = await searchTasks({ q: debouncedSearchQuery, page: 1, per_page: 500, status: 'open' });
      return result.tasks;
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 10000,
  });

  // Data fetching - Offerings
  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: () => getOfferings({ page: 1, per_page: 100, status: 'active' }),
    staleTime: 30000,
  });

  // Handlers
  const handleMarkerPress = useCallback((task: Task) => {
    haptic.light();
    if (mapRef.current && task.latitude && task.longitude) {
      const latitudeDelta = 0.03;
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
    setSelectedOffering(null);
    animateSheetTo(SHEET_MID_HEIGHT);
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
  }, [animateSheetTo]);

  const handleJobItemPress = useCallback((task: Task) => {
    haptic.medium();
    handleMarkerPress(task);
  }, [handleMarkerPress]);

  const handleViewFullDetails = useCallback((id: number) => {
    haptic.light();
    router.push(`/task/${id}`);
  }, []);

  const handleCloseFocusedJob = useCallback(() => {
    haptic.soft();
    setFocusedTaskId(null);
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
    if (debouncedSearchQuery.trim() && searchData) {
      return searchData;
    }
    if (debouncedSearchQuery.trim() && isSearchFetching) return [];
    return tasksData || [];
  }, [debouncedSearchQuery, searchData, isSearchFetching, tasksData]);
  
  const boostedOfferings = useMemo(() => 
    (offeringsData?.offerings || []).filter(o => o.is_boost_active && o.latitude && o.longitude),
    [offeringsData]
  );

  // Updated filtering to use matchesCategory for multi-select
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      // Use matchesCategory for multi-select support
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
  
  // Get display text for category button
  const getCategoryButtonText = () => {
    if (!hasActiveCategory) return 'Category';
    if (selectedCategories.length === 1) {
      const cat = getCategoryByKey(selectedCategories[0]);
      return cat?.label || 'Category';
    }
    return `${selectedCategories.length} Categories`;
  };

  // Render functions
  const renderJobItem = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      userLocation={userLocation}
      hasRealLocation={hasRealLocation}
      onPress={handleJobItemPress}
      styles={styles}
    />
  ), [userLocation, hasRealLocation, handleJobItemPress, styles]);

  const renderEmptyList = () => (
    <View style={styles.emptySheet}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyText}>{debouncedSearchQuery ? 'No results found' : 'No jobs found'}</Text>
      <Text style={styles.emptySubtext}>{debouncedSearchQuery ? 'Try a different search term' : 'Try adjusting your filters'}</Text>
    </View>
  );

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
          showsUserLocation={hasRealLocation}
          showsMyLocationButton={false}
        >
          {/* Task markers */}
          {tasksWithOffset.map((task) => {
            const markerColor = getMarkerColor(task.category);
            const isFocused = focusedTaskId === task.id;
            
            return (
              <Marker
                key={`task-${task.id}`}
                coordinate={{ latitude: task.displayLat, longitude: task.displayLng }}
                onPress={() => handleMarkerPress(task)}
                tracksViewChanges={false}
                zIndex={isFocused ? 10 : 1}
              >
                <View style={[
                  styles.priceMarker,
                  { borderColor: markerColor },
                  isFocused && styles.priceMarkerFocused
                ]}>
                  <Text style={[styles.priceMarkerText, { color: markerColor }]}>
                    €{task.budget?.toFixed(0) || '0'}
                  </Text>
                </View>
              </Marker>
            );
          })}

          {/* Boosted offerings markers */}
          {boostedOfferings.map((offering) => (
            <Marker 
              key={`offering-${offering.id}`} 
              coordinate={{ latitude: offering.latitude!, longitude: offering.longitude! }} 
              onPress={() => setSelectedOffering(offering)} 
              tracksViewChanges={false}
              zIndex={2}
            >
              <OfferingMarker offering={offering} styles={styles} />
            </Marker>
          ))}
        </MapView>

        {/* Floating Header - FIXED with stable positioning */}
        <View 
          style={[
            styles.floatingHeader, 
            { paddingTop: insets.top } // Use actual safe area inset, no SafeAreaView needed
          ]} 
          collapsable={false}
        >
          <View style={styles.topRow}>
            <TouchableOpacity 
              style={[styles.categoryButton, hasActiveCategory && styles.categoryButtonActive]}
              onPress={() => { haptic.light(); setShowCategoryModal(true); }}
              activeOpacity={0.7}
            >
              <BlurView intensity={80} tint="light" style={styles.categoryBlur}>
                <Text style={styles.categoryButtonText} numberOfLines={1}>
                  {getCategoryButtonText()}
                </Text>
                <Icon name="expand-more" size={18} color={styles.categoryButtonText.color} />
              </BlurView>
            </TouchableOpacity>

            <View style={styles.searchBar}>
              <BlurView intensity={80} tint="light" style={styles.searchBlur}>
                <Icon name="search" size={20} color={styles.searchInput.color} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search jobs..."
                  placeholderTextColor={styles.searchInput.color}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="close" size={18} color={styles.searchInput.color} />
                  </TouchableOpacity>
                )}
                {showSearchLoading && <ActivityIndicator size="small" color={JOB_COLOR} />}
              </BlurView>
            </View>

            <TouchableOpacity 
              style={styles.filtersButton}
              onPress={() => { haptic.light(); setShowFiltersModal(true); }}
              activeOpacity={0.7}
            >
              <BlurView intensity={80} tint="light" style={styles.filtersBlur}>
                <Icon name="tune" size={20} color={hasActiveFilters ? JOB_COLOR : styles.categoryButtonText.color} />
                {hasActiveFilters && <View style={styles.filterDot} />}
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <BlurView intensity={80} tint="light" style={styles.loadingCard}>
              <ActivityIndicator size="small" color={JOB_COLOR} />
              <Text style={styles.loadingText}>Loading jobs...</Text>
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
        <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
          <View {...panResponder.panHandlers} style={styles.sheetHandle}>
            <View style={styles.handleBar} />
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>
                {focusedTask ? 'Job Details' : `${sortedTasks.length} job${sortedTasks.length !== 1 ? 's' : ''} nearby`}
              </Text>
              {focusedTask ? (
                <IconButton icon="close" size={20} onPress={handleCloseFocusedJob} />
              ) : (
                <TouchableOpacity 
                  style={styles.quickPostButton}
                  onPress={() => { haptic.medium(); setShowCreateModal(true); }}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={[JOB_COLOR, OFFERING_COLOR]} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }} 
                    style={{ position: 'absolute', width: '100%', height: '100%' }} 
                  />
                  <Text style={styles.quickPostIcon}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {focusedTask ? (
            <FocusedTaskCard 
              task={focusedTask} 
              userLocation={userLocation} 
              hasRealLocation={hasRealLocation} 
              onViewDetails={handleViewFullDetails} 
              styles={styles} 
            />
          ) : sortedTasks.length === 0 ? (
            renderEmptyList()
          ) : (
            <FlatList
              ref={listRef}
              data={sortedTasks}
              renderItem={renderJobItem}
              keyExtractor={(item) => `task-${item.id}`}
              showsVerticalScrollIndicator
              contentContainerStyle={styles.listContent}
            />
          )}
        </Animated.View>
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
