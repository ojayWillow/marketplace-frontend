import { View, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, getTaskApplications, acceptApplication, rejectApplication, useAuthStore, type TaskApplication } from '@marketplace/shared';
import { useEffect, useMemo } from 'react';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

export default function TaskApplicationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Theme
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const styles = useMemo(() => createStyles(activeTheme), [activeTheme]);

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Redirect to task detail if status is pending_confirmation
  useEffect(() => {
    if (task && task.status === 'pending_confirmation') {
      Alert.alert(
        'Task Awaiting Confirmation',
        'The worker has marked this task as done. Please review and confirm completion.',
        [
          {
            text: 'Review Task',
            onPress: () => router.replace(`/task/${taskId}`),
          },
        ],
        { cancelable: false }
      );
    }
  }, [task?.status, taskId]);

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
    const isDark = activeTheme === 'dark';
    switch (status) {
      case 'pending': return { bg: isDark ? '#78350f' : '#fef3c7', text: isDark ? '#fef3c7' : '#92400e' };
      case 'accepted': return { bg: isDark ? '#064e3b' : '#dcfce7', text: isDark ? '#dcfce7' : '#166534' };
      case 'rejected': return { bg: isDark ? '#7f1d1d' : '#fee2e2', text: isDark ? '#fee2e2' : '#991b1b' };
      default: return { bg: themeColors.backgroundSecondary, text: themeColors.textSecondary };
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
        <Stack.Screen options={{ 
          headerShown: true, 
          title: 'Applications',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isOwner) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          headerShown: true, 
          title: 'Applications',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>Access Denied</Text>
          <Text style={styles.subText}>Only the task owner can view applications.</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton} buttonColor={themeColors.primaryAccent}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // If task is no longer open, show notice
  if (task && !['open', 'assigned', 'in_progress'].includes(task.status)) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          headerShown: true, 
          title: 'Applications',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }} />
        <View style={styles.centerContainer}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text variant="headlineSmall" style={styles.errorText}>
            Task No Longer Accepting Applications
          </Text>
          <Text style={styles.subText}>
            This task is currently: {formatStatus(task.status)}
          </Text>
          <Button mode="contained" onPress={() => router.push(`/task/${taskId}`)} style={styles.backButton} buttonColor={themeColors.primaryAccent}>
            View Task Details
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
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={themeColors.primaryAccent} />
        }
      >
        {/* Task Summary */}
        <Surface style={styles.taskSummary} elevation={1}>
          <Text variant="titleMedium" style={styles.taskTitle} numberOfLines={2}>
            {task?.title || 'Task'}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskBudget}>€{task?.budget || 0}</Text>
            <View style={[styles.statusBadge, { backgroundColor: task?.status === 'open' ? (activeTheme === 'dark' ? '#064e3b' : '#dcfce7') : themeColors.backgroundSecondary }]}>
              <Text style={[styles.statusBadgeText, { color: task?.status === 'open' ? (activeTheme === 'dark' ? '#dcfce7' : '#166534') : themeColors.textSecondary }]}>
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
                    <Text variant="titleLarge" style={styles.applicantName}>
                      {application.applicant_name || 'Unknown'}
                    </Text>
                    
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

                {/* View Profile Button */}
                <Button
                  mode="text"
                  onPress={() => handleViewProfile(application.applicant_id)}
                  style={styles.viewProfileButton}
                  icon="account"
                  compact
                  textColor={themeColors.primaryAccent}
                >
                  View Full Profile
                </Button>

                {/* Action Buttons - Only for pending applications AND task is still open */}
                {isPending && task?.status === 'open' ? (
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
                      buttonColor={themeColors.primaryAccent}
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

const createStyles = (theme: 'light' | 'dark') => {
  const themeColors = colors[theme];
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
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
    noticeIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorText: {
      color: themeColors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subText: {
      color: themeColors.textMuted,
      marginBottom: 24,
      textAlign: 'center',
    },
    backButton: {
      minWidth: 120,
    },
    taskSummary: {
      backgroundColor: themeColors.card,
      padding: 16,
    },
    taskTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    taskBudget: {
      color: themeColors.primaryAccent,
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
      color: themeColors.text,
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
      color: themeColors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    emptySubtext: {
      color: themeColors.textMuted,
      marginTop: 4,
    },
    applicationCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: themeColors.card,
      position: 'relative',
    },
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
      paddingRight: 90,
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: themeColors.primaryAccent,
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
      color: themeColors.text,
      marginBottom: 6,
      fontSize: 18,
    },
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
      color: themeColors.textSecondary,
    },
    noRating: {
      fontSize: 13,
      color: themeColors.textMuted,
      marginBottom: 4,
    },
    cityText: {
      color: themeColors.textSecondary,
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
      color: themeColors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    bioContainer: {
      backgroundColor: themeColors.backgroundSecondary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    bioText: {
      color: themeColors.textSecondary,
      lineHeight: 20,
      fontSize: 13,
    },
    messageContainer: {
      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#eff6ff',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    messageLabel: {
      color: themeColors.primaryAccent,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    messageText: {
      color: themeColors.text,
      lineHeight: 20,
    },
    proposedPrice: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    proposedLabel: {
      color: themeColors.textSecondary,
      fontSize: 13,
      marginRight: 8,
    },
    proposedValue: {
      color: '#059669',
      fontWeight: 'bold',
      fontSize: 16,
    },
    appliedDate: {
      color: themeColors.textMuted,
      fontSize: 12,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: themeColors.border,
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
      borderColor: isDark ? '#7f1d1d' : '#fecaca',
    },
    bottomSpacer: {
      height: 24,
    },
  });
};
