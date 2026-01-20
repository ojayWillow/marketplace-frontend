import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Surface, IconButton, Card, Chip } from 'react-native-paper';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTasks, getOfferings, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';

type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);

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

  // Infinite query for list view with pagination
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['tasks-home'],
    queryFn: async ({ pageParam = 1 }) => {
      return await getTasks({ page: pageParam, per_page: 20, status: 'open' });
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / 20);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Fetch boosted offerings for map view
  const { data: offeringsData } = useQuery({
    queryKey: ['offerings-map'],
    queryFn: async () => {
      return await getOfferings({ page: 1, per_page: 100, status: 'active' });
    },
  });

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const tasksWithLocation = allTasks.filter(t => t.latitude && t.longitude);
  const tasksWithoutLocation = allTasks.filter(t => !t.latitude || !t.longitude);
  const totalCount = data?.pages[0]?.total || 0;

  // Filter boosted offerings with location
  const offerings = offeringsData?.offerings || [];
  const boostedOfferings = offerings.filter(
    o => o.is_boost_active && o.latitude && o.longitude
  );

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
    haptic.light(); // Haptic on marker tap
    if (task) {
      setSelectedTask(task);
      setSelectedOffering(null);
    } else if (offering) {
      setSelectedOffering(offering);
      setSelectedTask(null);
    }
  };

  const handleViewModeToggle = () => {
    haptic.selection(); // Haptic on toggle
    setViewMode(viewMode === 'map' ? 'list' : 'map');
  };

  const handleCardPress = (id: number, type: 'task' | 'offering') => {
    haptic.light(); // Haptic on card tap
    if (type === 'task') {
      router.push(`/task/${id}`);
    } else {
      router.push(`/offering/${id}`);
    }
  };

  const handleRefresh = () => {
    haptic.soft(); // Subtle haptic on pull-to-refresh
    refetch();
  };

  const renderTaskCard = ({ item: task }: { item: Task }) => (
    <Card
      key={task.id}
      style={styles.listCard}
      onPress={() => handleCardPress(task.id, 'task')}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" numberOfLines={1}>
              {task.title}
            </Text>
            <Text variant="bodySmall" style={styles.category}>
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </Text>
          </View>
          {!task.latitude && (
            <Text style={styles.noLocationBadge}>No location</Text>
          )}
        </View>
        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.budget}>€{task.budget?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.location}>📍 {task.location || 'Location not set'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderListEmpty = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.statusText}>No tasks available</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Quick Help</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={viewMode === 'map' ? 'view-list' : 'map'}
            size={24}
            onPress={handleViewModeToggle}
          />
        </View>
      </Surface>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading tasks...</Text>
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load tasks</Text>
          <TouchableOpacity onPress={() => { haptic.medium(); refetch(); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map View */}
      {!isLoading && !isError && viewMode === 'map' && userLocation && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {/* Task Markers with Price Bubbles */}
            {tasksWithLocation.map((task) => (
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

            {/* Boosted Offering Markers with Price Bubbles */}
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

          {/* Selected Task Card (Single Title) */}
          {selectedTask && (
            <View style={styles.selectedItemContainer}>
              <Card
                style={styles.selectedItemCard}
                onPress={() => {
                  handleCardPress(selectedTask.id, 'task');
                  setSelectedTask(null);
                }}
              >
                <Card.Content>
                  <View style={styles.cardContentSingle}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleLarge" numberOfLines={1} style={styles.singleTitle}>
                        {selectedTask.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.category}>
                        {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => { haptic.soft(); setSelectedTask(null); }}
                      style={styles.closeButton}
                    />
                  </View>
                  <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
                    {selectedTask.description}
                  </Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.budget}>€{selectedTask.budget?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.location}>📍 {selectedTask.location || 'Location'}</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Selected Offering Card (Single Title) */}
          {selectedOffering && (
            <View style={styles.selectedItemContainer}>
              <Card
                style={styles.selectedItemCard}
                onPress={() => {
                  handleCardPress(selectedOffering.id, 'offering');
                  setSelectedOffering(null);
                }}
              >
                <Card.Content>
                  <View style={styles.cardContentSingle}>
                    <Chip mode="flat" compact style={styles.boostChip}>⚡ Boosted</Chip>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text variant="titleLarge" numberOfLines={1} style={styles.singleTitle}>
                        {selectedOffering.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.providerName}>
                        by {selectedOffering.creator_name}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => { haptic.soft(); setSelectedOffering(null); }}
                      style={styles.closeButton}
                    />
                  </View>
                  <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
                    {selectedOffering.description}
                  </Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.price}>
                      {selectedOffering.price ? `€${selectedOffering.price}` : 'Negotiable'}
                    </Text>
                    <Text style={styles.location}>📍 {selectedOffering.location}</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Map Stats Badge */}
          <View style={styles.statsBadge}>
            <Text style={styles.statsText}>
              {tasksWithLocation.length} tasks • {boostedOfferings.length} services
            </Text>
            {tasksWithoutLocation.length > 0 && (
              <TouchableOpacity onPress={() => { haptic.selection(); setViewMode('list'); }} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* List View with Infinite Scroll */}
      {!isLoading && !isError && viewMode === 'list' && (
        <View style={styles.listContainer}>
          <FlatList
            data={allTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text variant="titleMedium" style={styles.listTitle}>
                All Open Tasks ({totalCount})
              </Text>
            }
            ListEmptyComponent={renderListEmpty}
            ListFooterComponent={renderListFooter}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            refreshing={false}
            onRefresh={handleRefresh}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
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
  emptyIcon: {
    fontSize: 48,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  // Custom Price Marker Bubbles
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
  selectedItemContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  selectedItemCard: {
    backgroundColor: '#ffffff',
  },
  cardContentSingle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  singleTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    margin: 0,
  },
  boostChip: {
    height: 28,
    backgroundColor: '#fef3c7',
  },
  category: {
    color: '#0ea5e9',
    marginTop: 2,
  },
  providerName: {
    color: '#6b7280',
    marginTop: 2,
  },
  description: {
    color: '#6b7280',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budget: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 18,
  },
  price: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 18,
  },
  location: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 12,
  },
  viewAllButton: {
    marginTop: 4,
  },
  viewAllText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  listCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noLocationBadge: {
    fontSize: 10,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
  },
});
