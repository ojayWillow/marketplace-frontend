import React, { useRef, useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import type { Task, Offering } from '@marketplace/shared';

import { useLocation } from './hooks/useLocation';
import { useMapData } from './hooks/useMapData';
import { useBottomSheet } from './hooks/useBottomSheet';

import { 
  UserMarker, 
  JobCard, 
  FocusedJob, 
  SearchBar, 
  CategoryModal, 
  RadiusModal, 
  CreateModal 
} from './components';

import { clusterTasks, type Cluster } from './utils/clustering';
import { calculateDistance } from './utils/distance';
import { CATEGORIES, RADIUS_OPTIONS, getMarkerColor, getZoomLevel } from './utils/constants';
import { styles } from './styles';
import { haptic } from '../../../../utils/haptics';

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);
  
  // Location hook
  const { userLocation } = useLocation();
  
  // Map data hook (tasks, offerings, filters, search)
  const {
    filteredTasks,
    sortedTasks,
    boostedOfferings,
    selectedCategory,
    setSelectedCategory,
    selectedRadius,
    setSelectedRadius,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    clearSearch,
    isLoading,
    isError,
    isSearchFetching,
    refetch,
  } = useMapData({ userLocation });
  
  // Bottom sheet hook
  const { sheetHeight, panResponder, expandToMid, collapse } = useBottomSheet();
  
  // Local state
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Derived state
  const zoomLevel = useMemo(() => getZoomLevel(mapRegion?.latitudeDelta), [mapRegion?.latitudeDelta]);
  const clusters = useMemo(() => clusterTasks(filteredTasks, mapRegion), [filteredTasks, mapRegion]);
  const focusedTask = focusedTaskId ? sortedTasks.find(t => t.id === focusedTaskId) : null;
  const showSearchLoading = debouncedSearchQuery.trim() && isSearchFetching;
  
  const selectedCategoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label || 'All Categories';
  const selectedRadiusLabel = RADIUS_OPTIONS.find(r => r.value === selectedRadius)?.label || 'All Areas';

  // Handlers
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
      handleMarkerPress(cluster.tasks[0], undefined);
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
      setSelectedOffering(null);
      expandToMid();
      
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } else if (offering) {
      setSelectedOffering(offering);
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
    setSelectedOffering(null);
    expandToMid();
    
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const handleCloseFocusedJob = () => {
    haptic.soft();
    setFocusedTaskId(null);
    collapse();
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

  const handleCategorySelect = (category: string) => {
    haptic.selection();
    setSelectedCategory(category);
    setFocusedTaskId(null);
    setShowCategoryModal(false);
  };

  const handleRadiusSelect = (radius: number | null) => {
    haptic.selection();
    setSelectedRadius(radius);
    setShowRadiusModal(false);
  };

  const handleClearSearch = () => {
    haptic.soft();
    clearSearch();
    setFocusedTaskId(null);
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

  // Render functions
  const renderJobItem = ({ item: task }: { item: Task }) => (
    <JobCard 
      task={task} 
      userLocation={userLocation}
      onPress={() => handleJobItemPress(task)}
    />
  );

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

  // Loading state
  if (isLoading && !debouncedSearchQuery) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Loading jobs...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load jobs</Text>
        <TouchableOpacity onPress={() => { haptic.medium(); refetch(); }} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Waiting for location
  if (!userLocation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          {/* User location marker */}
          <UserMarker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            zoomLevel={zoomLevel}
          />

          {/* Task markers - individual or clustered */}
          {clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
              onPress={() => handleClusterPress(cluster)}
              tracksViewChanges={false}
            >
              {cluster.isCluster ? (
                <View style={styles.coinClusterContainer}>
                  <View style={styles.coinCluster}>
                    <Text style={styles.coinEuro}>€</Text>
                  </View>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinBadgeText}>{cluster.tasks.length}</Text>
                  </View>
                </View>
              ) : (
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

        {/* Floating Header with Filters + Search */}
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

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            isLoading={showSearchLoading}
          />
        </SafeAreaView>

        {/* Empty map overlay */}
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

        {/* My Location Button */}
        <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation} activeOpacity={0.8}>
          <BlurView intensity={90} tint="light" style={styles.myLocationBlur}>
            <Text style={styles.myLocationIcon}>📍</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
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

          {focusedTask ? (
            <FlatList
              ref={listRef}
              data={[focusedTask]}
              renderItem={() => (
                <FocusedJob 
                  task={focusedTask} 
                  userLocation={userLocation}
                  onViewDetails={() => router.push(`/task/${focusedTask.id}`)}
                />
              )}
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

      {/* Modals */}
      <CategoryModal
        visible={showCategoryModal}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategoryModal(false)}
      />

      <RadiusModal
        visible={showRadiusModal}
        selectedRadius={selectedRadius}
        onSelect={handleRadiusSelect}
        onClose={() => setShowRadiusModal(false)}
      />

      <CreateModal
        visible={showCreateModal}
        onCreateJob={handleCreateJob}
        onCreateService={handleCreateService}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}
