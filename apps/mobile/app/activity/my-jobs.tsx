import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyTasks, type Task } from '@marketplace/shared';

export default function MyJobsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-working-jobs'],
    queryFn: getMyTasks,
  });

  const tasks = data?.tasks || [];
  
  // Separate active tasks from completed/cancelled
  const activeTasks = tasks.filter((t: Task) => 
    ['assigned', 'in_progress', 'pending_confirmation', 'disputed'].includes(t.status)
  );
  const completedTasks = tasks.filter((t: Task) => 
    ['completed', 'cancelled'].includes(t.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dcfce7', text: '#166534' };
      case 'assigned': return { bg: '#dbeafe', text: '#1e40af' }; // Blue - ready to start
      case 'in_progress': return { bg: '#fef3c7', text: '#92400e' }; // Yellow - working
      case 'pending_confirmation': return { bg: '#f3e8ff', text: '#7c3aed' }; // Purple - waiting
      case 'disputed': return { bg: '#fef3c7', text: '#d97706' }; // Orange - dispute
      case 'completed': return { bg: '#f3f4f6', text: '#374151' }; // Gray - done
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' }; // Red - cancelled
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return '🟢 Ready to Start';
      case 'in_progress': return '🟡 In Progress';
      case 'pending_confirmation': return '🟣 Awaiting Confirmation';
      case 'disputed': return '⚠️ Under Review';
      case 'completed': return '✅ Completed';
      case 'cancelled': return '❌ Cancelled';
      default: return status;
    }
  };

  const renderTaskCard = (task: Task) => {
    const statusColors = getStatusColor(task.status);
    const isActive = ['assigned', 'in_progress', 'pending_confirmation', 'disputed'].includes(task.status);
    
    return (
      <Card 
        key={task.id} 
        style={[
          styles.card, 
          isActive && styles.activeCard,
          task.status === 'disputed' && styles.disputedCard
        ]} 
        onPress={() => router.push(`/task/${task.id}`)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{task.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(task.status)}</Text>
            </View>
          </View>
          <Text style={styles.category}>{task.category}</Text>
          <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>€{task.budget?.toFixed(0) || '0'}</Text>
            <Text style={styles.client}>Client: {task.creator_name || 'Anonymous'}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Jobs I'm Working On", 
          headerBackTitle: 'Back',
          headerShown: true,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load</Text>
            <Button mode="contained" onPress={() => refetch()}>Retry</Button>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyText}>No active jobs</Text>
            <Text style={styles.emptySubtext}>Jobs you're working on will appear here</Text>
            <Button mode="contained" onPress={() => router.push('/(tabs)/tasks')} style={styles.browseButton}>
              Find Jobs
            </Button>
          </View>
        ) : (
          <>
            {/* Active Jobs Section */}
            {activeTasks.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>💪 Active Jobs ({activeTasks.length})</Text>
                {activeTasks.map(renderTaskCard)}
              </>
            )}
            
            {/* Completed Jobs Section */}
            {completedTasks.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.completedSection]}>📋 Completed ({completedTasks.length})</Text>
                {completedTasks.map(renderTaskCard)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: { 
    alignItems: 'center', 
    paddingVertical: 48 
  },
  errorText: { 
    color: '#ef4444', 
    marginBottom: 12 
  },
  emptyIcon: { 
    fontSize: 48 
  },
  emptyText: { 
    marginTop: 12, 
    color: '#6b7280', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  emptySubtext: { 
    marginTop: 4, 
    color: '#9ca3af', 
    fontSize: 14 
  },
  browseButton: { 
    marginTop: 16, 
    backgroundColor: '#0ea5e9' 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 4,
  },
  completedSection: {
    marginTop: 24,
    color: '#6b7280',
  },
  card: { 
    marginBottom: 12, 
    backgroundColor: '#ffffff', 
    borderRadius: 12 
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  disputedCard: {
    borderLeftColor: '#f59e0b',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  cardTitle: { 
    fontWeight: '600', 
    flex: 1, 
    marginRight: 12, 
    color: '#1f2937' 
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusBadgeText: { 
    fontSize: 11, 
    fontWeight: '600' 
  },
  category: { 
    color: '#0ea5e9', 
    fontSize: 13, 
    marginBottom: 6 
  },
  description: { 
    color: '#6b7280', 
    marginBottom: 12, 
    lineHeight: 20 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  price: { 
    color: '#0ea5e9', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  client: { 
    color: '#9ca3af', 
    fontSize: 13 
  },
});
