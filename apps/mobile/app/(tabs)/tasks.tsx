import { View, ScrollView, RefreshControl, StyleSheet, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, ActivityIndicator, Button, Surface, FAB, SegmentedButtons } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getTasks, getCreatedTasks, getMyTasks, getMyApplications, getOfferings, getMyOfferings, useAuthStore, type Task, type TaskApplication, type Offering } from '@marketplace/shared';

type MainTab = 'jobs' | 'offerings';
type JobFilter = 'all' | 'posted' | 'my_jobs' | 'applied';
type OfferingFilter = 'all' | 'my_offerings';

export default function TasksScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('jobs');
  const [jobFilter, setJobFilter] = useState<JobFilter>('all');
  const [offeringFilter, setOfferingFilter] = useState<OfferingFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Jobs query
  const jobsQuery = useQuery({
    queryKey: ['tasks', jobFilter, user?.id],
    queryFn: async () => {
      if (jobFilter === 'posted' && user) {
        return await getCreatedTasks();
      } else if (jobFilter === 'my_jobs' && user) {
        return await getMyTasks();
      } else if (jobFilter === 'applied' && user) {
        const response = await getMyApplications();
        const pendingApps = response.applications.filter((app: TaskApplication) => app.status === 'pending');
        return {
          tasks: pendingApps.map((app: TaskApplication) => app.task).filter(Boolean) as Task[],
          total: pendingApps.length,
          page: 1,
        };
      } else {
        return await getTasks({ page: 1, per_page: 20, status: 'open' });
      }
    },
    enabled: mainTab === 'jobs' && (jobFilter === 'all' || !!user),
  });

  // Offerings query
  const offeringsQuery = useQuery({
    queryKey: ['offerings', offeringFilter, user?.id],
    queryFn: async () => {
      if (offeringFilter === 'my_offerings' && user) {
        return await getMyOfferings();
      }
      return await getOfferings({ page: 1, per_page: 20 });
    },
    enabled: mainTab === 'offerings' && (offeringFilter === 'all' || !!user),
  });

  const tasks = jobsQuery.data?.tasks || [];
  const offerings = offeringsQuery.data?.offerings || [];

  const jobTabs: { id: JobFilter; label: string; requiresAuth: boolean }[] = [
    { id: 'all', label: 'Browse', requiresAuth: false },
    { id: 'my_jobs', label: '💼 My Jobs', requiresAuth: true },
    { id: 'posted', label: 'Posted', requiresAuth: true },
    { id: 'applied', label: 'Applied', requiresAuth: true },
  ];

  const offeringTabs: { id: OfferingFilter; label: string; requiresAuth: boolean }[] = [
    { id: 'all', label: 'Browse', requiresAuth: false },
    { id: 'my_offerings', label: '🛠️ My Services', requiresAuth: true },
  ];

  const visibleJobTabs = jobTabs.filter(tab => !tab.requiresAuth || isAuthenticated);
  const visibleOfferingTabs = offeringTabs.filter(tab => !tab.requiresAuth || isAuthenticated);

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

  const isLoading = mainTab === 'jobs' ? jobsQuery.isLoading : offeringsQuery.isLoading;
  const isError = mainTab === 'jobs' ? jobsQuery.isError : offeringsQuery.isError;
  const refetch = mainTab === 'jobs' ? jobsQuery.refetch : offeringsQuery.refetch;
  const isRefetching = mainTab === 'jobs' ? jobsQuery.isRefetching : offeringsQuery.isRefetching;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Work</Text>
        
        {/* Main Tab Segmented Control */}
        <View style={styles.segmentContainer}>
          <SegmentedButtons
            value={mainTab}
            onValueChange={(value) => setMainTab(value as MainTab)}
            buttons={[
              { value: 'jobs', label: '📋 Jobs', style: mainTab === 'jobs' ? styles.segmentActive : {} },
              { value: 'offerings', label: '🛠️ Services', style: mainTab === 'offerings' ? styles.segmentActive : {} },
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      </Surface>

      {/* Filter Tabs */}
      <Surface style={styles.tabContainer} elevation={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {mainTab === 'jobs' ? (
              visibleJobTabs.map((tab) => (
                <Chip
                  key={tab.id}
                  selected={jobFilter === tab.id}
                  onPress={() => setJobFilter(tab.id)}
                  style={styles.tab}
                  mode={jobFilter === tab.id ? 'flat' : 'outlined'}
                >
                  {tab.label}
                </Chip>
              ))
            ) : (
              visibleOfferingTabs.map((tab) => (
                <Chip
                  key={tab.id}
                  selected={offeringFilter === tab.id}
                  onPress={() => setOfferingFilter(tab.id)}
                  style={styles.tab}
                  mode={offeringFilter === tab.id ? 'flat' : 'outlined'}
                >
                  {tab.label}
                </Chip>
              ))
            )}
          </View>
        </ScrollView>
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
              <Text style={styles.statusText}>Loading...</Text>
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
                <Text style={styles.statusText}>
                  {jobFilter === 'posted' ? "No tasks posted yet" :
                   jobFilter === 'my_jobs' ? "No jobs assigned" :
                   jobFilter === 'applied' ? "No applications" : "No jobs available"}
                </Text>
              </View>
            ) : (
              tasks.map((task: Task) => {
                const statusColors = getStatusColor(task.status);
                return (
                  <Card key={task.id} style={styles.card} onPress={() => router.push(`/task/${task.id}`)}>
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{task.title}</Text>
                          {task.category ? <Text style={styles.category}>{task.category}</Text> : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusText2, { color: statusColors.text }]}>{getStatusLabel(task.status)}</Text>
                        </View>
                      </View>
                      <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>{task.description}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.budget}>€{task.budget?.toFixed(0) || '0'}</Text>
                        <Text style={styles.location}>📍 {task.location || 'Location'}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })
            )
          ) : null}

          {/* Offerings List */}
          {mainTab === 'offerings' && !isLoading && !isError ? (
            offerings.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>🛠️</Text>
                <Text style={styles.statusText}>
                  {offeringFilter === 'my_offerings' ? "No services listed yet" : "No services available"}
                </Text>
              </View>
            ) : (
              offerings.map((offering: Offering) => {
                const statusColors = getStatusColor(offering.status || 'active');
                return (
                  <Card key={offering.id} style={styles.card} onPress={() => router.push(`/offering/${offering.id}`)}>
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{offering.title}</Text>
                          {offering.category ? <Text style={styles.categoryOrange}>{offering.category}</Text> : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusText2, { color: statusColors.text }]}>{getStatusLabel(offering.status || 'active')}</Text>
                        </View>
                      </View>
                      <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>{offering.description}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.budgetOrange}>
                          {offering.price_type === 'hourly' ? `€${offering.price}/hr` :
                           offering.price_type === 'fixed' ? `€${offering.price}` : 'Negotiable'}
                        </Text>
                        {offering.creator_name ? (
                          <Text style={styles.provider}>👤 {offering.creator_name}</Text>
                        ) : null}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#ffffff' },
  title: { fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  segmentContainer: { marginTop: 4 },
  segmentedButtons: { backgroundColor: '#f3f4f6' },
  segmentActive: { backgroundColor: '#0ea5e9' },
  tabContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff' },
  tabsRow: { flexDirection: 'row' },
  tab: { marginRight: 8 },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  centerContainer: { alignItems: 'center', paddingVertical: 48 },
  statusText: { marginTop: 12, color: '#6b7280', textAlign: 'center' },
  errorText: { color: '#ef4444', marginBottom: 12 },
  emptyIcon: { fontSize: 48 },
  card: { marginBottom: 12, backgroundColor: '#ffffff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitleContainer: { flex: 1, marginRight: 8 },
  cardTitle: { fontWeight: '600' },
  category: { color: '#0ea5e9', fontSize: 12, marginTop: 2 },
  categoryOrange: { color: '#f97316', fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText2: { fontSize: 11, fontWeight: '600' },
  description: { color: '#6b7280', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budget: { color: '#0ea5e9', fontWeight: 'bold' },
  budgetOrange: { color: '#f97316', fontWeight: 'bold' },
  location: { color: '#9ca3af', fontSize: 13 },
  provider: { color: '#9ca3af', fontSize: 13 },
  fabSpacer: { height: 80 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#0ea5e9' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  modalSubtitle: { color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 12 },
  modalOptionIcon: { fontSize: 32, marginRight: 16 },
  modalOptionText: { flex: 1 },
  modalOptionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  modalOptionDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  modalArrow: { fontSize: 24, color: '#9ca3af' },
  cancelButton: { marginTop: 8 },
});
