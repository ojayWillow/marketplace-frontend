import { View, StyleSheet, Pressable, Modal, TouchableOpacity, FlatList, ListRenderItem, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Button, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { getTasks, getOfferings, useAuthStore, type Task, type Offering, CATEGORIES, getCategoryByKey } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

type MainTab = 'all' | 'jobs' | 'services';

// Theme colors for Jobs vs Offerings
const JOB_COLOR = '#0ea5e9';      // Sky blue
const OFFERING_COLOR = '#f97316';  // Orange

// Combined item type for mixed list
type ListItem = 
  | { type: 'job'; data: Task; id: string }
  | { type: 'service'; data: Offering; id: string };

const DEFAULT_LOCATION = { latitude: 56.9496, longitude: 24.1052 };

const DIFFICULTY_OPTIONS = [
  { key: 'all', label: 'All', value: null, color: '#6b7280' },
  { key: 'easy', label: 'Easy', value: 'easy', color: '#10b981' },
  { key: 'medium', label: 'Medium', value: 'medium', color: '#f59e0b' },
  { key: 'hard', label: 'Hard', value: 'hard', color: '#ef4444' },
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function TasksScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(DEFAULT_LOCATION);
  const [hasRealLocation, setHasRealLocation] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setHasRealLocation(true);
      } catch (e) {
        console.log('Could not get location:', e);
      }
    })();
  }, []);

  // Browse Jobs query - only open jobs
  const jobsQuery = useQuery({
    queryKey: ['tasks-browse'],
    queryFn: () => getTasks({ page: 1, per_page: 20, status: 'open' }),
    enabled: mainTab === 'jobs' || mainTab === 'all',
  });

  // Browse Services query - all active services
  const servicesQuery = useQuery({
    queryKey: ['services-browse'],
    queryFn: () => getOfferings({ page: 1, per_page: 20 }),
    enabled: mainTab === 'services' || mainTab === 'all',
  });

  const allTasks = jobsQuery.data?.tasks || [];
  const allOfferings = servicesQuery.data?.offerings || [];

  // Add distance to tasks and filter by category + difficulty (memoized)
  const tasks = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? allTasks 
      : allTasks.filter(t => t.category === selectedCategory);
    
    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
    }
    
    // Add distance to each task if location available
    if (hasRealLocation) {
      filtered = filtered.map(task => {
        if (task.latitude && task.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            task.latitude,
            task.longitude
          );
          return { ...task, distance };
        }
        return task;
      });
    }
    
    return filtered;
  }, [allTasks, selectedCategory, selectedDifficulty, userLocation, hasRealLocation]);
  
  const offerings = useMemo(() => 
    selectedCategory === 'all'
      ? allOfferings
      : allOfferings.filter(o => o.category === selectedCategory),
    [allOfferings, selectedCategory]
  );

  // Prepare data for FlatList based on active tab
  const listData = useMemo((): ListItem[] => {
    if (mainTab === 'all') {
      // Mixed list - combine and sort by creation date
      const jobItems: ListItem[] = tasks.map(task => ({
        type: 'job' as const,
        data: task,
        id: `job-${task.id}`,
      }));
      
      const serviceItems: ListItem[] = offerings.map(offering => ({
        type: 'service' as const,
        data: offering,
        id: `service-${offering.id}`,
      }));
      
      return [...jobItems, ...serviceItems].sort((a, b) => {
        const aDate = new Date(a.type === 'job' ? a.data.created_at : a.data.created_at || 0).getTime();
        const bDate = new Date(b.type === 'job' ? b.data.created_at : b.data.created_at || 0).getTime();
        return bDate - aDate;
      });
    } else if (mainTab === 'jobs') {
      return tasks.map(task => ({
        type: 'job' as const,
        data: task,
        id: `task-${task.id}`,
      }));
    } else {
      return offerings.map(offering => ({
        type: 'service' as const,
        data: offering,
        id: `offering-${offering.id}`,
      }));
    }
  }, [mainTab, tasks, offerings]);

  // Stable callbacks with useCallback
  const handleTabChange = useCallback((tab: MainTab) => {
    haptic.selection();
    setMainTab(tab);
  }, []);

  const handleFilterPress = useCallback(() => {
    haptic.light();
    setShowFilterModal(true);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    haptic.selection();
    setSelectedCategory(category);
  }, []);

  const handleDifficultySelect = useCallback((difficulty: string | null) => {
    haptic.selection();
    setSelectedDifficulty(difficulty);
  }, []);

  const handleApplyFilters = useCallback(() => {
    haptic.selection();
    setShowFilterModal(false);
  }, []);

  const handleCreate = useCallback((type: 'task' | 'offering') => {
    setShowCreateModal(false);
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (type === 'task') {
      router.push('/task/create');
    } else {
      router.push('/offering/create');
    }
  }, [isAuthenticated]);

  const handleClearFilter = useCallback(() => {
    haptic.soft();
    setSelectedCategory('all');
    setSelectedDifficulty(null);
  }, []);

  const isLoading = mainTab === 'all' 
    ? (jobsQuery.isLoading || servicesQuery.isLoading)
    : mainTab === 'jobs' 
      ? jobsQuery.isLoading 
      : servicesQuery.isLoading;
      
  const isError = mainTab === 'all'
    ? (jobsQuery.isError && servicesQuery.isError)
    : mainTab === 'jobs'
      ? jobsQuery.isError
      : servicesQuery.isError;
      
  const refetch = useCallback(() => {
    if (mainTab === 'all' || mainTab === 'jobs') jobsQuery.refetch();
    if (mainTab === 'all' || mainTab === 'services') servicesQuery.refetch();
  }, [mainTab, jobsQuery, servicesQuery]);
  
  const isRefetching = mainTab === 'all'
    ? (jobsQuery.isRefetching || servicesQuery.isRefetching)
    : mainTab === 'jobs'
      ? jobsQuery.isRefetching
      : servicesQuery.isRefetching;

  const hasActiveFilter = selectedCategory !== 'all' || selectedDifficulty !== null;
  const selectedCategoryData = getCategoryByKey(selectedCategory);
  const selectedDifficultyData = DIFFICULTY_OPTIONS.find(d => d.value === selectedDifficulty);

  // Styles moved inside component to react to theme
  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: themeColors.backgroundSecondary,
    },
    
    // Compact Header
    header: { 
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: themeColors.card,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      position: 'relative',
    },
    
    // Tab Pills - Centered
    tabsWrapper: {
      flex: 1,
      alignItems: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: 20,
      padding: 3,
    },
    tabPill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 17,
      minWidth: 70,
      alignItems: 'center',
    },
    tabPillActive: {
      backgroundColor: JOB_COLOR,
    },
    tabPillText: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
    },
    tabPillTextActive: {
      color: '#ffffff',
    },
    
    // Filter Button - Positioned Right
    filterButton: {
      position: 'absolute',
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      backgroundColor: '#e0f2fe',
    },
    filterIcon: {
      fontSize: 18,
      color: themeColors.text,
    },
    filterDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: JOB_COLOR,
      borderWidth: 1.5,
      borderColor: themeColors.card,
    },
    
    // Active Filter Banner
    activeFilterBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#e0f2fe',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 12,
    },
    activeFilterContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    difficultyDotSmall: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    activeFilterText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#0369a1',
    },
    clearFilterButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: JOB_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearFilterText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    
    listContent: { 
      padding: 16 
    },
    centerContainer: { 
      alignItems: 'center', 
      paddingVertical: 48 
    },
    loadingText: { 
      marginTop: 12, 
      color: themeColors.textSecondary,
    },
    emptyText: { 
      marginTop: 12, 
      color: themeColors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    emptySubtext: {
      marginTop: 4,
      color: themeColors.textMuted,
      fontSize: 14,
    },
    errorText: { 
      color: '#ef4444', 
      marginBottom: 12 
    },
    emptyIcon: { 
      fontSize: 48 
    },
    
    fabSpacer: { 
      height: 80 
    },
    
    // GRADIENT FAB - Custom
    fabContainer: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    fabButton: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabIcon: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 2,
    },
    
    // Modal Styles - WITH GRADIENTS!
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: { 
      backgroundColor: themeColors.card,
      borderRadius: 20, 
      padding: 24, 
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: { 
      fontSize: 20,
      fontWeight: 'bold', 
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    modalOption: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 16, 
      borderRadius: 12, 
      marginBottom: 12,
      overflow: 'hidden',
    },
    modalOptionIcon: { 
      fontSize: 32, 
      marginRight: 16,
      zIndex: 2,
    },
    modalOptionTextWrapper: { 
      flex: 1,
      zIndex: 2,
    },
    modalOptionTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#ffffff',
    },
    modalOptionDesc: { 
      fontSize: 13, 
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2 
    },
    cancelButton: { 
      marginTop: 8 
    },
    
    // Filter Modal
    filterModalContent: {
      backgroundColor: themeColors.card,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
    },
    filterModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: themeColors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    filterSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
      marginTop: 8,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    
    // Difficulty Segment Control
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    segmentButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      gap: 6,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    segmentButtonActive: {
      backgroundColor: themeColors.card,
    },
    segmentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '500',
      color: themeColors.textSecondary,
    },
    
    // Category ScrollView
    categoryScrollView: {
      maxHeight: 280,
    },
    
    // FLEXIBLE WRAP PILLS - FULL NAMES VISIBLE
    categoryWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.backgroundSecondary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: themeColors.border,
    },
    categoryPillActive: {
      backgroundColor: '#e0f2fe',
      borderColor: JOB_COLOR,
    },
    categoryPillIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    categoryPillLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: themeColors.text,
    },
    categoryPillLabelActive: {
      color: '#0369a1',
      fontWeight: '700',
    },
    categoryPillCheck: {
      fontSize: 14,
      color: JOB_COLOR,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    
    // Filter Actions
    filterActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    clearFiltersButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: themeColors.backgroundSecondary,
      alignItems: 'center',
    },
    clearFiltersText: {
      fontSize: 15,
      fontWeight: '600',
      color: themeColors.textSecondary,
    },
    applyFiltersButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: JOB_COLOR,
      alignItems: 'center',
    },
    applyFiltersText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  // Render item for FlatList
  const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
    if (item.type === 'job') {
      return <TaskCard task={item.data as Task} />;
    }
    return <OfferingCard offering={item.data as Offering} />;
  }, []);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  // List header component (filter banner + loading/error states)
  const ListHeaderComponent = useCallback(() => (
    <>
      {hasActiveFilter && (
        <TouchableOpacity style={styles.activeFilterBanner} onPress={handleFilterPress} activeOpacity={0.7}>
          <View style={styles.activeFilterContent}>
            {selectedCategoryData && selectedCategory !== 'all' && (
              <Text style={styles.activeFilterText}>
                {selectedCategoryData.icon} {selectedCategoryData.label}
              </Text>
            )}
            {selectedDifficultyData && selectedDifficulty && (
              <View style={styles.activeFilterChip}>
                <View style={[styles.difficultyDotSmall, { backgroundColor: selectedDifficultyData.color }]} />
                <Text style={styles.activeFilterText}>{selectedDifficultyData.label}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleClearFilter} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load</Text>
          <Button mode="contained" onPress={refetch}>Retry</Button>
        </View>
      )}
    </>
  ), [hasActiveFilter, isLoading, isError, handleFilterPress, handleClearFilter, refetch, selectedCategoryData, selectedCategory, selectedDifficultyData, selectedDifficulty, styles]);

  // Empty component
  const ListEmptyComponent = useCallback(() => {
    if (isLoading || isError) return null;
    
    const getEmptyIcon = () => {
      if (mainTab === 'services') return '🛠️';
      return '📋';
    };

    const getEmptyText = () => {
      if (hasActiveFilter) {
        if (mainTab === 'all') return 'Nothing matches your filters';
        if (mainTab === 'jobs') return 'No jobs match your filters';
        return 'No services in this category';
      }
      if (mainTab === 'all') return 'No jobs or services available';
      if (mainTab === 'jobs') return 'No jobs available';
      return 'No services available';
    };

    const getEmptySubtext = () => {
      if (hasActiveFilter) return 'Try different filters';
      if (mainTab === 'all') return 'Check back later or create your own';
      if (mainTab === 'jobs') return 'Check back later or post your own job';
      return 'Check back later or offer your own service';
    };

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>{getEmptyIcon()}</Text>
        <Text style={styles.emptyText}>{getEmptyText()}</Text>
        <Text style={styles.emptySubtext}>{getEmptySubtext()}</Text>
      </View>
    );
  }, [isLoading, isError, mainTab, hasActiveFilter, styles]);

  // Footer spacer for FAB
  const ListFooterComponent = useCallback(() => <View style={styles.fabSpacer} />, [styles]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Compact Header with Centered Tabs + Filter */}
      <View style={styles.header}>
        {/* Centered Tab Pills */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabPill, mainTab === 'all' && styles.tabPillActive]}
              onPress={() => handleTabChange('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabPillText, mainTab === 'all' && styles.tabPillTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabPill, mainTab === 'jobs' && styles.tabPillActive]}
              onPress={() => handleTabChange('jobs')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabPillText, mainTab === 'jobs' && styles.tabPillTextActive]}>Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabPill, mainTab === 'services' && styles.tabPillActive]}
              onPress={() => handleTabChange('services')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabPillText, mainTab === 'services' && styles.tabPillTextActive]}>Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Button - Positioned Right */}
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Text style={styles.filterIcon}>☰</Text>
          {hasActiveFilter && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* FlatList instead of ScrollView for virtualization */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetching}
        onRefresh={refetch}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
      />

      {/* GRADIENT FAB - Blue to Orange Split! */}
      <TouchableOpacity 
        style={styles.fabContainer} 
        onPress={() => { haptic.medium(); setShowCreateModal(true); }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[JOB_COLOR, OFFERING_COLOR]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabButton}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* FILTER MODAL - Category + Difficulty */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => { haptic.soft(); setShowFilterModal(false); }}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Filters</Text>
            
            {/* Difficulty Segment - Only show when Jobs or All tab */}
            {(mainTab === 'jobs' || mainTab === 'all') && (
              <>
                <Text style={styles.filterSectionTitle}>Difficulty</Text>
                <View style={styles.segmentContainer}>
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <TouchableOpacity
                      key={diff.key}
                      style={[
                        styles.segmentButton,
                        selectedDifficulty === diff.value && styles.segmentButtonActive,
                        selectedDifficulty === diff.value && { backgroundColor: diff.color + '20', borderColor: diff.color }
                      ]}
                      onPress={() => handleDifficultySelect(diff.value)}
                      activeOpacity={0.7}
                    >
                      {diff.value && (
                        <View style={[styles.segmentDot, { backgroundColor: diff.color }]} />
                      )}
                      <Text style={[
                        styles.segmentText,
                        selectedDifficulty === diff.value && { color: diff.color, fontWeight: '600' }
                      ]}>
                        {diff.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            {/* Category Section */}
            <Text style={styles.filterSectionTitle}>Category</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryScrollView}>
              <View style={styles.categoryWrap}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat.key && styles.categoryPillActive
                    ]}
                    onPress={() => handleCategorySelect(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryPillLabel,
                      selectedCategory === cat.key && styles.categoryPillLabelActive
                    ]}>
                      {cat.label}
                    </Text>
                    {selectedCategory === cat.key && (
                      <Text style={styles.categoryPillCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.clearFiltersButton} 
                onPress={() => { 
                  haptic.light(); 
                  setSelectedCategory('all');
                  setSelectedDifficulty(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyFiltersButton} 
                onPress={handleApplyFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFiltersText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CREATE MODAL - With Blue/Orange Gradient Options */}
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
            
            {/* POST JOB - Blue Gradient */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleCreate('task')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#0ea5e9', '#0284c7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 12 }}
              />
              <Text style={styles.modalOptionIcon}>💼</Text>
              <View style={styles.modalOptionTextWrapper}>
                <Text style={styles.modalOptionTitle}>Post a Job</Text>
                <Text style={styles.modalOptionDesc}>Find someone to help you</Text>
              </View>
            </TouchableOpacity>
            
            {/* OFFER SERVICE - Orange Gradient */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleCreate('offering')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 12 }}
              />
              <Text style={styles.modalOptionIcon}>⚡</Text>
              <View style={styles.modalOptionTextWrapper}>
                <Text style={styles.modalOptionTitle}>Offer a Service</Text>
                <Text style={styles.modalOptionDesc}>Share your skills</Text>
              </View>
            </TouchableOpacity>

            <Button mode="text" onPress={() => { haptic.soft(); setShowCreateModal(false); }} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
