import { View, ScrollView, RefreshControl, StyleSheet, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, ActivityIndicator, Button, Surface, FAB, SegmentedButtons } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getTasks, getOfferings, useAuthStore, type Task, type Offering } from '@marketplace/shared';

type MainTab = 'jobs' | 'services';

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

  const tasks = jobsQuery.data?.tasks || [];
  const offerings = servicesQuery.data?.offerings || [];

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Find Work</Text>
        <Text style={styles.subtitle}>Discover jobs and services near you</Text>
        
        {/* Main Tab Segmented Control */}
        <View style={styles.segmentContainer}>
          <SegmentedButtons
            value={mainTab}
            onValueChange={(value) => setMainTab(value as MainTab)}
            buttons={[
              { value: 'jobs', label: '📋 Jobs', style: mainTab === 'jobs' ? styles.segmentActive : {} },
              { value: 'services', label: '🛠️ Services', style: mainTab === 'services' ? styles.segmentActive : {} },
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.content}>
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
                <Text style={styles.emptyText}>No jobs available</Text>
                <Text style={styles.emptySubtext}>Check back later or post your own job</Text>
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
                <Text style={styles.emptyText}>No services available</Text>
                <Text style={styles.emptySubtext}>Check back later or offer your own service</Text>
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
        onPress={() => setShowCreateModal(true)}
      />

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
  header: { 
    padding: 16, 
    backgroundColor: '#ffffff' 
  },
  title: { 
    fontWeight: 'bold', 
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },
  segmentContainer: { 
    marginTop: 4 
  },
  segmentedButtons: { 
    backgroundColor: '#f3f4f6' 
  },
  segmentActive: { 
    backgroundColor: '#0ea5e9' 
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
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    paddingBottom: 40 
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
});
