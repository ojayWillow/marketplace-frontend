import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton, Card } from 'react-native-paper';
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
const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.4;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;

// Categories for filter
const CATEGORIES = [
  { key: 'all', label: 'All', icon: '🔍' },
  { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { key: 'moving', label: 'Moving', icon: '📦' },
  { key: 'repairs', label: 'Repairs', icon: '🔧' },
  { key: 'delivery', label: 'Delivery', icon: '🚗' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚' },
  { key: 'tech', label: 'Tech', icon: '💻' },
  { key: 'beauty', label: 'Beauty', icon: '💅' },
  { key: 'other', label: 'Other', icon: '📋' },
];

// Helper to calculate distance in km
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

// Helper to format time ago
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Bottom sheet animation
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);

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
        
        // Determine snap point based on velocity and position
        if (gestureState.vy < -0.5) {
          // Fast swipe up
          snapTo = newHeight > SHEET_MID_HEIGHT ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;
        } else if (gestureState.vy > 0.5) {
          // Fast swipe down
          snapTo = SHEET_MIN_HEIGHT;
        } else {
          // Slow drag - snap to nearest
          if (newHeight < SHEET_MID_HEIGHT * 0.5) {
            snapTo = SHEET_MIN_HEIGHT;
          } else if (newHeight < (SHEET_MID_HEIGHT + SHEET_MAX_HEIGHT) / 2) {
            snapTo = SHEET_MID_HEIGHT;
          } else {
            snapTo = SHEET_MAX_HEIGHT;
          }
        }
        
        currentHeight.current = snapTo;
        Animated.spring(sheetHeight, {
          toValue: snapTo,
          useNativeDriver: false,
          bounciness: 4,
          speed: 12,
        }).start();
        haptic.selection();
      },
    })
  ).current;

  // Request location permission on mount
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

  // Fetch all tasks
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks-home'],
    queryFn: async () => {
      return await getTasks({ page: 1, per_page: 100, status: 'open' });
    },
  });

  // Fetch boosted offerings for map view
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

  // Filter tasks based on category (no radius filter anymore)
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Must have location for map
      if (!task.latitude || !task.longitude) return false;
      
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      
      return true;
    });
  }, [allTasks, selectedCategory]);

  // Sort by distance for the list
  const sortedTasks = useMemo(() => {
    if (!userLocation) return filteredTasks;
    return [...filteredTasks].sort((a, b) => {
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
  }, [filteredTasks, userLocation]);

  // Get marker color based on category
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
      setSelectedTask(task);
      setSelectedOffering(null);
    } else if (offering) {
      setSelectedOffering(offering);
      setSelectedTask(null);
    }
  };

  const handleCardPress = (id: number, type: 'task' | 'offering') => {
    haptic.light();
    if (type === 'task') {
      router.push(`/task/${id}`);
    } else {
      router.push(`/offering/${id}`);
    }
  };

  const handleCategorySelect = (category: string) => {
    haptic.selection();
    setSelectedCategory(category);
    setSelectedTask(null);
    setSelectedOffering(null);
  };

  return (
    <View style={styles.container}>
      {/* Loading State */}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading jobs...</Text>
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <TouchableOpacity onPress={() => { haptic.medium(); refetch(); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map View */}
      {!isLoading && !isError && userLocation && (
        <View style={styles.mapContainer}>
          <MapView
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
            {/* Task Markers */}
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
                  { borderColor: getMarkerColor(task.category) }
                ]}>
                  <Text style={styles.priceMarkerText}>€{task.budget?.toFixed(0) || '0'}</Text>
                </View>
              </Marker>
            ))}

            {/* Boosted Offering Markers */}
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

          {/* Floating Category Bar - Transparent/Blur */}
          <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <BlurView intensity={80} tint="light" style={styles.categoryBarBlur}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.key && styles.categoryChipActive
                    ]}
                    onPress={() => handleCategorySelect(cat.key)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat.key && styles.categoryTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BlurView>
          </SafeAreaView>

          {/* Selected Task Popup */}
          {selectedTask && (
            <View style={styles.selectedPopup}>
              <Card
                style={styles.popupCard}
                onPress={() => {
                  handleCardPress(selectedTask.id, 'task');
                  setSelectedTask(null);
                }}
              >
                <Card.Content style={styles.popupContent}>
                  <View style={styles.popupHeader}>
                    <View style={[
                      styles.categoryDot,
                      { backgroundColor: getMarkerColor(selectedTask.category) }
                    ]} />
                    <Text style={styles.popupCategory}>
                      {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                    </Text>
                    <IconButton
                      icon="close"
                      size={18}
                      onPress={() => { haptic.soft(); setSelectedTask(null); }}
                      style={styles.popupClose}
                    />
                  </View>
                  <Text style={styles.popupTitle} numberOfLines={1}>{selectedTask.title}</Text>
                  <View style={styles.popupFooter}>
                    <Text style={styles.popupPrice}>€{selectedTask.budget?.toFixed(0) || '0'}</Text>
                    {userLocation && (
                      <Text style={styles.popupDistance}>
                        {calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          selectedTask.latitude!,
                          selectedTask.longitude!
                        ).toFixed(1)} km
                      </Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Slide-up Bottom Sheet */}
          <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
            {/* Drag Handle */}
            <View {...panResponder.panHandlers} style={styles.sheetHandle}>
              <View style={styles.handleBar} />
              <Text style={styles.sheetTitle}>
                {sortedTasks.length} job{sortedTasks.length !== 1 ? 's' : ''} nearby
              </Text>
            </View>

            {/* Job List */}
            <ScrollView 
              style={styles.sheetContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={currentHeight.current > SHEET_MIN_HEIGHT}
            >
              {sortedTasks.length === 0 ? (
                <View style={styles.emptySheet}>
                  <Text style={styles.emptyIcon}>💭</Text>
                  <Text style={styles.emptyText}>No jobs in this area</Text>
                  <Text style={styles.emptySubtext}>Check back later</Text>
                </View>
              ) : (
                sortedTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.jobItem}
                    onPress={() => handleCardPress(task.id, 'task')}
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
  // Floating category bar
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  categoryBarBlur: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
  },
  categoryScroll: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryChipActive: {
    backgroundColor: '#0ea5e9',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  // Price markers
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
  // Selected popup
  selectedPopup: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
  },
  popupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
  },
  popupContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  popupCategory: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  popupClose: {
    margin: -8,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  popupDistance: {
    fontSize: 13,
    color: '#9ca3af',
  },
  // Bottom Sheet
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
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
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
  sheetSpacer: {
    height: 40,
  },
});
