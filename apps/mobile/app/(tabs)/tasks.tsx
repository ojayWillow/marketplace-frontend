import { View, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../src/hooks/useTranslation';

// Feature imports
import {
  TabBar,
  ActiveFilterBanner,
  FilterModal,
  useFilters,
  useTasksData,
  createStyles,
  type ListItem,
  MainTab,
  JOB_COLOR,
  OFFERING_COLOR,
} from '../../src/features/tasks';
import { DEFAULT_LOCATION } from '../../src/features/home/constants';

// Reuse CreateModal from home feature
import CreateModal from '../../src/features/home/components/modals/CreateModal';

export default function TasksScreen() {
  const { t } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [hasRealLocation, setHasRealLocation] = useState(false);
  
  const { isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const styles = useMemo(() => createStyles(activeTheme), [activeTheme]);

  // Custom hooks
  const {
    selectedCategory,
    selectedDifficulty,
    handleCategorySelect,
    handleDifficultySelect,
    clearFilters,
    hasActiveFilter,
  } = useFilters();

  const {
    listData,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useTasksData({
    mainTab,
    selectedCategory,
    selectedDifficulty,
    userLocation,
    hasRealLocation,
  });

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

  // Handlers
  const handleCreate = useCallback((type: 'task' | 'offering') => {
    setShowCreateModal(false);
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    router.push(type === 'task' ? '/task/create' : '/offering/create');
  }, [isAuthenticated]);

  // Render functions
  const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
    if (item.type === 'job') {
      return <TaskCard task={item.data as Task} />;
    }
    return <OfferingCard offering={item.data as Offering} />;
  }, []);

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <>
      {hasActiveFilter && (
        <ActiveFilterBanner
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          onPress={() => setShowFilterModal(true)}
          onClear={clearFilters}
          styles={styles}
        />
      )}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      )}
      {isError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{t.common.errorLoading}</Text>
          <Button mode="contained" onPress={refetch}>{t.common.retry}</Button>
        </View>
      )}
    </>
  ), [hasActiveFilter, selectedCategory, selectedDifficulty, clearFilters, isLoading, isError, refetch, styles, t]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading || isError) return null;
    
    const emptyConfig = {
      icon: mainTab === 'services' ? '🛠️' : '📋',
      text: hasActiveFilter 
        ? (mainTab === 'all' ? t.tasks.noFilterMatch : mainTab === 'jobs' ? t.tasks.noJobsFilter : t.tasks.noServicesCategory)
        : (mainTab === 'all' ? t.tasks.noTasks : mainTab === 'jobs' ? t.tasks.noJobs : t.tasks.noServices),
      subtext: hasActiveFilter ? t.tasks.tryDifferentFilters : t.tasks.checkBackLater,
    };

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>{emptyConfig.icon}</Text>
        <Text style={styles.emptyText}>{emptyConfig.text}</Text>
        <Text style={styles.emptySubtext}>{emptyConfig.subtext}</Text>
      </View>
    );
  }, [isLoading, isError, mainTab, hasActiveFilter, t, styles]);

  const ListFooterComponent = useCallback(() => <View style={styles.fabSpacer} />, [styles]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Tabs + Filter */}
      <View style={styles.header}>
        <TabBar mainTab={mainTab} onTabChange={setMainTab} styles={styles} />
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={() => { haptic.light(); setShowFilterModal(true); }}
          activeOpacity={0.7}
        >
          <Text style={styles.filterIcon}>☰</Text>
          {hasActiveFilter && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* List */}
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
      />

      {/* Gradient FAB */}
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

      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        mainTab={mainTab}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        onCategorySelect={handleCategorySelect}
        onDifficultySelect={handleDifficultySelect}
        onClear={clearFilters}
        onClose={() => setShowFilterModal(false)}
        styles={styles}
      />
      <CreateModal
        visible={showCreateModal}
        onCreateJob={() => handleCreate('task')}
        onCreateService={() => handleCreate('offering')}
        onClose={() => setShowCreateModal(false)}
        styles={styles}
      />
    </SafeAreaView>
  );
}
