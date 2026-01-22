import { View, ScrollView, RefreshControl, StyleSheet, Pressable, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Button, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { getTasks, getOfferings, useAuthStore, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';

type MainTab = 'all' | 'jobs' | 'services';

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

// Combined item type for mixed list
type ListItem = 
  | { type: 'job'; data: Task; createdAt: Date }
  | { type: 'service'; data: Offering; createdAt: Date };

export default function TasksScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated } = useAuthStore();

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

  // Filter by category (memoized to prevent unnecessary recalculations)
  const tasks = useMemo(() => 
    selectedCategory === 'all' 
      ? allTasks 
      : allTasks.filter(t => t.category === selectedCategory),
    [allTasks, selectedCategory]
  );
  
  const offerings = useMemo(() => 
    selectedCategory === 'all'
      ? allOfferings
      : allOfferings.filter(o => o.category === selectedCategory),
    [allOfferings, selectedCategory]
  );

  // Combined and sorted list for "All" tab
  const mixedItems = useMemo((): ListItem[] => {
    if (mainTab !== 'all') return [];
    
    const jobItems: ListItem[] = tasks.map(task => ({
      type: 'job' as const,
      data: task,
      createdAt: new Date(task.created_at || 0),
    }));
    
    const serviceItems: ListItem[] = offerings.map(offering => ({
      type: 'service' as const,
      data: offering,
      createdAt: new Date(offering.created_at || 0),
    }));
    
    // Combine and sort by creation date (newest first)
    return [...jobItems, ...serviceItems].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
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

  const hasActiveFilter = selectedCategory !== 'all';

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

        {/* Filter Button - Burger Menu Style */}
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Text style={styles.filterIcon}>☰</Text>
          {hasActiveFilter && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.content}>
          {/* Active Filter Indicator */}
          {hasActiveFilter && (
            <TouchableOpacity style={styles.activeFilterBanner} onPress={handleFilterPress} activeOpacity={0.7}>
              <Text style={styles.activeFilterText}>
                {CATEGORIES.find(c => c.key === selectedCategory)?.icon} {CATEGORIES.find(c => c.key === selectedCategory)?.label}
              </Text>
              <TouchableOpacity onPress={handleClearFilter} style={styles.clearFilterButton}>
                <Text style={styles.clearFilterText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Loading */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : null}

          {/* Error */}
          {isError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load</Text>
              <Button mode="contained" onPress={refetch}>Retry</Button>
            </View>
          ) : null}

          {/* All Tab - Mixed List */}
          {mainTab === 'all' && !isLoading && !isError ? (
            mixedItems.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {hasActiveFilter ? 'Nothing in this category' : 'No jobs or services available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {hasActiveFilter ? 'Try a different filter' : 'Check back later or create your own'}
                </Text>
              </View>
            ) : (
              mixedItems.map((item) => 
                item.type === 'job' 
                  ? <TaskCard key={`job-${item.data.id}`} task={item.data as Task} />
                  : <OfferingCard key={`service-${item.data.id}`} offering={item.data as Offering} />
              )
            )
          ) : null}

          {/* Jobs List */}
          {mainTab === 'jobs' && !isLoading && !isError ? (
            tasks.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {hasActiveFilter ? 'No jobs in this category' : 'No jobs available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {hasActiveFilter ? 'Try a different filter' : 'Check back later or post your own job'}
                </Text>
              </View>
            ) : (
              tasks.map((task: Task) => <TaskCard key={`task-${task.id}`} task={task} />)
            )
          ) : null}

          {/* Services List */}
          {mainTab === 'services' && !isLoading && !isError ? (
            offerings.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>🛠️</Text>
                <Text style={styles.emptyText}>
                  {hasActiveFilter ? 'No services in this category' : 'No services available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {hasActiveFilter ? 'Try a different filter' : 'Check back later or offer your own service'}
                </Text>
              </View>
            ) : (
              offerings.map((offering: Offering) => <OfferingCard key={`offering-${offering.id}`} offering={offering} />)
            )
          ) : null}

          <View style={styles.fabSpacer} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => { haptic.medium(); setShowCreateModal(true); }}
      />

      {/* Filter Modal */}
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
            <Text style={styles.filterModalTitle}>Filter by Category</Text>
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

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New</Text>
            <Text style={styles.modalSubtitle}>What would you like to create?</Text>
            
            <Pressable
              style={styles.modalOption}
              onPress={() => handleCreate('task')}
            >
              <Text style={styles.modalOptionIcon}>📋</Text>
              <View style={styles.modalOptionTextWrapper}>
                <Text style={styles.modalOptionTitle}>Post a Job</Text>
                <Text style={styles.modalOptionDesc}>Find someone to help you</Text>
              </View>
              <Text style={styles.modalArrow}>›</Text>
            </Pressable>
            
            <Pressable
              style={styles.modalOption}
              onPress={() => handleCreate('offering')}
            >
              <Text style={styles.modalOptionIcon}>🛠️</Text>
              <View style={styles.modalOptionTextWrapper}>
                <Text style={styles.modalOptionTitle}>Offer a Service</Text>
                <Text style={styles.modalOptionDesc}>Advertise your skills</Text>
              </View>
              <Text style={styles.modalArrow}>›</Text>
            </Pressable>

            <Button mode="text" onPress={() => setShowCreateModal(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  
  // Compact Header
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  
  // Tab Pills - Centered
  tabsWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#0ea5e9',
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e0f2fe',
  },
  filterIcon: {
    fontSize: 18,
    color: '#374151',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
    borderWidth: 1.5,
    borderColor: '#ffffff',
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
  activeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
  },
  clearFilterButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  scrollView: { 
    flex: 1 
  },
  content: { 
    padding: 16 
  },
  centerContainer: { 
    alignItems: 'center', 
    paddingVertical: 48 
  },
  loadingText: { 
    marginTop: 12, 
    color: '#6b7280' 
  },
  emptyText: { 
    marginTop: 12, 
    color: '#6b7280', 
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 4,
    color: '#9ca3af',
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
  fab: { 
    position: 'absolute', 
    margin: 16, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#0ea5e9' 
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
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
    fontWeight: 'bold', 
    color: '#1f2937', 
    textAlign: 'center' 
  },
  modalSubtitle: { 
    color: '#6b7280', 
    textAlign: 'center', 
    marginTop: 4, 
    marginBottom: 24 
  },
  modalOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    marginBottom: 12 
  },
  modalOptionIcon: { 
    fontSize: 32, 
    marginRight: 16 
  },
  modalOptionTextWrapper: { 
    flex: 1 
  },
  modalOptionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  modalOptionDesc: { 
    fontSize: 13, 
    color: '#6b7280', 
    marginTop: 2 
  },
  modalArrow: { 
    fontSize: 24, 
    color: '#9ca3af' 
  },
  cancelButton: { 
    marginTop: 8 
  },
  
  // Filter Modal
  filterModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
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
