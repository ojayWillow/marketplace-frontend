import { View, FlatList, Animated, PanResponder, Dimensions, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-supercluster';
import { getTasks, getOfferings, searchTasks, type Task, type Offering, getCategoryByKey } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import { BlurView } from 'expo-blur';
import { calculateDistance } from '../../utils/mapClustering';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeStore } from '../../src/stores/themeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { darkMapStyle, lightMapStyle } from '../../src/theme/mapStyles';

// Feature imports from src/features/home
import { 
  TaskCard, 
  FocusedTaskCard, 
  OfferingMarker,
} from '../../src/features/home/components';
import { useLocation } from '../../src/features/home/hooks/useLocation';
import { useTaskFilters } from '../../src/features/home/hooks/useTaskFilters';
import { useSearchDebounce } from '../../src/features/home/hooks/useSearchDebounce';
import { createStyles } from '../../src/features/home/styles/homeStyles';
import { 
  SHEET_MIN_HEIGHT, 
  SHEET_MID_HEIGHT, 
  SHEET_MAX_HEIGHT, 
  JOB_COLOR, 
  OFFERING_COLOR, 
  getMarkerColor,
} from '../../src/features/home/constants';

// Direct imports for modals
import CategoryModal from '../../src/features/home/components/modals/CategoryModal';
import FiltersModal from '../../src/features/home/components/modals/FiltersModal';
import CreateModal from '../../src/features/home/components/modals/CreateModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Apply spiral offset to markers at the same location
 * This spreads overlapping markers in a spiral pattern so they're all visible
 */
function applyOverlapOffset(tasks: Task[]): (Task & { displayLat: number; displayLng: number })[] {
  // Group tasks by location (rounded to ~10m precision)
  const locationGroups = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    if (!task.latitude || !task.longitude) return;
    // Round to 4 decimal places (~11m precision) to group nearby markers
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!locationGroups.has(key)) {
      locationGroups.set(key, []);
    }
    locationGroups.get(key)!.push(task);
  });

  const result: (Task & { displayLat: number; displayLng: number })[] = [];
  
  locationGroups.forEach((group) => {
    if (group.length === 1) {
      // Single marker - no offset needed
      result.push({
        ...group[0],
        displayLat: group[0].latitude!,
        displayLng: group[0].longitude!,
      });
    } else {
      // Multiple markers at same location - apply spiral offset
      const baseOffset = 0.0003; // ~30 meters at equator
      
      group.forEach((task, index) => {
        if (index === 0) {
          // First marker stays at original position
          result.push({
            ...task,
            displayLat: task.latitude!,
            displayLng: task.longitude!,
          });
        } else {
          // Spiral pattern: each subsequent marker goes further out
          const angle = (index * 137.5 * Math.PI) / 180; // Golden angle for nice distribution
          const radius = baseOffset * Math.sqrt(index); // Increasing radius
          
          result.push({
            ...task,
            displayLat: task.latitude! + (radius * Math.cos(angle)),
            displayLng: task.longitude! + (radius * Math.sin(angle)),
          });
        }
      });
    }
  });

  return result;
}

