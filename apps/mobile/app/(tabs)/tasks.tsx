import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, ActivityIndicator, Button, Surface, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getTasks, getCreatedTasks, getMyTasks, getMyApplications, useAuthStore, type Task, type TaskApplication } from '@marketplace/shared';

type FilterTab = 'all' | 'posted' | 'my_jobs' | 'applied';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', activeTab, user?.id],
    queryFn: async () => {
      if (activeTab === 'posted' && user) {
        // Get tasks created by me (as client)
        return await getCreatedTasks();
      } else if (activeTab === 'my_jobs' && user) {
        // Get tasks assigned to me (as worker)
        return await getMyTasks();
      } else if (activeTab === 'applied' && user) {
        // Get my pending applications
        const response = await getMyApplications();
        // Extract tasks from applications (only pending ones)
        const pendingApps = response.applications.filter((app: TaskApplication) => app.status === 'pending');
        return {
          tasks: pendingApps.map((app: TaskApplication) => app.task).filter(Boolean) as Task[],
          total: pendingApps.length,
          page: 1,
        };
      } else {
        // Get all open tasks
        return await getTasks({ page: 1, per_page: 20, status: 'open' });
      }
    },
    enabled: activeTab === 'all' || !!user,
  });

  const tasks = data?.tasks || [];

  const tabs: { id: FilterTab; label: string; requiresAuth: boolean }[] = [
    { id: 'all', label: 'Browse', requiresAuth: false },
    { id: 'my_jobs', label: '💼 My Jobs', requiresAuth: true },
    { id: 'posted', label: 'Posted', requiresAuth: true },
    { id: 'applied', label: 'Applied', requiresAuth: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || isAuthenticated);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dcfce7', text: '#166534' };
      case 'assigned': return { bg: '#fef3c7', text: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
      case 'pending_confirmation': return { bg: '#f3e8ff', text: '#7c3aed' };
      case 'completed': return { bg: '#f3f4f6', text: '#374151' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
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
      default: return status;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'posted':
        return "You haven't posted any tasks yet";
      case 'my_jobs':
        return "No jobs assigned to you yet";
      case 'applied':
        return "No pending applications";
      default:
        return 'No tasks available';
    }
  };

  const getEmptyIcon = () => {
    switch (activeTab) {
      case 'my_jobs': return '💼';
      case 'posted': return '📝';
      case 'applied': return '📨';
      default: return '📋';
    }
  };

  const handleCreateTask = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
    } else {
      router.push('/task/create');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Tasks</Text>
      </Surface>

      {/* Tabs */}
      <Surface style={styles.tabContainer} elevation={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {visibleTabs.map((tab) => (
              <Chip
                key={tab.id}
                selected={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tab}
                mode={activeTab === tab.id ? 'flat' : 'outlined'}
              >
                {tab.label}
              </Chip>
            ))}
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
              <Text style={styles.statusText}>Loading tasks...</Text>
            </View>
          ) : null}

          {/* Error */}
          {isError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load tasks</Text>
              <Button mode="contained" onPress={() => refetch()}>
                Retry
              </Button>
            </View>
          ) : null}

          {/* Empty */}
          {!isLoading && !isError && tasks.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>{getEmptyIcon()}</Text>
              <Text style={styles.statusText}>{getEmptyMessage()}</Text>
              {activeTab === 'posted' ? (
                <Button 
                  mode="contained" 
                  onPress={handleCreateTask}
                  style={styles.createButton}
                >
                  Create Your First Task
                </Button>
              ) : null}
              {activeTab === 'my_jobs' ? (
                <Text style={styles.hintText}>
                  Apply to tasks to get jobs!
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Tasks List */}
          {!isLoading && !isError && tasks.length > 0 ? (
            <View>
              {tasks.map((task: Task) => {
                const statusColors = getStatusColor(task.status);
                const isMyJob = activeTab === 'my_jobs';
                
                return (
                  <Card
                    key={task.id}
                    style={styles.card}
                    onPress={() => router.push(`/task/${task.id}`)}
                  >
                    <Card.Content>
                      {/* Header Row */}
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
                            {task.title}
                          </Text>
                          {task.category ? (
                            <Text style={styles.category}>
                              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </Text>
                          ) : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusText2, { color: statusColors.text }]}>
                            {getStatusLabel(task.status)}
                          </Text>
                        </View>
                      </View>

                      {/* My Job indicator */}
                      {isMyJob ? (
                        <View style={styles.myJobBadge}>
                          <Text style={styles.myJobText}>🛠️ You're working on this</Text>
                        </View>
                      ) : null}

                      {/* Description */}
                      <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                        {task.description}
                      </Text>

                      {/* Footer */}
                      <View style={styles.cardFooter}>
                        <View style={styles.footerLeft}>
                          <Text style={styles.budget}>
                            €{task.budget?.toFixed(2) || '0.00'}
                          </Text>
                          <Text style={styles.location}>
                            📍 {task.location || 'Location'}
                          </Text>
                        </View>
                        {activeTab === 'posted' && task.pending_applications_count != null ? (
                          <Text style={styles.applicants}>
                            👥 {task.pending_applications_count}
                          </Text>
                        ) : null}
                      </View>

                      {/* Creator name for My Jobs */}
                      {isMyJob && task.creator_name ? (
                        <Text style={styles.creatorName}>
                          Client: {task.creator_name}
                        </Text>
                      ) : null}

                      {/* Due Date */}
                      {task.deadline ? (
                        <Text style={styles.dueDate}>
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          ) : null}

          {/* Bottom spacer for FAB */}
          <View style={styles.fabSpacer} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTask}
        label="New Task"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  statusText: {
    marginTop: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  hintText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  createButton: {
    marginTop: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: '600',
  },
  category: {
    color: '#0ea5e9',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText2: {
    fontSize: 11,
    fontWeight: '600',
  },
  myJobBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  myJobText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budget: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    marginRight: 16,
  },
  location: {
    color: '#9ca3af',
    fontSize: 13,
  },
  applicants: {
    color: '#9ca3af',
    fontSize: 13,
  },
  creatorName: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  dueDate: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  fabSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0ea5e9',
  },
});
