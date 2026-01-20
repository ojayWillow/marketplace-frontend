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
          tasks.map((task: Task) => {
            const statusColors = getStatusColor(task.status);
            return (
              <Card key={task.id} style={styles.card} onPress={() => router.push(`/task/${task.id}`)}>
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
          })
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
  card: { 
    marginBottom: 12, 
    backgroundColor: '#ffffff', 
    borderRadius: 12 
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
    fontSize: 12, 
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
