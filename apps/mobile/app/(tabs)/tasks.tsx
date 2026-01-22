import { View, ScrollView, RefreshControl, StyleSheet, Pressable, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, ActivityIndicator, Button, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getTasks, getOfferings, useAuthStore, type Task, type Offering } from '@marketplace/shared';
import { haptic } from '../../utils/haptics';

type MainTab = 'jobs' | 'services';

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

// Helper to shorten location - extract city name
const shortenLocation = (location: string | undefined): string => {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim());
  
  // Try to find city (skip street addresses, postal codes, country)
  for (const part of parts) {
    if (/^\d/.test(part)) continue;
    if (/LV-\d+/.test(part)) continue;
    if (part.toLowerCase() === 'latvia') continue;
    if (part.length < 3) continue;
    return part;
  }
  
  return location.length > 15 ? location.substring(0, 15) + '...' : location;
};

export default function TasksScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('jobs');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated } = useAuthStore();

  // Browse Jobs query - only open jobs
  const jobsQuery = useQuery({
    queryKey: ['tasks-browse'],
    queryFn: () => getTasks({ page: 1, per_page: 20, status: 'open' }),
    enabled: mainTab === 'jobs',
  });

  // Browse Services query - all active services
  const servicesQuery = useQuery({
    queryKey: ['services-browse'],
    queryFn: () => getOfferings({ page: 1, per_page: 20 }),
    enabled: mainTab === 'services',
  });

  const allTasks = jobsQuery.data?.tasks || [];
  const allOfferings = servicesQuery.data?.offerings || [];

  // Filter by category
  const tasks = selectedCategory === 'all' 
    ? allTasks 
    : allTasks.filter(t => t.category === selectedCategory);
  
  const offerings = selectedCategory === 'all'
    ? allOfferings
    : allOfferings.filter(o => o.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dcfce7', text: '#166534' };
      case 'assigned': return { bg: '#fef3c7', text: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
      case 'pending_confirmation': return { bg: '#f3e8ff', text: '#7c3aed' };
      case 'completed': return { bg: '#f3f4f6', text: '#374151' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'paused': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'pending_confirmation': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const handleTabChange = (tab: MainTab) => {
    haptic.selection();
    setMainTab(tab);
  };

  const handleFilterPress = () => {
    haptic.light();
    setShowFilterModal(true);
  };

  const handleCategorySelect = (category: string) => {
    haptic.selection();
    setSelectedCategory(category);
    setShowFilterModal(false);
  };

  const handleCreate = (type: 'task' | 'offering') => {
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
  };

  const isLoading = mainTab === 'jobs' ? jobsQuery.isLoading : servicesQuery.isLoading;
  const isError = mainTab === 'jobs' ? jobsQuery.isError : servicesQuery.isError;
  const refetch = mainTab === 'jobs' ? jobsQuery.refetch : servicesQuery.refetch;
  const isRefetching = mainTab === 'jobs' ? jobsQuery.isRefetching : servicesQuery.isRefetching;

  const hasActiveFilter = selectedCategory !== 'all';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Compact Header with Tabs + Filter */}
      <View style={styles.header}>
        {/* Tab Pills */}
        <View style={styles.tabsContainer}>
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

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
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
              <TouchableOpacity onPress={() => { haptic.soft(); setSelectedCategory('all'); }} style={styles.clearFilterButton}>
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
              <Button mode="contained" onPress={() => refetch()}>Retry</Button>
            </View>
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
              tasks.map((task: Task) => {
                const statusColors = getStatusColor(task.status);
                const shortLocation = shortenLocation(task.location);
                return (
                  <Card key={task.id} style={styles.card} onPress={() => router.push(`/task/${task.id}`)}>
                    <Card.Content style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{task.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(task.status)}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.category}>{task.category}</Text>
                      <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>{task.description}</Text>
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.price}>€{task.budget?.toFixed(0) || '0'}</Text>
                        <View style={styles.footerMeta}>
                          {shortLocation ? (
                            <Text style={styles.location}>📍 {shortLocation}</Text>
                          ) : null}
                          <Text style={styles.creator}>👤 {task.creator_name || 'Anonymous'}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })
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
              offerings.map((offering: Offering) => {
                const statusColors = getStatusColor(offering.status || 'active');
                return (
                  <Card key={offering.id} style={styles.card} onPress={() => router.push(`/offering/${offering.id}`)}>
                    <Card.Content style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{offering.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(offering.status || 'active')}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.categoryOrange}>{offering.category}</Text>
                      <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>{offering.description}</Text>
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.priceOrange}>
                          {offering.price_type === 'hourly' ? `€${offering.price}/hr` :
                           offering.price_type === 'fixed' ? `€${offering.price}` : 'Negotiable'}
                        </Text>
                        <Text style={styles.creator}>👤 {offering.creator_name || 'Anonymous'}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })
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
            <Text variant="titleLarge" style={styles.modalTitle}>Create New</Text>
            <Text style={styles.modalSubtitle}>What would you like to create?</Text>
            
            <Pressable
              style={styles.modalOption}
              onPress={() => handleCreate('task')}
            >
              <Text style={styles.modalOptionIcon}>📋</Text>
              <View style={styles.modalOptionText}>
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
              <View style={styles.modalOptionText}>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  // Tab Pills
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 3,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 17,
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
  
  // Filter Button
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#e0f2fe',
  },
  filterIcon: {
    fontSize: 20,
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
  
  // Card Styles
  card: { 
    marginBottom: 12, 
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: { 
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    color: '#1f2937',
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  statusBadgeText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  category: { 
    color: '#0ea5e9', 
    fontSize: 13,
    marginBottom: 6,
  },
  categoryOrange: { 
    color: '#f97316', 
    fontSize: 13,
    marginBottom: 6,
  },
  description: { 
    color: '#6b7280', 
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  price: { 
    color: '#0ea5e9', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  priceOrange: { 
    color: '#f97316', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  location: { 
    color: '#9ca3af', 
    fontSize: 13,
  },
  creator: { 
    color: '#9ca3af', 
    fontSize: 13 
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
  modalOptionText: { 
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
