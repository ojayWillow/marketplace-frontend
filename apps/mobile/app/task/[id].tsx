import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Chip, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, applyToTask, useAuthStore, type Task } from '@marketplace/shared';
import { useState } from 'react';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [applyMessage, setApplyMessage] = useState('');

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToTask(taskId, applyMessage || undefined),
    onSuccess: () => {
      Alert.alert('Success', 'Your application has been submitted!');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to apply. Please try again.';
      Alert.alert('Error', message);
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to apply for tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    Alert.alert(
      'Apply for Task',
      'Would you like to apply for this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply', onPress: () => applyMutation.mutate() },
      ]
    );
  };

  const handleOpenMap = () => {
    if (task?.latitude && task?.longitude) {
      const url = `https://maps.google.com/?q=${task.latitude},${task.longitude}`;
      Linking.openURL(url);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'assigned': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const isOwnTask = user?.id === task?.creator_id;
  const canApply = isAuthenticated && !isOwnTask && task?.status === 'open';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details' }} />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>Task not found</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Task Details',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <View style={styles.headerTop}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(task.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(task.status)}
            </Chip>
            {task.is_urgent && (
              <Chip style={styles.urgentChip} textStyle={styles.urgentText}>
                🔥 Urgent
              </Chip>
            )}
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>{task.title}</Text>
          
          <View style={styles.priceRow}>
            <Text variant="headlineMedium" style={styles.price}>
              €{task.budget || task.reward || 0}
            </Text>
            {task.pending_applications_count !== undefined && task.pending_applications_count > 0 && (
              <Chip style={styles.applicationsChip}>
                {task.pending_applications_count} application{task.pending_applications_count !== 1 ? 's' : ''}
              </Chip>
            )}
          </View>
        </Surface>

        {/* Description */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </Surface>

        {/* Location */}
        {task.location && (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{task.location}</Text>
            </View>
            {task.latitude && task.longitude && (
              <Button 
                mode="outlined" 
                onPress={handleOpenMap}
                style={styles.mapButton}
                icon="map"
              >
                Open in Maps
              </Button>
            )}
          </Surface>
        )}

        {/* Category & Details */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Chip style={styles.categoryChip}>{task.category}</Chip>
            </View>
            {task.deadline && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Deadline</Text>
                <Text style={styles.detailValue}>
                  {new Date(task.deadline).toLocaleDateString()}
                </Text>
              </View>
            )}
            {task.created_at && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {new Date(task.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Creator */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Posted by</Text>
          <View style={styles.creatorRow}>
            <Avatar.Text 
              size={48} 
              label={task.creator_name?.charAt(0).toUpperCase() || 'U'} 
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <Text variant="titleMedium" style={styles.creatorName}>
                {task.creator_name || 'Unknown'}
              </Text>
              {isOwnTask && (
                <Chip style={styles.ownTaskChip} textStyle={styles.ownTaskText}>
                  Your task
                </Chip>
              )}
            </View>
          </View>
        </Surface>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Apply Button */}
      {canApply && (
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={handleApply}
            loading={applyMutation.isPending}
            disabled={applyMutation.isPending}
            style={styles.applyButton}
            contentStyle={styles.applyButtonContent}
          >
            Apply for this Task
          </Button>
        </Surface>
      )}

      {/* Own Task Actions */}
      {isOwnTask && task.status === 'open' && (
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Coming Soon', 'View applications feature coming soon!')}
            style={styles.applyButton}
            contentStyle={styles.applyButtonContent}
          >
            View Applications ({task.pending_applications_count || 0})
          </Button>
        </Surface>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  urgentChip: {
    backgroundColor: '#fef3c7',
    height: 28,
  },
  urgentText: {
    color: '#92400e',
    fontSize: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  applicationsChip: {
    backgroundColor: '#e0f2fe',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    color: '#4b5563',
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 18,
  },
  location: {
    color: '#4b5563',
    flex: 1,
  },
  mapButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creatorAvatar: {
    backgroundColor: '#0ea5e9',
  },
  creatorInfo: {
    flex: 1,
    gap: 4,
  },
  creatorName: {
    color: '#1f2937',
  },
  ownTaskChip: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-start',
    height: 24,
  },
  ownTaskText: {
    color: '#1d4ed8',
    fontSize: 11,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  applyButton: {
    borderRadius: 12,
  },
  applyButtonContent: {
    paddingVertical: 8,
  },
});
