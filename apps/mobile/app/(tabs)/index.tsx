import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Surface, IconButton, Card } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTasks, type Task } from '@marketplace/shared';

type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Request location permission and get user's location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby tasks');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Fetch tasks with location
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks-map', userLocation],
    queryFn: async () => {
      const params: any = { page: 1, per_page: 50, status: 'open' };
      if (userLocation) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
        params.radius = 50; // 50km radius
      }
      return await getTasks(params);
    },
    enabled: !!userLocation,
  });

  const tasks = data?.tasks || [];

  // Get marker color based on category
  const getMarkerColor = (category: string) => {
    const colors: Record<string, string> = {
      cleaning: '#10b981',
      moving: '#3b82f6',
      repairs: '#f59e0b',
      tutoring: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Quick Help</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={viewMode === 'map' ? 'view-list' : 'map'}
            size={24}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
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
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
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
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {tasks.map((task) => {
              if (!task.latitude || !task.longitude) return null;
              return (
                <Marker
                  key={task.id}
                  coordinate={{
                    latitude: task.latitude,
                    longitude: task.longitude,
                  }}
                  pinColor={getMarkerColor(task.category)}
                  onPress={() => setSelectedTask(task)}
                />
              );
            })}
          </MapView>

          {/* Selected Task Card */}
          {selectedTask && (
            <View style={styles.selectedTaskContainer}>
              <Card
                style={styles.selectedTaskCard}
                onPress={() => {
                  router.push(`/task/${selectedTask.id}`);
                  setSelectedTask(null);
                }}
              >
                <Card.Content>
                  <View style={styles.selectedTaskHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" numberOfLines={1}>
                        {selectedTask.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.category}>
                        {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => setSelectedTask(null)}
                    />
                  </View>
                  <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
                    {selectedTask.description}
                  </Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.budget}>€{selectedTask.budget?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.location}>📍 {selectedTask.location || 'Location'}</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Task Count Badge */}
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{tasks.length} tasks nearby</Text>
          </View>
        </View>
      )}

      {/* List View */}
      {!isLoading && !isError && viewMode === 'list' && (
        <View style={styles.listContainer}>
          <Text variant="titleMedium" style={styles.listTitle}>Tasks Nearby</Text>
          {tasks.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.statusText}>No tasks available nearby</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <Card
                key={task.id}
                style={styles.listCard}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1 }}>
                      {task.title}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                    {task.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.budget}>€{task.budget?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.location}>📍 {task.location || 'Location'}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
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
  selectedTaskContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  selectedTaskCard: {
    backgroundColor: '#ffffff',
  },
  selectedTaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  category: {
    color: '#0ea5e9',
    marginTop: 2,
  },
  description: {
    color: '#6b7280',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budget: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: '#9ca3af',
    fontSize: 13,
  },
  taskCountBadge: {
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
  taskCountText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
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
});