export default function HomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const styles = useMemo(() => createStyles(activeTheme), [activeTheme]);
  
  const mapRef = useRef<any>(null);
  const listRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  // Custom hooks
  const { userLocation, hasRealLocation } = useLocation(mapRef);
  const { searchQuery, setSearchQuery, debouncedSearchQuery, clearSearch } = useSearchDebounce();
  const {
    selectedCategory, setSelectedCategory,
    selectedRadius, setSelectedRadius,
    selectedDifficulty, setSelectedDifficulty,
    hasActiveFilters, hasActiveCategory
  } = useTaskFilters();
  
  // UI State
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('min');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  // Animation
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);

  const animateSheetTo = useCallback((height: number) => {
    currentHeight.current = height;
    if (height === SHEET_MIN_HEIGHT) setSheetPosition('min');
    else if (height === SHEET_MID_HEIGHT) setSheetPosition('mid');
    else setSheetPosition('max');
    
    Animated.spring(sheetHeight, {
      toValue: height,
      useNativeDriver: false,
      bounciness: 4,
      speed: 12,
    }).start();
  }, [sheetHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        const clampedHeight = Math.min(Math.max(newHeight, SHEET_MIN_HEIGHT), SHEET_MAX_HEIGHT);
        sheetHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        let snapTo = SHEET_MIN_HEIGHT;
        
        if (gestureState.vy < -0.5) {
          snapTo = newHeight > SHEET_MID_HEIGHT ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;
        } else if (gestureState.vy > 0.5) {
          snapTo = SHEET_MIN_HEIGHT;
        } else {
          if (newHeight < SHEET_MID_HEIGHT * 0.5) snapTo = SHEET_MIN_HEIGHT;
          else if (newHeight < (SHEET_MID_HEIGHT + SHEET_MAX_HEIGHT) / 2) snapTo = SHEET_MID_HEIGHT;
          else snapTo = SHEET_MAX_HEIGHT;
        }
        
        animateSheetTo(snapTo);
        haptic.selection();
      },
    })
  ).current;

  // Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['tasks-home'],
    queryFn: () => getTasks({ page: 1, per_page: 100, status: 'open' }),
    staleTime: 30000,
  });

  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    queryKey: ['tasks-search', debouncedSearchQuery],
    queryFn: () => searchTasks({ q: debouncedSearchQuery, page: 1, per_page: 100, status: 'open' }),
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 10000,
  });

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: () => getOfferings({ page: 1, per_page: 100, status: 'active' }),
    staleTime: 30000,
  });

  // Memoized data transformations
  const allTasks = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchData?.tasks) return searchData.tasks;
    if (debouncedSearchQuery.trim() && isSearchFetching) return [];
    return data?.tasks || [];
  }, [debouncedSearchQuery, searchData, isSearchFetching, data]);
  
  const boostedOfferings = useMemo(() => 
    (offeringsData?.offerings || []).filter(o => o.is_boost_active && o.latitude && o.longitude),
    [offeringsData]
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedRadius && hasRealLocation) {
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, task.latitude, task.longitude);
        if (distance > selectedRadius) return false;
      }
      if (selectedDifficulty && task.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [allTasks, selectedCategory, selectedRadius, selectedDifficulty, userLocation, hasRealLocation]);

  // Apply overlap offset to spread out markers at same location
  const tasksWithOffset = useMemo(() => {
    return applyOverlapOffset(filteredTasks);
  }, [filteredTasks]);

  const sortedTasks = useMemo(() => {
    if (!hasRealLocation) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
  }, [filteredTasks, userLocation, hasRealLocation]);

  const focusedTask = focusedTaskId ? sortedTasks.find(t => t.id === focusedTaskId) : null;
  const showSearchLoading = debouncedSearchQuery.trim() && isSearchFetching;
  const selectedCategoryData = getCategoryByKey(selectedCategory);

  // Handle region change
  const handleRegionChangeComplete = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  // Handle cluster press - zoom into cluster
  const handleClusterPress = useCallback((cluster: any) => {
    haptic.light();
    
    try {
      if (!mapRef.current || !cluster?.geometry?.coordinates) return;
      
      // Get cluster expansion zoom or calculate region from cluster center
      const [lng, lat] = cluster.geometry.coordinates;
      
      // Zoom in closer to the cluster
      const currentDelta = mapRegion?.latitudeDelta || 0.1;
      const newDelta = Math.max(currentDelta * 0.4, 0.01); // Zoom in by 60%
      
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: newDelta,
        longitudeDelta: newDelta,
      }, 400);
    } catch (error) {
      console.warn('Error handling cluster press:', error);
    }
  }, [mapRegion]);

  const handleMarkerPress = useCallback((task: Task) => {
    haptic.light();
    if (mapRef.current && task.latitude && task.longitude) {
      const latitudeDelta = 0.03;
      const latitudeOffset = latitudeDelta * (SHEET_MID_HEIGHT / SCREEN_HEIGHT) * 0.4;
      mapRef.current.animateToRegion({
        latitude: task.latitude - latitudeOffset,
        longitude: task.longitude,
        latitudeDelta,
        longitudeDelta: latitudeDelta,
      }, 350);
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
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  }, [userLocation]);

  const handleClearSearch = useCallback(() => {
    haptic.soft();
    clearSearch();
    setFocusedTaskId(null);
    Keyboard.dismiss();
  }, [clearSearch]);

  // Custom cluster renderer - Gold coin design
  const renderCluster = useCallback((cluster: any) => {
    const { geometry, properties } = cluster;
    
    // Safety check
    if (!geometry?.coordinates || !properties) return null;
    
    const count = properties.point_count || 0;
    
    return (
      <Marker
        key={`cluster-${cluster.id}`}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
        tracksViewChanges={false}
        onPress={() => handleClusterPress(cluster)}
      >
        <View style={styles.coinClusterContainer}>
          <View style={styles.coinCluster}>
            <Text style={styles.coinEuro}>€</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>{count}</Text>
          </View>
        </View>
      </Marker>
    );
  }, [styles, handleClusterPress]);

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
        <ClusteredMapView
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
          onRegionChangeComplete={handleRegionChangeComplete}
          // Use native user location (blue dot) - not affected by clustering
          showsUserLocation={hasRealLocation}
          showsMyLocationButton={false}
          // Clustering options
          clusteringEnabled={true}
          radius={60}
          minPoints={2}
          maxZoom={17}
          renderCluster={renderCluster}
          // Preserve cluster zoom behavior
          preserveClusterPressBehavior={true}
          spiralEnabled={false}
        >
          {/* Task markers with overlap offset - the library handles clustering */}
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

          {/* Boosted offerings - not clustered */}
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
        </ClusteredMapView>

        {/* Floating Header */}
        <SafeAreaView style={styles.floatingHeader} edges={['top']}>
          <View style={styles.topRow}>
            <TouchableOpacity 
              style={[styles.categoryButton, hasActiveCategory && styles.categoryButtonActive]}
              onPress={() => { haptic.light(); setShowCategoryModal(true); }}
              activeOpacity={0.7}
            >
              <BlurView intensity={80} tint="light" style={styles.categoryBlur}>
                <Text style={styles.categoryButtonText} numberOfLines={1}>
                  {hasActiveCategory ? selectedCategoryData?.label : 'Category'}
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
        </SafeAreaView>

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
            <FocusedTaskCard task={focusedTask} userLocation={userLocation} hasRealLocation={hasRealLocation} onViewDetails={handleViewFullDetails} styles={styles} />
          ) : sortedTasks.length === 0 ? (
            renderEmptyList()
          ) : (
            <FlatList ref={listRef} data={sortedTasks} renderItem={renderJobItem} keyExtractor={(item) => `task-${item.id}`} showsVerticalScrollIndicator contentContainerStyle={styles.listContent} />
          )}
        </Animated.View>
      </View>

      {/* Modals */}
      <CategoryModal
        visible={showCategoryModal}
        selectedCategory={selectedCategory}
        onSelect={(cat) => { setSelectedCategory(cat); setShowCategoryModal(false); setFocusedTaskId(null); }}
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
