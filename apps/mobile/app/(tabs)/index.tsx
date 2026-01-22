import { View, StyleSheet, TouchableOpacity, FlatList, Animated, PanResponder, Dimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTasks, getOfferings, searchTasks, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 80;
const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.4;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// Clustering - only when markers would actually overlap
// This is the minimum distance in degrees before clustering kicks in
const OVERLAP_THRESHOLD_FACTOR = 0.025; // Very tight - only cluster when truly overlapping

// Zoom level thresholds for user location visibility
const ZOOM_FAR_THRESHOLD = 0.12;    // latitudeDelta > 0.12 = zoomed out (hide user marker)
const ZOOM_CLOSE_THRESHOLD = 0.05;  // latitudeDelta <= 0.05 = zoomed in (full user marker)

const CATEGORIES = [
  { key: 'all', label: 'All Categories', icon: '🔍' },
  { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { key: 'moving', label: 'Moving', icon: '📦' },
  { key: 'repairs', label: 'Repairs', icon: '🔧' },
  { key: 'delivery', label: 'Delivery', icon: '🚗' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚' },
  { key: 'tech', label: 'Tech', icon: '💻' },
  { key: 'beauty', label: 'Beauty', icon: '💅' },
  { key: 'other', label: 'Other', icon: '📋' },
];

const RADIUS_OPTIONS = [
  { key: 'all', label: 'All Areas', value: null },
  { key: '5', label: '5 km', value: 5 },
  { key: '10', label: '10 km', value: 10 },
  { key: '20', label: '20 km', value: 20 },
  { key: '50', label: '50 km', value: 50 },
];

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

// Smart clustering - only when markers would visually overlap
interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  tasks: Task[];
  isCluster: boolean;
}

const clusterTasks = (tasks: Task[], region: Region | null): Cluster[] => {
  if (!region || tasks.length === 0) return [];
  
  const { latitudeDelta, longitudeDelta } = region;
  
  // Calculate overlap distance based on zoom - tighter threshold
  // Only cluster when markers would actually overlap on screen
  const overlapDistLat = latitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  const overlapDistLng = longitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  for (const task of tasks) {
    if (processed.has(task.id)) continue;
    
    // Find markers that would overlap with this one
    const overlappingTasks = tasks.filter(t => {
      if (processed.has(t.id)) return false;
      if (t.id === task.id) return true;
      
      const latDiff = Math.abs(t.latitude! - task.latitude!);
      const lngDiff = Math.abs(t.longitude! - task.longitude!);
      
      // Only group if they would visually overlap
      return latDiff < overlapDistLat && lngDiff < overlapDistLng;
    });
    
    overlappingTasks.forEach(t => processed.add(t.id));
    
    if (overlappingTasks.length === 1) {
      // Single marker - no clustering needed
      clusters.push({
        id: `single-${task.id}`,
        latitude: task.latitude!,
        longitude: task.longitude!,
        tasks: [task],
        isCluster: false,
      });
    } else {
      // Multiple overlapping markers - create cluster
      const centerLat = overlappingTasks.reduce((sum, t) => sum + t.latitude!, 0) / overlappingTasks.length;
      const centerLng = overlappingTasks.reduce((sum, t) => sum + t.longitude!, 0) / overlappingTasks.length;
      
      clusters.push({
        id: `cluster-${task.id}`,
        latitude: centerLat,
        longitude: centerLng,
        tasks: overlappingTasks,
        isCluster: true,
      });
    }
  }
  
  return clusters;
};

// Determine zoom level category based on latitudeDelta
type ZoomLevel = 'far' | 'mid' | 'close';
const getZoomLevel = (latitudeDelta: number | undefined): ZoomLevel => {
  if (!latitudeDelta) return 'mid';
  if (latitudeDelta > ZOOM_FAR_THRESHOLD) return 'far';
  if (latitudeDelta <= ZOOM_CLOSE_THRESHOLD) return 'close';
  return 'mid';
};

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [sheetPosition, setSheetPosition] = useState<'min' | 'mid' | 'max'>('min');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);

  // Derive zoom level from map region
  const zoomLevel = useMemo(() => getZoomLevel(mapRegion?.latitudeDelta), [mapRegion?.latitudeDelta]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setDebouncedSearchQuery('');
      return;
    }
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const animateSheetTo = (height: number) => {
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
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
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
          if (newHeight < SHEET_MID_HEIGHT * 0.5) {
            snapTo = SHEET_MIN_HEIGHT;
          } else if (newHeight < (SHEET_MID_HEIGHT + SHEET_MAX_HEIGHT) / 2) {
            snapTo = SHEET_MID_HEIGHT;
          } else {
            snapTo = SHEET_MAX_HEIGHT;
          }
        }
        
        animateSheetTo(snapTo);
        haptic.selection();
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation({ latitude: 56.9496, longitude: 24.1052 });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks-home'],
    queryFn: async () => {
      return await getTasks({ page: 1, per_page: 100, status: 'open' });
    },
    staleTime: 30000,
  });

  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    queryKey: ['tasks-search', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return null;
      return await searchTasks({ q: debouncedSearchQuery, page: 1, per_page: 100, status: 'open' });
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 10000,
  });

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: async () => {
      return await getOfferings({ page: 1, per_page: 100, status: 'active' });
    },
    staleTime: 30000,
  });

  const allTasks = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchData?.tasks) {
      return searchData.tasks;
    }
    if (debouncedSearchQuery.trim() && isSearchFetching) {
      return [];
    }
    return data?.tasks || [];
  }, [debouncedSearchQuery, searchData, isSearchFetching, data]);
  
  const offerings = offeringsData?.offerings || [];
  const boostedOfferings = offerings.filter(
    o => o.is_boost_active && o.latitude && o.longitude
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      
      if (selectedRadius && userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.latitude,
          task.longitude
        );
        if (distance > selectedRadius) {
          return false;
        }
      }
      
      return true;
    });
  }, [allTasks, selectedCategory, selectedRadius, userLocation]);

  const sortedTasks = useMemo(() => {
    if (!userLocation) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
  }, [filteredTasks, userLocation]);

  // Smart clustering - only when markers overlap
  const clusters = useMemo(() => {
    return clusterTasks(filteredTasks, mapRegion);
  }, [filteredTasks, mapRegion]);

  const getMarkerColor = (category: string) => {
    const colors: Record<string, string> = {
      cleaning: '#10b981',
      moving: '#3b82f6',
      repairs: '#f59e0b',
      tutoring: '#8b5cf6',
      delivery: '#ec4899',
      beauty: '#a855f7',
      tech: '#06b6d4',
      other: '#6b7280',
    };
    return colors[category] || '#ef4444';
  };

  const handleRegionChange = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  const handleClusterPress = (cluster: Cluster) => {
    haptic.light();
    
    if (cluster.isCluster) {
      // Zoom into the cluster area
      if (mapRef.current) {
        const lats = cluster.tasks.map(t => t.latitude!);
        const lngs = cluster.tasks.map(t => t.longitude!);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const padding = 0.005;
        mapRef.current.animateToRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(maxLat - minLat + padding, 0.01),
          longitudeDelta: Math.max(maxLng - minLng + padding, 0.01),
        }, 400);
      }
    } else {
      // Single marker - show details
      const task = cluster.tasks[0];
      handleMarkerPress(task, undefined);
    }
  };

  const handleMarkerPress = (task?: Task, offering?: Offering) => {
    haptic.light();
    if (task) {
      if (mapRef.current && task.latitude && task.longitude) {
        mapRef.current.animateToRegion({
          latitude: task.latitude - 0.003,
          longitude: task.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 500);
      }
      
      setFocusedTaskId(task.id);
      setSelectedTask(null);
      setSelectedOffering(null);
      animateSheetTo(SHEET_MID_HEIGHT);
      
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } else if (offering) {
      setSelectedOffering(offering);
      setSelectedTask(null);
      setFocusedTaskId(null);
    }
  };

  const handleJobItemPress = (task: Task) => {
    haptic.medium();
    
    if (mapRef.current && task.latitude && task.longitude) {
      mapRef.current.animateToRegion({
        latitude: task.latitude - 0.003,
        longitude: task.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 500);
    }
    
    setFocusedTaskId(task.id);
    setSelectedTask(null);
    setSelectedOffering(null);
    animateSheetTo(SHEET_MID_HEIGHT);
    
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const handleViewFullDetails = (id: number) => {
    haptic.light();
    router.push(`/task/${id}`);
  };

  const handleCloseFocusedJob = () => {
    haptic.soft();
    setFocusedTaskId(null);
    animateSheetTo(SHEET_MIN_HEIGHT);
  };

  const handleCategorySelect = (category: string) => {
    haptic.selection();
    setSelectedCategory(category);
    setSelectedTask(null);
    setSelectedOffering(null);
    setFocusedTaskId(null);
    setShowCategoryModal(false);
  };

  const handleRadiusSelect = (radius: number | null) => {
    haptic.selection();
    setSelectedRadius(radius);
    setShowRadiusModal(false);
  };

  const handleMyLocation = async () => {
    haptic.medium();
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const handleCreatePress = () => {
    haptic.medium();
    setShowCreateModal(true);
  };

  const handleCreateJob = () => {
    haptic.light();
    setShowCreateModal(false);
    router.push('/task/create');
  };

  const handleCreateService = () => {
    haptic.light();
    setShowCreateModal(false);
    router.push('/offering/create');
  };

  const handleClearSearch = () => {
    haptic.soft();
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setFocusedTaskId(null);
  };

  const selectedCategoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label || 'All Categories';
  const selectedRadiusLabel = RADIUS_OPTIONS.find(r => r.value === selectedRadius)?.label || 'All Areas';
  
  const focusedTask = focusedTaskId ? sortedTasks.find(t => t.id === focusedTaskId) : null;
  const showSearchLoading = debouncedSearchQuery.trim() && isSearchFetching;

  // Render custom user location marker based on zoom level
  const renderUserLocationMarker = () => {
    if (!userLocation || zoomLevel === 'far') return null;
    
    return (
      <Marker
        coordinate={userLocation}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        {zoomLevel === 'close' ? (
          // Full user marker with halo (zoomed in)
          <View style={styles.userMarkerFull}>
            <View style={styles.userMarkerHalo} />
            <View style={styles.userMarkerDot} />
          </View>
        ) : (
          // Subtle ring marker (mid zoom)
          <View style={styles.userMarkerSubtle}>
            <View style={styles.userMarkerRing} />
          </View>
        )}
      </Marker>
    );
  };

  const renderJobItem = ({ item: task }: { item: Task }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => handleJobItemPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.jobLeft}>
        <View style={[styles.jobCategoryDot, { backgroundColor: getMarkerColor(task.category) }]} />
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.jobMeta}>
            {task.category} • {formatTimeAgo(task.created_at!)}
          </Text>
        </View>
      </View>
      <View style={styles.jobRight}>
        <Text style={styles.jobPrice}>€{task.budget?.toFixed(0) || '0'}</Text>
        {userLocation && (
          <Text style={styles.jobDistance}>
            {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              task.latitude!,
              task.longitude!
            ).toFixed(1)} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFocusedTask = () => {
    if (!focusedTask) return null;
    return (
      <View style={styles.focusedJobContainer}>
        <View style={styles.focusedJobHeader}>
          <View style={[styles.focusedCategoryBadge, { backgroundColor: getMarkerColor(focusedTask.category) }]}>
            <Text style={styles.focusedCategoryText}>{focusedTask.category.toUpperCase()}</Text>
          </View>
          {userLocation && (
            <Text style={styles.focusedDistance}>
              📍 {calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                focusedTask.latitude!,
                focusedTask.longitude!
              ).toFixed(1)} km away
            </Text>
          )}
        </View>
        <Text style={styles.focusedTitle}>{focusedTask.title}</Text>
        <View style={styles.focusedBudgetRow}>
          <Text style={styles.focusedBudget}>€{focusedTask.budget?.toFixed(0) || '0'}</Text>
          <Text style={styles.focusedMeta}>{formatTimeAgo(focusedTask.created_at!)}</Text>
        </View>
        {focusedTask.description && (
          <View style={styles.focusedSection}>
            <Text style={styles.focusedSectionTitle}>Description</Text>
            <Text style={styles.focusedDescription} numberOfLines={3}>{focusedTask.description}</Text>
          </View>
        )}
        {focusedTask.location && (
          <View style={styles.focusedSection}>
            <Text style={styles.focusedSectionTitle}>Location</Text>
            <Text style={styles.focusedLocation} numberOfLines={2}>📍 {focusedTask.location}</Text>
          </View>
        )}
        <Button
          mode="contained"
          onPress={() => handleViewFullDetails(focusedTask.id)}
          style={styles.viewDetailsButton}
          icon="arrow-right"
        >
          View Full Details
        </Button>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptySheet}>
      <Text style={styles.emptyIcon}>💭</Text>
      <Text style={styles.emptyText}>
        {debouncedSearchQuery ? 'No results found' : 'No jobs found'}
      </Text>
      <Text style={styles.emptySubtext}>
        {debouncedSearchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
      </Text>
      <TouchableOpacity style={styles.emptyPostButton} onPress={handleCreatePress}>
        <Text style={styles.emptyPostText}>+ Post a Job</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && !debouncedSearchQuery && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading jobs...</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <TouchableOpacity onPress={() => { haptic.medium(); refetch(); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && userLocation && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
            onRegionChangeComplete={handleRegionChange}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {/* Custom user location marker - zoom aware */}
            {renderUserLocationMarker()}

            {/* Task markers - individual or clustered */}
            {clusters.map((cluster) => (
              <Marker
                key={cluster.id}
                coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                onPress={() => handleClusterPress(cluster)}
                tracksViewChanges={false}
              >
                {cluster.isCluster ? (
                  // Gold coin cluster marker
                  <View style={styles.coinClusterContainer}>
                    <View style={styles.coinCluster}>
                      <Text style={styles.coinEuro}>€</Text>
                    </View>
                    <View style={styles.coinBadge}>
                      <Text style={styles.coinBadgeText}>{cluster.tasks.length}</Text>
                    </View>
                  </View>
                ) : (
                  // Individual price marker
                  <View style={[
                    styles.priceMarker,
                    { borderColor: getMarkerColor(cluster.tasks[0].category) },
                    focusedTaskId === cluster.tasks[0].id && styles.priceMarkerFocused
                  ]}>
                    <Text style={[styles.priceMarkerText, { color: getMarkerColor(cluster.tasks[0].category) }]}>
                      €{cluster.tasks[0].budget?.toFixed(0) || '0'}
                    </Text>
                  </View>
                )}
              </Marker>
            ))}

            {/* Boosted offerings */}
            {boostedOfferings.map((offering) => (
              <Marker
                key={`offering-${offering.id}`}
                coordinate={{ latitude: offering.latitude!, longitude: offering.longitude! }}
                onPress={() => handleMarkerPress(undefined, offering)}
                tracksViewChanges={false}
              >
                <View style={[styles.priceMarker, styles.priceMarkerOffering]}>
                  <Text style={styles.priceMarkerTextOffering}>
                    {offering.price ? `€${offering.price}` : '€'}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>

          <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => { haptic.light(); setShowCategoryModal(true); }}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="light" style={styles.filterButtonBlur}>
                  <Text style={styles.filterButtonText}>{selectedCategoryLabel}</Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => { haptic.light(); setShowRadiusModal(true); }}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="light" style={styles.filterButtonBlur}>
                  <Text style={styles.filterButtonText}>{selectedRadiusLabel}</Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
              <BlurView intensity={80} tint="light" style={styles.searchBarBlur}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search jobs..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch} style={styles.searchClearButton}>
                    <Text style={styles.searchClearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
                {showSearchLoading && (
                  <ActivityIndicator size="small" color="#0ea5e9" style={styles.searchLoader} />
                )}
              </BlurView>
            </View>
          </SafeAreaView>

          {filteredTasks.length === 0 && !isLoading && !showSearchLoading && (
            <View style={styles.emptyMapOverlay}>
              <BlurView intensity={80} tint="light" style={styles.emptyMapCard}>
                <Text style={styles.emptyMapIcon}>🗺️</Text>
                <Text style={styles.emptyMapText}>
                  {debouncedSearchQuery ? 'No results found' : 'No jobs found'}
                </Text>
                <Text style={styles.emptyMapSubtext}>
                  {debouncedSearchQuery ? 'Try a different search' : 'Try adjusting filters'}
                </Text>
              </BlurView>
            </View>
          )}

          <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation} activeOpacity={0.8}>
            <BlurView intensity={90} tint="light" style={styles.myLocationBlur}>
              <Text style={styles.myLocationIcon}>📍</Text>
            </BlurView>
          </TouchableOpacity>

          <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
            {/* Drag Handle */}
            <View {...panResponder.panHandlers} style={styles.sheetHandle}>
              <View style={styles.handleBar} />
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetTitle}>
                  {focusedTask ? 'Job Details' : `${sortedTasks.length} job${sortedTasks.length !== 1 ? 's' : ''} nearby`}
                </Text>
                {focusedTask && (
                  <IconButton icon="close" size={20} onPress={handleCloseFocusedJob} style={styles.closeButton} />
                )}
                {!focusedTask && (
                  <TouchableOpacity style={styles.quickPostButton} onPress={handleCreatePress} activeOpacity={0.8}>
                    <Text style={styles.quickPostIcon}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Content */}
            {focusedTask ? (
              <FlatList
                ref={listRef}
                data={[focusedTask]}
                renderItem={() => renderFocusedTask()}
                keyExtractor={(item) => `focused-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : sortedTasks.length === 0 ? (
              renderEmptyList()
            ) : (
              <FlatList
                ref={listRef}
                data={sortedTasks}
                renderItem={renderJobItem}
                keyExtractor={(item) => `task-${item.id}`}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
              />
            )}
          </Animated.View>
        </View>
      )}

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { haptic.soft(); setShowCategoryModal(false); }}>
          <View style={styles.filterModalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.key}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  style={[styles.filterOption, selectedCategory === cat.key && styles.filterOptionActive]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterOptionIcon}>{cat.icon}</Text>
                  <Text style={[styles.filterOptionText, selectedCategory === cat.key && styles.filterOptionTextActive]}>
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.key && <Text style={styles.filterOptionCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Radius Modal */}
      <Modal visible={showRadiusModal} transparent animationType="fade" onRequestClose={() => setShowRadiusModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { haptic.soft(); setShowRadiusModal(false); }}>
          <View style={styles.filterModalContent}>
            <Text style={styles.modalTitle}>Select Radius</Text>
            <FlatList
              data={RADIUS_OPTIONS}
              keyExtractor={(item) => item.key}
              renderItem={({ item: rad }) => (
                <TouchableOpacity
                  style={[styles.filterOption, selectedRadius === rad.value && styles.filterOptionActive]}
                  onPress={() => handleRadiusSelect(rad.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterOptionIcon}>📍</Text>
                  <Text style={[styles.filterOptionText, selectedRadius === rad.value && styles.filterOptionTextActive]}>
                    {rad.label}
                  </Text>
                  {selectedRadius === rad.value && <Text style={styles.filterOptionCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { haptic.soft(); setShowCreateModal(false); }}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What do you want to create?</Text>
            <TouchableOpacity style={styles.modalOption} onPress={handleCreateJob} activeOpacity={0.7}>
              <Text style={styles.modalOptionIcon}>💼</Text>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Post a Job</Text>
                <Text style={styles.modalOptionSubtitle}>Find someone to help you</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleCreateService} activeOpacity={0.7}>
              <Text style={styles.modalOptionIcon}>⚡</Text>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Offer a Service</Text>
                <Text style={styles.modalOptionSubtitle}>Share your skills</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { haptic.soft(); setShowCreateModal(false); }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  statusText: { marginTop: 12, color: '#6b7280', textAlign: 'center' },
  errorText: { color: '#ef4444', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  retryText: { color: '#ffffff', fontWeight: '600' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  filterButtonsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  filterButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  filterButtonBlur: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  filterButtonIcon: { fontSize: 10, color: '#6b7280', marginLeft: 8 },
  searchBarContainer: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  searchBarBlur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, overflow: 'hidden' },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1f2937', paddingVertical: 0 },
  searchClearButton: { marginLeft: 8, padding: 4 },
  searchClearIcon: { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
  searchLoader: { marginLeft: 8 },
  emptyMapOverlay: { position: 'absolute', top: '40%', left: 24, right: 24, alignItems: 'center' },
  emptyMapCard: { paddingVertical: 20, paddingHorizontal: 28, borderRadius: 16, alignItems: 'center', overflow: 'hidden' },
  emptyMapIcon: { fontSize: 32, marginBottom: 8 },
  emptyMapText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyMapSubtext: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  myLocationButton: { position: 'absolute', bottom: 100, right: 16, zIndex: 10 },
  myLocationBlur: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  myLocationIcon: { fontSize: 22 },
  
  // Gold coin cluster marker
  coinClusterContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCluster: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCD34D', // Gold base
    borderWidth: 3,
    borderColor: '#F59E0B', // Darker gold border for depth
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  coinEuro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#92400E', // Dark amber for € symbol
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  coinBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#DC2626', // Red badge
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  coinBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Custom user location markers
  userMarkerFull: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerHalo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue halo
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6', // Blue dot
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  userMarkerSubtle: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.6)', // Semi-transparent blue ring
  },
  
  // Individual price markers
  priceMarker: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priceMarkerFocused: {
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  priceMarkerOffering: {
    borderColor: '#f97316',
  },
  priceMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  priceMarkerTextOffering: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f97316',
  },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  sheetHandle: { alignItems: 'center', paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16 },
  handleBar: { width: 40, height: 5, backgroundColor: '#d1d5db', borderRadius: 3, marginBottom: 12 },
  sheetTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  closeButton: { margin: -8 },
  quickPostButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0ea5e9', width: 32, height: 32, borderRadius: 16 },
  quickPostIcon: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  listContent: { paddingBottom: 40 },
  emptySheet: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  emptyPostButton: { marginTop: 16, backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyPostText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  jobItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  jobLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  jobCategoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '500', color: '#1f2937', marginBottom: 2 },
  jobMeta: { fontSize: 13, color: '#9ca3af' },
  jobRight: { alignItems: 'flex-end', marginLeft: 12 },
  jobPrice: { fontSize: 16, fontWeight: 'bold', color: '#0ea5e9' },
  jobDistance: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  focusedJobContainer: { padding: 20 },
  focusedJobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  focusedCategoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  focusedCategoryText: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  focusedDistance: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  focusedTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 10, lineHeight: 26 },
  focusedBudgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  focusedBudget: { fontSize: 26, fontWeight: 'bold', color: '#0ea5e9' },
  focusedMeta: { fontSize: 13, color: '#9ca3af' },
  focusedSection: { marginBottom: 14 },
  focusedSectionTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  focusedDescription: { fontSize: 15, color: '#374151', lineHeight: 22 },
  focusedLocation: { fontSize: 14, color: '#374151', lineHeight: 20 },
  viewDetailsButton: { marginTop: 16, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12 },
  modalOptionIcon: { fontSize: 32, marginRight: 16 },
  modalOptionText: { flex: 1 },
  modalOptionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  modalOptionSubtitle: { fontSize: 14, color: '#6b7280' },
  modalCancel: { marginTop: 8, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  filterModalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, maxHeight: '70%' },
  filterOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#f9fafb' },
  filterOptionActive: { backgroundColor: '#e0f2fe' },
  filterOptionIcon: { fontSize: 20, marginRight: 12 },
  filterOptionText: { flex: 1, fontSize: 16, color: '#1f2937', fontWeight: '500' },
  filterOptionTextActive: { color: '#0ea5e9', fontWeight: '600' },
  filterOptionCheck: { fontSize: 18, color: '#0ea5e9', fontWeight: 'bold' },
});
