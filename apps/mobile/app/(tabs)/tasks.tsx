import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, ActivityIndicator, Button, Surface } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getTasks, getCreatedTasks, getMyApplications, useAuthStore, type Task, type TaskApplication } from '@marketplace/shared';

type FilterTab = 'all' | 'my_tasks' | 'applied';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user } = useAuthStore();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', activeTab, user?.id],
    queryFn: async () => {
      if (activeTab === 'my_tasks' && user) {
        // Get tasks created by me
        return await getCreatedTasks();
      } else if (activeTab === 'applied' && user) {
        // Get my applications
        const response = await getMyApplications();
        // Extract tasks from applications
        return {
          tasks: response.applications.map((app: TaskApplication) => app.task).filter(Boolean) as Task[],
          total: response.total,
          page: 1,
        };
      } else {
        // Get all tasks
        return await getTasks({ page: 1, per_page: 20 });
      }
    },
    enabled: activeTab === 'all' || !!user,
  });

  const tasks = data?.tasks || [];

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'my_tasks', label: 'My Tasks' },
    { id: 'applied', label: 'Applied' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dcfce7', text: '#166534' };
      case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      default: return 'Closed';
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
            {tabs.map((tab) => (
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
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.statusText}>Loading tasks...</Text>
            </View>
          )}

          {/* Error */}
          {isError && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load tasks</Text>
              <Button mode="contained" onPress={() => refetch()}>
                Retry
              </Button>
            </View>
          )}

          {/* Empty */}
          {!isLoading && !isError && tasks.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.statusText}>
                {activeTab === 'my_tasks'
                  ? "You haven't created any tasks yet"
                  : activeTab === 'applied'
                  ? "You haven't applied to any tasks yet"
                  : 'No tasks available'}
              </Text>
            </View>
          )}

          {/* Tasks List */}
          {!isLoading && !isError && tasks.length > 0 && (
            <View>
              {tasks.map((task: Task) => {
                const statusColors = getStatusColor(task.status);
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
                          {task.category && (
                            <Text style={styles.category}>
                              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </Text>
                          )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusText2, { color: statusColors.text }]}>
                            {getStatusLabel(task.status)}
                          </Text>
                        </View>
                      </View>

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
                        {task.pending_applications_count !== undefined && (
                          <Text style={styles.applicants}>
                            👥 {task.pending_applications_count} {task.pending_applications_count === 1 ? 'applicant' : 'applicants'}
                          </Text>
                        )}
                      </View>

                      {/* Due Date */}
                      {task.deadline && (
                        <Text style={styles.dueDate}>
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
    gap: 8,
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
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 48,
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
  dueDate: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
});
