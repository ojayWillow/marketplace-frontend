import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, Chip, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, applyToTask, useAuthStore, type Task } from '@marketplace/shared';
import { useState } from 'react';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [applicationMessage, setApplicationMessage] = useState('');

  // Fetch task details
  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
  });

  // Apply to task mutation
  const applyMutation = useMutation({
    mutationFn: () => applyToTask(taskId, applicationMessage),
    onSuccess: () => {
      Alert.alert('Success', 'Your application has been submitted!');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to apply to task');
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to apply to this task', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    Alert.alert(
      'Apply to Task',
      'Are you sure you want to apply to this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply', onPress: () => applyMutation.mutate() },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Closed';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading task...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load task</Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnTask = user?.id === task.creator_id;
  const canApply = !isOwnTask && task.status === 'open' && isAuthenticated;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Task Details',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header Card */}
        <Card style={styles.card}>
          <Card.Content>
            {/* Status Badge */}
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(task.status) }]}
              textStyle={styles.statusText2}
            >
              {getStatusLabel(task.status)}
            </Chip>

            {/* Title */}
            <Text variant="headlineSmall" style={styles.title}>
              {task.title}
            </Text>

            {/* Category */}
            {task.category && (
              <Text style={styles.category}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Text>
            )}

            {/* Budget */}
            <Text variant="headlineMedium" style={styles.budget}>
              €{task.budget?.toFixed(2) || '0.00'}
            </Text>
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
            <Text variant="bodyLarge" style={styles.description}>
              {task.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Task Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
            
            {/* Location */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{task.location || 'Not specified'}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Deadline */}
            {task.deadline && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Deadline</Text>
                    <Text style={styles.infoValue}>
                      {new Date(task.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {/* Applications */}
            {task.pending_applications_count !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Applications</Text>
                  <Text style={styles.infoValue}>
                    {task.pending_applications_count} {task.pending_applications_count === 1 ? 'person' : 'people'} applied
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Task Creator */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.creatorRow}>
              <Avatar.Text
                size={48}
                label={task.creator_name?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{task.creator_name || 'Unknown'}</Text>
                <Text style={styles.creatorDate}>
                  Posted {new Date(task.created_at || '').toLocaleDateString()}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => {
                  // Navigate to user profile
                  Alert.alert('Coming Soon', 'User profile will be available soon');
                }}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Apply Button */}
      {canApply && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleApply}
            loading={applyMutation.isPending}
            disabled={applyMutation.isPending}
            style={styles.applyButton}
            contentStyle={styles.applyButtonContent}
          >
            Apply to Task
          </Button>
        </View>
      )}

      {isOwnTask && (
        <View style={styles.footer}>
          <Text style={styles.ownTaskText}>This is your task</Text>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#ffffff',
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText2: {
    color: '#ffffff',
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  category: {
    color: '#0ea5e9',
    fontSize: 14,
    marginBottom: 16,
  },
  budget: {
    color: '#0ea5e9',
    fontWeight: 'bold',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#f3f4f6',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    marginRight: 12,
  },
  creatorDate: {
    color: '#6b7280',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  applyButton: {
    borderRadius: 12,
  },
  applyButtonContent: {
    paddingVertical: 8,
  },
  ownTaskText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
});
