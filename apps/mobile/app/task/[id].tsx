import { View, ScrollView, StyleSheet, Alert, Linking, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Chip, Avatar, Divider, ActivityIndicator, Card } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, applyToTask, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask, withdrawApplication, useAuthStore, getImageUrl, type Task } from '@marketplace/shared';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 40; // Accounting for padding
const IMAGE_HEIGHT = 240;

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [applyMessage, setApplyMessage] = useState('');
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to apply. Please try again.';
      Alert.alert('Error', message);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!task?.user_application?.id) {
        throw new Error('No application to withdraw');
      }
      return withdrawApplication(taskId, task.user_application.id);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to withdraw application';
      Alert.alert('Error', message);
    },
  });

  const markDoneMutation = useMutation({
    mutationFn: () => markTaskDone(taskId),
    onSuccess: () => {
      Alert.alert('Success', 'Task marked as done! Waiting for confirmation from the client.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark task as done.';
      Alert.alert('Error', message);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmTaskCompletion(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowReviewPrompt(true);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to confirm completion.';
      Alert.alert('Error', message);
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () => disputeTask(taskId, 'Work not completed satisfactorily'),
    onSuccess: () => {
      Alert.alert('Disputed', 'Task has been disputed. Please contact support.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to dispute task.';
      Alert.alert('Error', message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(taskId),
    onSuccess: () => {
      Alert.alert('Cancelled', 'Task has been cancelled.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to cancel task.';
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

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw your application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: () => withdrawMutation.mutate() },
      ]
    );
  };

  const handleMarkDone = () => {
    Alert.alert(
      'Mark as Done',
      'Mark this task as completed? The client will need to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Done', onPress: () => markDoneMutation.mutate() },
      ]
    );
  };

  const handleConfirmCompletion = () => {
    Alert.alert(
      'Confirm Completion',
      'Confirm that this task has been completed satisfactorily?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmMutation.mutate() },
      ]
    );
  };

  const handleDispute = () => {
    Alert.alert(
      'Dispute Task',
      'Are you not satisfied with the work? This will open a dispute.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dispute', style: 'destructive', onPress: () => disputeMutation.mutate() },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Task',
      'Are you sure you want to cancel this task?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  const handleLeaveReview = () => {
    setShowReviewPrompt(false);
    router.push(`/task/${taskId}/review`);
  };

  const handleSkipReview = () => {
    setShowReviewPrompt(false);
    Alert.alert('Task Completed!', 'You can leave a review later from the task details.');
  };

  const handleOpenMap = () => {
    if (task?.latitude && task?.longitude) {
      const url = `https://maps.google.com/?q=${task.latitude},${task.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleViewProfile = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'assigned': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'pending_confirmation': return '#8b5cf6';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'disputed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'pending_confirmation': return 'Awaiting Confirm';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };

  const isOwnTask = user?.id === task?.creator_id;
  const isAssignedToMe = user?.id === task?.assigned_to_id;
  
  // Use backend's has_applied field instead of just checking status
  const canApply = isAuthenticated && !isOwnTask && task?.status === 'open' && !task?.has_applied;
  const hasApplied = task?.has_applied && task?.user_application?.status === 'pending';
  const canWithdraw = hasApplied;
  
  const canMarkDone = isAssignedToMe && (task?.status === 'assigned' || task?.status === 'in_progress');
  const canConfirm = isOwnTask && task?.status === 'pending_confirmation';
  const canCancel = isOwnTask && task?.status === 'open';
  const canEdit = isOwnTask && task?.status === 'open';
  const canReview = (isOwnTask || isAssignedToMe) && task?.status === 'completed';

  // Parse images from comma-separated string and convert to full URLs
  const taskImages = task?.images 
    ? task.images.split(',').filter(Boolean).map(url => getImageUrl(url))
    : [];

  console.log('Task images:', taskImages); // Debug log

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

  if (showReviewPrompt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Completed' }} />
        <View style={styles.reviewPromptContainer}>
          <Card style={styles.reviewPromptCard}>
            <Card.Content>
              <Text style={styles.reviewPromptIcon}>🎉</Text>
              <Text variant="headlineSmall" style={styles.reviewPromptTitle}>
                Task Completed!
              </Text>
              <Text style={styles.reviewPromptText}>
                Great job! Would you like to leave a review for {isOwnTask ? task.assigned_to_name : task.creator_name}?
              </Text>
              <Text style={styles.reviewPromptHint}>
                Reviews help build trust in the community.
              </Text>
            </Card.Content>
            <Card.Actions style={styles.reviewPromptActions}>
              <Button onPress={handleSkipReview} textColor="#6b7280">
                Maybe Later
              </Button>
              <Button mode="contained" onPress={handleLeaveReview}>
                Leave Review
              </Button>
            </Card.Actions>
          </Card>
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
            {/* Status Badge - Using View instead of Chip */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
              <Text style={styles.statusBadgeText}>
                {getStatusLabel(task.status)}
              </Text>
            </View>
            {task.is_urgent ? (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>🔥 Urgent</Text>
              </View>
            ) : null}
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>{task.title}</Text>
          
          <View style={styles.priceRow}>
            <Text variant="headlineMedium" style={styles.price}>
              €{task.budget || task.reward || 0}
            </Text>
            {task.pending_applications_count != null && task.pending_applications_count > 0 ? (
              <View style={styles.applicationsBadge}>
                <Text style={styles.applicationsBadgeText}>
                  {task.pending_applications_count} application{task.pending_applications_count !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </Surface>

        {/* IMAGE GALLERY */}
        {taskImages.length > 0 ? (
          <View style={styles.imageGalleryContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {taskImages.map((imageUrl, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.taskImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            {taskImages.length > 1 ? (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {taskImages.length} photo{taskImages.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Application Status Notice */}
        {hasApplied ? (
          <Surface style={styles.appliedSection} elevation={0}>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeIcon}>✅</Text>
              <View style={styles.noticeTextContainer}>
                <Text variant="titleMedium" style={styles.noticeTitle}>Application Submitted</Text>
                <Text style={styles.noticeText}>
                  You have applied for this task. Waiting for the client to review your application.
                </Text>
              </View>
            </View>
          </Surface>
        ) : null}

        {/* Pending Confirmation Notice */}
        {task.status === 'pending_confirmation' && isOwnTask ? (
          <Surface style={styles.noticeSection} elevation={0}>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeIcon}>⏳</Text>
              <View style={styles.noticeTextContainer}>
                <Text variant="titleMedium" style={styles.noticeTitle}>Awaiting Your Confirmation</Text>
                <Text style={styles.noticeText}>
                  {task.assigned_to_name} has marked this task as done. Please confirm if the work is complete.
                </Text>
              </View>
            </View>
          </Surface>
        ) : null}

        {/* Completed - Review Notice */}
        {task.status === 'completed' && canReview ? (
          <Surface style={styles.completedSection} elevation={0}>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeIcon}>✅</Text>
              <View style={styles.noticeTextContainer}>
                <Text variant="titleMedium" style={styles.noticeTitle}>Task Completed</Text>
                <Text style={styles.noticeText}>
                  This task was completed on {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'recently'}.
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={() => router.push(`/task/${taskId}/review`)}
                  style={styles.reviewButton}
                  compact
                >
                  Leave a Review
                </Button>
              </View>
            </View>
          </Surface>
        ) : null}

        {/* Description */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </Surface>

        {/* Location */}
        {task.location ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{task.location}</Text>
            </View>
            {task.latitude && task.longitude ? (
              <Button 
                mode="outlined" 
                onPress={handleOpenMap}
                style={styles.mapButton}
                icon="map"
              >
                Open in Maps
              </Button>
            ) : null}
          </Surface>
        ) : null}

        {/* Category & Details */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{task.category}</Text>
              </View>
            </View>
            {task.deadline ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Deadline</Text>
                <Text style={styles.detailValue}>
                  {new Date(task.deadline).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
            {task.created_at ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {new Date(task.created_at).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        </Surface>

        {/* Creator - Now Clickable */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Posted by</Text>
          <TouchableOpacity 
            style={styles.creatorRow}
            onPress={() => task.creator_id && handleViewProfile(task.creator_id)}
            activeOpacity={0.7}
          >
            <View style={styles.creatorAvatarContainer}>
              <Text style={styles.creatorAvatarText}>
                {task.creator_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text variant="titleMedium" style={styles.creatorName}>
                {task.creator_name || 'Unknown'}
              </Text>
              {isOwnTask ? (
                <View style={styles.ownTaskBadge}>
                  <Text style={styles.ownTaskText}>Your task</Text>
                </View>
              ) : null}
              {isAssignedToMe ? (
                <View style={styles.assignedBadge}>
                  <Text style={styles.assignedText}>Assigned to you</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </Surface>

        {/* Assigned Helper - Now Clickable */}
        {task.assigned_to_name && !isAssignedToMe ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Assigned to</Text>
            <TouchableOpacity 
              style={styles.creatorRow}
              onPress={() => task.assigned_to_id && handleViewProfile(task.assigned_to_id)}
              activeOpacity={0.7}
            >
              <View style={styles.helperAvatarContainer}>
                <Text style={styles.helperAvatarText}>
                  {task.assigned_to_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text variant="titleMedium" style={styles.creatorName}>
                  {task.assigned_to_name}
                </Text>
              </View>
            </TouchableOpacity>
          </Surface>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Apply Button */}
      {canApply ? (
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
      ) : null}

      {/* Withdraw Application Button */}
      {canWithdraw ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="outlined"
            onPress={handleWithdraw}
            loading={withdrawMutation.isPending}
            disabled={withdrawMutation.isPending}
            textColor="#ef4444"
            style={[styles.applyButton, styles.withdrawButton]}
            contentStyle={styles.applyButtonContent}
          >
            Withdraw Application
          </Button>
        </Surface>
      ) : null}

      {/* Own Task Actions - Open Status */}
      {isOwnTask && task.status === 'open' ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <View style={styles.ownerActions}>
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                loading={cancelMutation.isPending}
                disabled={cancelMutation.isPending}
                textColor="#ef4444"
                style={[styles.actionButton, styles.cancelButton]}
              >
                Cancel
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push(`/task/${taskId}/edit`)}
                style={styles.actionButton}
              >
                Edit
              </Button>
            </View>
            <Button
              mode="contained"
              onPress={() => router.push(`/task/${taskId}/applications`)}
              style={styles.fullWidthButton}
            >
              Applications ({task.pending_applications_count || 0})
            </Button>
          </View>
        </Surface>
      ) : null}

      {/* Owner Actions - Pending Confirmation */}
      {canConfirm ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleDispute}
              loading={disputeMutation.isPending}
              disabled={confirmMutation.isPending || disputeMutation.isPending}
              textColor="#ef4444"
              style={[styles.actionButton, styles.cancelButton]}
            >
              Dispute
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmCompletion}
              loading={confirmMutation.isPending}
              disabled={confirmMutation.isPending || disputeMutation.isPending}
              style={[styles.actionButton, styles.confirmButton]}
            >
              Confirm Complete
            </Button>
          </View>
        </Surface>
      ) : null}

      {/* Worker Actions - Can Mark Done */}
      {canMarkDone ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={handleMarkDone}
            loading={markDoneMutation.isPending}
            disabled={markDoneMutation.isPending}
            style={styles.applyButton}
            contentStyle={styles.applyButtonContent}
          >
            Mark as Done
          </Button>
        </Surface>
      ) : null}
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
    marginBottom: 12,
    gap: 8,
  },
  // Custom badges instead of Chip
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  urgentBadgeText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '600',
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
  applicationsBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  applicationsBadgeText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '500',
  },
  // IMAGE GALLERY STYLES
  imageGalleryContainer: {
    backgroundColor: '#000000',
    marginTop: 12,
    position: 'relative',
  },
  imageScrollView: {
    width: SCREEN_WIDTH,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  appliedSection: {
    backgroundColor: '#dbeafe',
    padding: 16,
    marginTop: 12,
  },
  noticeSection: {
    backgroundColor: '#fef3c7',
    padding: 16,
    marginTop: 12,
  },
  completedSection: {
    backgroundColor: '#dcfce7',
    padding: 16,
    marginTop: 12,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  noticeText: {
    color: '#4b5563',
    lineHeight: 20,
  },
  reviewButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
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
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
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
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Custom Avatar with View
  creatorAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  helperAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helperAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    color: '#1f2937',
  },
  ownTaskBadge: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  ownTaskText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '500',
  },
  assignedBadge: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  assignedText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
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
  withdrawButton: {
    borderColor: '#fecaca',
  },
  ownerActions: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  fullWidthButton: {
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: '#fecaca',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  reviewPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  reviewPromptCard: {
    width: '100%',
    maxWidth: 400,
  },
  reviewPromptIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  reviewPromptTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  reviewPromptText: {
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewPromptHint: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
  reviewPromptActions: {
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
});
