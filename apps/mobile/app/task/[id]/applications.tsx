import { View, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, getTaskApplications, acceptApplication, rejectApplication, useAuthStore, type TaskApplication } from '@marketplace/shared';

export default function TaskApplicationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Fetch applications
  const { data: applicationsData, isLoading: applicationsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['task-applications', taskId],
    queryFn: () => getTaskApplications(taskId),
    enabled: taskId > 0,
  });

  const applications = applicationsData?.applications || [];
  const isLoading = taskLoading || applicationsLoading;

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (applicationId: number) => acceptApplication(taskId, applicationId),
    onSuccess: () => {
      Alert.alert('Success', 'Application accepted! The task has been assigned.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-applications', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to accept application.';
      Alert.alert('Error', message);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (applicationId: number) => rejectApplication(taskId, applicationId),
    onSuccess: () => {
      Alert.alert('Done', 'Application rejected.');
      queryClient.invalidateQueries({ queryKey: ['task-applications', taskId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reject application.';
      Alert.alert('Error', message);
    },
  });

  const handleAccept = (application: TaskApplication) => {
    Alert.alert(
      'Accept Application',
      `Assign this task to ${application.applicant_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptMutation.mutate(application.id) },
      ]
    );
  };

  const handleReject = (application: TaskApplication) => {
    Alert.alert(
      'Reject Application',
      `Reject application from ${application.applicant_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate(application.id) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'accepted': return { bg: '#dcfce7', text: '#166534' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const formatStatus = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  // Check if current user is the task owner
  const isOwner = user?.id === task?.creator_id;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Applications' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isOwner) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Applications' }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>Access Denied</Text>
          <Text style={styles.subText}>Only the task owner can view applications.</Text>
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
          title: 'Applications',
          headerBackTitle: 'Task',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Task Summary */}
        <Surface style={styles.taskSummary} elevation={1}>
          <Text variant="titleMedium" style={styles.taskTitle} numberOfLines={2}>
            {task?.title || 'Task'}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskBudget}>€{task?.budget || 0}</Text>
            <Chip style={styles.taskStatus}>
              <Text>{formatStatus(task?.status || '')}</Text>
            </Chip>
          </View>
        </Surface>

        {/* Applications Count */}
        <View style={styles.countContainer}>
          <Text variant="titleMedium" style={styles.countText}>
            {applications.length} Application{applications.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Empty State */}
        {applications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySubtext}>Share your task to get more applicants!</Text>
          </View>
        )}

        {/* Applications List */}
        {applications.map((application) => {
          const statusColors = getStatusColor(application.status);
          const isPending = application.status === 'pending';
          const isMutating = acceptMutation.isPending || rejectMutation.isPending;

          return (
            <Card key={application.id} style={styles.applicationCard}>
              <Card.Content>
                {/* Applicant Header */}
                <View style={styles.applicantHeader}>
                  <Avatar.Text
                    size={48}
                    label={application.applicant_name?.charAt(0).toUpperCase() || 'U'}
                    style={styles.avatar}
                  />
                  <View style={styles.applicantInfo}>
                    <Text variant="titleMedium" style={styles.applicantName}>
                      {application.applicant_name || 'Unknown'}
                    </Text>
                    <View style={styles.applicantMeta}>
                      {application.applicant_rating != null && application.applicant_rating > 0 && (
                        <Text style={styles.rating}>
                          ⭐ {application.applicant_rating.toFixed(1)}
                        </Text>
                      )}
                      {application.applicant_completed_tasks != null && (
                        <Text style={styles.completedTasks}>
                          ✓ {application.applicant_completed_tasks} tasks
                        </Text>
                      )}
                    </View>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
                    textStyle={{ color: statusColors.text, fontSize: 11 }}
                  >
                    <Text style={{ color: statusColors.text, fontSize: 11 }}>
                      {formatStatus(application.status)}
                    </Text>
                  </Chip>
                </View>

                {/* Message */}
                {application.message ? (
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Message:</Text>
                    <Text style={styles.messageText}>{application.message}</Text>
                  </View>
                ) : null}

                {/* Proposed Price */}
                {application.proposed_price != null && application.proposed_price > 0 ? (
                  <View style={styles.proposedPrice}>
                    <Text style={styles.proposedLabel}>Proposed price:</Text>
                    <Text style={styles.proposedValue}>€{application.proposed_price}</Text>
                  </View>
                ) : null}

                {/* Applied Date */}
                <Text style={styles.appliedDate}>
                  Applied {new Date(application.created_at).toLocaleDateString()}
                </Text>

                {/* Action Buttons - Only for pending applications */}
                {isPending ? (
                  <View>
                    <Divider style={styles.divider} />
                    <View style={styles.actionButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => handleReject(application)}
                        disabled={isMutating}
                        textColor="#ef4444"
                        style={[styles.actionButton, styles.rejectButton]}
                      >
                        Reject
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => handleAccept(application)}
                        disabled={isMutating}
                        loading={acceptMutation.isPending}
                        style={styles.actionButton}
                      >
                        Accept
                      </Button>
                    </View>
                  </View>
                ) : null}
              </Card.Content>
            </Card>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#6b7280',
    marginBottom: 8,
  },
  subText: {
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 120,
  },
  taskSummary: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  taskTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskBudget: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 18,
  },
  taskStatus: {
    backgroundColor: '#f3f4f6',
  },
  countContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  countText: {
    color: '#374151',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#9ca3af',
    marginTop: 4,
  },
  applicationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#0ea5e9',
  },
  applicantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  applicantName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  applicantMeta: {
    flexDirection: 'row',
    marginTop: 2,
  },
  rating: {
    color: '#f59e0b',
    fontSize: 13,
    marginRight: 12,
  },
  completedTasks: {
    color: '#6b7280',
    fontSize: 13,
  },
  statusChip: {
    height: 24,
  },
  messageContainer: {
    marginTop: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  messageLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    color: '#374151',
    lineHeight: 20,
  },
  proposedPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  proposedLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginRight: 8,
  },
  proposedValue: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 15,
  },
  appliedDate: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    borderColor: '#fecaca',
  },
  bottomSpacer: {
    height: 24,
  },
});
