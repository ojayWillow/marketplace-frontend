import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton, Card, Surface } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTasks, getOfferings, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';

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

// Radius options in km
const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: null, label: 'Any' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(10); // Default 10km
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter tasks based on search, category, and radius
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Must have location for map
      if (!task.latitude || !task.longitude) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      
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
        if (distance > selectedRadius) return false;
      }
      
      return true;
    });
  }, [allTasks, searchQuery, selectedCategory, selectedRadius, userLocation]);

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

  const handleRadiusSelect = (radius: number | null) => {
    haptic.selection();
    setSelectedRadius(radius);
    setSelectedTask(null);
    setSelectedOffering(null);
  };

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (selectedRadius !== null ? 1 : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search & Filter Bar */}
      <Surface style={styles.searchContainer} elevation={2}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              showFilters && styles.filterButtonActive
            ]} 
            onPress={() => { haptic.selection(); setShowFilters(!showFilters); }}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Expandable Filters */}
        {showFilters && (
          <View style={styles.filtersExpanded}>
            {/* Radius Filter */}
            <Text style={styles.filterLabel}>Distance</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.filterChip,
                    selectedRadius === option.value && styles.filterChipActive
                  ]}
                  onPress={() => handleRadiusSelect(option.value)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedRadius === option.value && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Filter */}
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat.key && styles.filterChipActive
                  ]}
                  onPress={() => handleCategorySelect(cat.key)}
                >
                  <Text style={styles.filterChipIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === cat.key && styles.filterChipTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Surface>

      {/* Category Quick Filters (always visible) */}
      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.quickFilterChip,
                selectedCategory === cat.key && styles.quickFilterChipActive
              ]}
              onPress={() => handleCategorySelect(cat.key)}
            >
              <Text style={styles.quickFilterIcon}>{cat.icon}</Text>
              <Text style={[
                styles.quickFilterText,
                selectedCategory === cat.key && styles.quickFilterTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
              latitudeDelta: selectedRadius ? selectedRadius * 0.02 : 0.5,
              longitudeDelta: selectedRadius ? selectedRadius * 0.02 : 0.5,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {/* Radius Circle */}
            {selectedRadius && (
              <Circle
                center={userLocation}
                radius={selectedRadius * 1000}
                fillColor="rgba(14, 165, 233, 0.1)"
                strokeColor="rgba(14, 165, 233, 0.3)"
                strokeWidth={2}
              />
            )}

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

          {/* Results Count Badge */}
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsText}>
              {filteredTasks.length} job{filteredTasks.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {/* Selected Task Card */}
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
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: getMarkerColor(selectedTask.category) + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.categoryBadgeText,
                        { color: getMarkerColor(selectedTask.category) }
                      ]}>
                        {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => { haptic.soft(); setSelectedTask(null); }}
                      style={styles.closeButtonTop}
                    />
                  </View>

                  <Text variant="titleLarge" numberOfLines={2} style={styles.cardTitle}>
                    {selectedTask.title}
                  </Text>

                  <View style={styles.metaRow}>
                    {userLocation && selectedTask.latitude && selectedTask.longitude && (
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📍</Text>
                        <Text style={styles.metaText}>
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            selectedTask.latitude,
                            selectedTask.longitude
                          ).toFixed(1)} km away
                        </Text>
                      </View>
                    )}
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>🕐</Text>
                      <Text style={styles.metaText}>
                        {formatTimeAgo(selectedTask.created_at)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.budgetLarge}>€{selectedTask.budget?.toFixed(2) || '0.00'}</Text>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Selected Offering Card */}
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
                  <View style={styles.cardTopRow}>
                    <View style={styles.boostBadge}>
                      <Text style={styles.boostBadgeText}>⚡ Boosted Service</Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => { haptic.soft(); setSelectedOffering(null); }}
                      style={styles.closeButtonTop}
                    />
                  </View>

                  <Text variant="titleLarge" numberOfLines={2} style={styles.cardTitle}>
                    {selectedOffering.title}
                  </Text>

                  <Text variant="bodyMedium" style={styles.providerText}>
                    by {selectedOffering.creator_name}
                  </Text>

                  <View style={styles.metaRow}>
                    {userLocation && selectedOffering.latitude && selectedOffering.longitude && (
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📍</Text>
                        <Text style={styles.metaText}>
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            selectedOffering.latitude,
                            selectedOffering.longitude
                          ).toFixed(1)} km away
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.priceLarge}>
                    {selectedOffering.price ? `€${selectedOffering.price}` : 'Negotiable'}
                  </Text>
                </Card.Content>
              </Card>
            </View>
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
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearIcon: {
    fontSize: 14,
    color: '#9ca3af',
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filtersExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0ea5e9',
  },
  filterChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  quickFilters: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickFilterChipActive: {
    backgroundColor: '#0ea5e9',
  },
  quickFilterIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  quickFilterText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#ffffff',
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
  resultsBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resultsText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
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
    borderRadius: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  boostBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  boostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  closeButtonTop: {
    margin: 0,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  providerText: {
    color: '#6b7280',
    marginBottom: 8,
  },
  budgetLarge: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 24,
  },
  priceLarge: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 24,
  },
});
