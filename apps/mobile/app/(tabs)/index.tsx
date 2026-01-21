import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton, Card, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTasks, getOfferings, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 80;
const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.45;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;

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

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);

  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);

  const animateSheetTo = (height: number) => {
    currentHeight.current = height;
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
        return Math.abs(gestureState.dy) > 5;
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
  });

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: async () => {
      return await getOfferings({ page: 1, per_page: 100, status: 'active' });
    },
  });

  const allTasks = data?.tasks || [];
  const offerings = offeringsData?.offerings || [];
  const boostedOfferings = offerings.filter(
    o => o.is_boost_active && o.latitude && o.longitude
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      
      // Radius filter
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

  const handleMarkerPress = (task?: Task, offering?: Offering) => {
    haptic.light();
    if (task) {
      // CRITICAL: Move marker HIGHER on screen by SUBTRACTING from latitude
      // Bottom sheet covers bottom 45% of screen
      // We want marker at ~25% from top, so it's well above the sheet
      if (mapRef.current && task.latitude && task.longitude) {
        const latitudeDelta = 0.025;
        const longitudeDelta = 0.025;
        
        // SUBTRACT to move marker UP! (negative offset pushes view center down, marker goes up)
        const offsetAmount = latitudeDelta * 0.25; // Move marker up by 25% of visible area
        
        mapRef.current.animateToRegion({
          latitude: task.latitude - offsetAmount, // SUBTRACT = marker moves UP!
          longitude: task.longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }, 800);
      }
      
      // Show in bottom sheet
      setFocusedTaskId(task.id);
      setSelectedTask(null);
      setSelectedOffering(null);
      animateSheetTo(SHEET_MID_HEIGHT);
      
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    } else if (offering) {
      setSelectedOffering(offering);
      setSelectedTask(null);
      setFocusedTaskId(null);
    }
  };

  const handleJobItemPress = (task: Task) => {
    haptic.medium();
    
    // CRITICAL: Move marker HIGHER by SUBTRACTING from latitude
    if (mapRef.current && task.latitude && task.longitude) {
      const latitudeDelta = 0.025;
      const longitudeDelta = 0.025;
      const offsetAmount = latitudeDelta * 0.25; // Move up by 25% of visible area
      
      mapRef.current.animateToRegion({
        latitude: task.latitude - offsetAmount, // SUBTRACT = marker moves UP!
        longitude: task.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      }, 800);
    }
    
    // Set as focused job
    setFocusedTaskId(task.id);
    setSelectedTask(null);
    setSelectedOffering(null);
    
    // Expand sheet to MID height
    animateSheetTo(SHEET_MID_HEIGHT);
    
    // Scroll to top of sheet content
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
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

  const selectedCategoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label || 'All Categories';
  const selectedRadiusLabel = RADIUS_OPTIONS.find(r => r.value === selectedRadius)?.label || 'All Areas';
  
  const focusedTask = focusedTaskId ? sortedTasks.find(t => t.id === focusedTaskId) : null;

  return (
    <View style={styles.container}>
      {isLoading && (
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
            showsUserLocation
            showsMyLocationButton={false}
          >
            {filteredTasks.map((task) => (
              <Marker
                key={`task-${task.id}`}
                coordinate={{
                  latitude: task.latitude!,
                  longitude: task.longitude!,
                }}
                onPress={() => handleMarkerPress(task, undefined)}
                tracksViewChanges={false}
              >
                <View style={[
                  styles.priceMarker,
                  { borderColor: getMarkerColor(task.category) },
                  focusedTaskId === task.id && styles.priceMarkerFocused
                ]}>
                  <Text style={styles.priceMarkerText}>€{task.budget?.toFixed(0) || '0'}</Text>
                </View>
              </Marker>
            ))}

            {boostedOfferings.map((offering) => (
              <Marker
                key={`offering-${offering.id}`}
                coordinate={{
                  latitude: offering.latitude!,
                  longitude: offering.longitude!,
                }}
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

          {/* Filter Buttons */}
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
          </SafeAreaView>

          {filteredTasks.length === 0 && !isLoading && (
            <View style={styles.emptyMapOverlay}>
              <BlurView intensity={80} tint="light" style={styles.emptyMapCard}>
                <Text style={styles.emptyMapIcon}>🗺️</Text>
                <Text style={styles.emptyMapText}>No jobs found</Text>
                <Text style={styles.emptyMapSubtext}>Try adjusting filters</Text>
              </BlurView>
            </View>
          )}

          <TouchableOpacity 
            style={styles.myLocationButton} 
            onPress={handleMyLocation}
            activeOpacity={0.8}
          >
            <BlurView intensity={90} tint="light" style={styles.myLocationBlur}>
              <Text style={styles.myLocationIcon}>📍</Text>
            </BlurView>
          </TouchableOpacity>

          <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
            <View {...panResponder.panHandlers} style={styles.sheetHandle}>
              <View style={styles.handleBar} />
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetTitle}>
                  {focusedTask ? 'Job Details' : `${sortedTasks.length} job${sortedTasks.length !== 1 ? 's' : ''} nearby`}
                </Text>
                {focusedTask && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={handleCloseFocusedJob}
                    style={styles.closeButton}
                  />
                )}
                {!focusedTask && (
                  <TouchableOpacity 
                    style={styles.quickPostButton}
                    onPress={handleCreatePress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickPostIcon}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView 
              ref={scrollRef}
              style={styles.sheetContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={currentHeight.current > SHEET_MIN_HEIGHT}
            >
              {focusedTask ? (
                // Detailed Job View
                <View style={styles.focusedJobContainer}>
                  <View style={styles.focusedJobHeader}>
                    <View style={[
                      styles.focusedCategoryBadge,
                      { backgroundColor: getMarkerColor(focusedTask.category) }
                    ]}>
                      <Text style={styles.focusedCategoryText}>
                        {focusedTask.category.toUpperCase()}
                      </Text>
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
                    <Text style={styles.focusedMeta}>{formatTimeAgo(focusedTask.created_at)}</Text>
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

                  <Text style={styles.swipeUpHint}>↑ Swipe up for more details</Text>

                  <Button
                    mode="contained"
                    onPress={() => handleViewFullDetails(focusedTask.id)}
                    style={styles.viewDetailsButton}
                    icon="arrow-right"
                  >
                    View Full Details
                  </Button>
                </View>
              ) : sortedTasks.length === 0 ? (
                <View style={styles.emptySheet}>
                  <Text style={styles.emptyIcon}>💭</Text>
                  <Text style={styles.emptyText}>No jobs found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                  <TouchableOpacity 
                    style={styles.emptyPostButton}
                    onPress={handleCreatePress}
                  >
                    <Text style={styles.emptyPostText}>+ Post a Job</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                sortedTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.jobItem}
                    onPress={() => handleJobItemPress(task)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.jobLeft}>
                      <View style={[
                        styles.jobCategoryDot,
                        { backgroundColor: getMarkerColor(task.category) }
                      ]} />
                      <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{task.title}</Text>
                        <Text style={styles.jobMeta}>
                          {task.category} • {formatTimeAgo(task.created_at)}
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
                ))
              )}
              <View style={styles.sheetSpacer} />
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { haptic.soft(); setShowCategoryModal(false); }}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.filterOptionsScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.filterOption,
                    selectedCategory === cat.key && styles.filterOptionActive
                  ]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterOptionIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.filterOptionText,
                    selectedCategory === cat.key && styles.filterOptionTextActive
                  ]}>
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.key && (
                    <Text style={styles.filterOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Radius Modal */}
      <Modal
        visible={showRadiusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { haptic.soft(); setShowRadiusModal(false); }}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.modalTitle}>Select Radius</Text>
            <View style={styles.filterOptionsContainer}>
              {RADIUS_OPTIONS.map((rad) => (
                <TouchableOpacity
                  key={rad.key}
                  style={[
                    styles.filterOption,
                    selectedRadius === rad.value && styles.filterOptionActive
                  ]}
                  onPress={() => handleRadiusSelect(rad.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterOptionIcon}>📍</Text>
                  <Text style={[
                    styles.filterOptionText,
                    selectedRadius === rad.value && styles.filterOptionTextActive
                  ]}>
                    {rad.label}
                  </Text>
                  {selectedRadius === rad.value && (
                    <Text style={styles.filterOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { haptic.soft(); setShowCreateModal(false); }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What do you want to create?</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCreateJob}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionIcon}>💼</Text>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Post a Job</Text>
                <Text style={styles.modalOptionSubtitle}>Find someone to help you</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCreateService}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionIcon}>⚡</Text>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Offer a Service</Text>
                <Text style={styles.modalOptionSubtitle}>Share your skills</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => { haptic.soft(); setShowCreateModal(false); }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  filterButtonIcon: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  emptyMapOverlay: {
    position: 'absolute',
    top: '35%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  emptyMapCard: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyMapIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyMapSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 10,
  },
  myLocationBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  myLocationIcon: {
    fontSize: 22,
  },
  priceMarker: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  priceMarkerFocused: {
    borderWidth: 4,
    transform: [{ scale: 1.2 }],
  },
  priceMarkerOffering: {
    borderColor: '#f97316',
  },
  priceMarkerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  priceMarkerTextOffering: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 10,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    margin: -8,
  },
  quickPostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  quickPostIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sheetContent: {
    flex: 1,
  },
  emptySheet: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyPostButton: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyPostText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  jobLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  jobMeta: {
    fontSize: 13,
    color: '#9ca3af',
  },
  jobRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  jobDistance: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  // Focused job detail styles
  focusedJobContainer: {
    padding: 20,
  },
  focusedJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusedCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusedCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  focusedDistance: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  focusedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 26,
  },
  focusedBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  focusedBudget: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  focusedMeta: {
    fontSize: 13,
    color: '#9ca3af',
  },
  focusedSection: {
    marginBottom: 14,
  },
  focusedSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusedDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  focusedLocation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  swipeUpHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  viewDetailsButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  sheetSpacer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  // Filter modal styles
  filterModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  filterOptionsScroll: {
    maxHeight: 400,
  },
  filterOptionsContainer: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  filterOptionActive: {
    backgroundColor: '#e0f2fe',
  },
  filterOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 18,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
});
