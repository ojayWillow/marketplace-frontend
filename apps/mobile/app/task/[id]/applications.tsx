import { View, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
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

  const handleViewProfile = (applicantId: number) => {
    router.push(`/user/${applicantId}`);
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
            <View style={[styles.statusBadge, { backgroundColor: task?.status === 'open' ? '#dcfce7' : '#f3f4f6' }]}>
              <Text style={[styles.statusBadgeText, { color: task?.status === 'open' ? '#166534' : '#6b7280' }]}>
                {formatStatus(task?.status || '')}
              </Text>
            </View>
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
          
          const hasRating = application.applicant_rating != null && application.applicant_rating > 0;
          const reviewCount = application.applicant_review_count || 0;

          return (
            <Card key={application.id} style={styles.applicationCard}>
              <Card.Content>
                {/* Status Badge - Top Right Corner */}
                <View style={[styles.statusBadgeCorner, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.statusBadgeCornerText, { color: statusColors.text }]}>
                    {formatStatus(application.status)}
                  </Text>
                </View>

                {/* Applicant Header */}
                <View style={styles.applicantHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {application.applicant_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.applicantInfo}>
                    {/* Name - Higher up */}
                    <Text variant="titleLarge" style={styles.applicantName}>
                      {application.applicant_name || 'Unknown'}
                    </Text>
                    
                    {/* Rating directly under name */}
                    {hasRating ? (
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
                        <Text style={styles.ratingValue}>{application.applicant_rating.toFixed(1)}</Text>
                        {reviewCount > 0 ? (
                          <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.noRating}>No reviews yet</Text>
                    )}
                    
                    {/* City - Below rating */}
                    {application.applicant_city ? (
                      <Text style={styles.cityText}>📍 {application.applicant_city}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  {application.applicant_completed_tasks != null ? (
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>✓</Text>
                      <Text style={styles.statText}>{application.applicant_completed_tasks} tasks</Text>
                    </View>
                  ) : null}
                  {application.applicant_member_since ? (
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>👤</Text>
                      <Text style={styles.statText}>
                        Since {new Date(application.applicant_member_since).getFullYear()}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Bio */}
                {application.applicant_bio ? (
                  <View style={styles.bioContainer}>
                    <Text style={styles.bioText} numberOfLines={3}>{application.applicant_bio}</Text>
                  </View>
                ) : null}

                {/* Message */}
                {application.message ? (
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Application message:</Text>
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
                  Applied {new Date(application.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>

                <Divider style={styles.divider} />

                {/* View Profile Button (Always shown) */}
                <Button
                  mode="text"
                  onPress={() => handleViewProfile(application.applicant_id)}
                  style={styles.viewProfileButton}
                  icon="account"
                  compact
                >
                  View Full Profile
                </Button>

                {/* Action Buttons - Only for pending applications */}
                {isPending ? (
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    position: 'relative',
  },
  // Status Badge in Corner
  statusBadgeCorner: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  statusBadgeCornerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 90, // Space for status badge
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  applicantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  applicantName: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    fontSize: 18,
  },
  // Rating Row - directly under name
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStars: {
    fontSize: 14,
    marginRight: 6,
    color: '#f59e0b',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  noRating: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  cityText: {
    color: '#6b7280',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  bioContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bioText: {
    color: '#4b5563',
    lineHeight: 20,
    fontSize: 13,
  },
  messageContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageText: {
    color: '#1e3a8a',
    lineHeight: 20,
  },
  proposedPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proposedLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginRight: 8,
  },
  proposedValue: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appliedDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  viewProfileButton: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    borderColor: '#fecaca',
  },
  bottomSpacer: {
    height: 24,
  },
});
