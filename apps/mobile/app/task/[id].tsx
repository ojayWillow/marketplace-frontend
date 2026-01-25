import { View, ScrollView, StyleSheet, Alert, Linking, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, applyToTask, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask, withdrawApplication, useAuthStore, getImageUrl, getCategoryByKey, type Task } from '@marketplace/shared';
import { useState } from 'react';
import StarRating from '../../components/StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 200;

// Helper to format time ago
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

// Helper to get difficulty indicator
const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined): { color: string; label: string } => {
  switch (difficulty) {
    case 'easy': return { color: '#10b981', label: 'Easy' };
    case 'hard': return { color: '#ef4444', label: 'Hard' };
    case 'medium':
    default: return { color: '#f59e0b', label: 'Medium' };
  }
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToTask(taskId),
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
      if (!task?.user_application?.id) throw new Error('No application to withdraw');
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
      Alert.alert('Success', 'Task marked as done! Waiting for confirmation.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark task as done.');
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm completion.');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () => disputeTask(taskId, 'Work not completed satisfactorily'),
    onSuccess: () => {
      Alert.alert('Disputed', 'Task has been disputed. Please contact support.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to dispute task.');
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel task.');
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to apply for tasks.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    Alert.alert('Apply for Task', 'Would you like to apply for this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Apply', onPress: () => applyMutation.mutate() },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw Application', 'Are you sure you want to withdraw?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => withdrawMutation.mutate() },
    ]);
  };

  const handleMarkDone = () => {
    Alert.alert('Mark as Done', 'Mark this task as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Done', onPress: () => markDoneMutation.mutate() },
    ]);
  };

  const handleConfirm = () => {
    Alert.alert('Confirm Completion', 'Confirm that this task has been completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => confirmMutation.mutate() },
    ]);
  };

  const handleDispute = () => {
    Alert.alert('Dispute Task', 'Are you not satisfied with the work?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dispute', style: 'destructive', onPress: () => disputeMutation.mutate() },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Task', 'Are you sure you want to cancel this task?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  const handleOpenMap = () => {
    if (task?.latitude && task?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${task.latitude},${task.longitude}`);
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to send messages.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (task?.creator_id) {
      router.push(`/conversation/${task.creator_id}`);
    }
  };

  const handleReport = () => {
    Alert.alert('Report Task', 'Report this task for inappropriate content?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => {
        // TODO: Implement report API
        Alert.alert('Reported', 'Thank you for your report. We will review it.');
      }},
    ]);
  };

  const handleViewProfile = () => {
    if (task?.creator_id) {
      router.push(`/user/${task.creator_id}`);
    }
  };

  const handleLeaveReview = () => {
    setShowReviewPrompt(false);
    router.push(`/task/${taskId}/review`);
  };

  // Computed values
  const isOwnTask = user?.id === task?.creator_id;
  const isAssignedToMe = user?.id === task?.assigned_to_id;
  const canApply = isAuthenticated && !isOwnTask && task?.status === 'open' && !task?.has_applied;
  const hasApplied = task?.has_applied && task?.user_application?.status === 'pending';
  const canWithdraw = hasApplied;
  const canMarkDone = isAssignedToMe && (task?.status === 'assigned' || task?.status === 'in_progress');
  const canConfirm = isOwnTask && task?.status === 'pending_confirmation';
  const canCancel = isOwnTask && task?.status === 'open';

  const categoryData = task ? getCategoryByKey(task.category) : null;
  const difficulty = getDifficultyIndicator(task?.difficulty);
  const timeAgo = formatTimeAgo(task?.created_at);
  const hasRating = (task?.creator_rating ?? 0) > 0;
  
  const taskImages = task?.images 
    ? task.images.split(',').filter(Boolean).map(url => getImageUrl(url))
    : [];

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Task not found</Text>
          <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  // Review prompt
  if (showReviewPrompt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Completed' }} />
        <View style={styles.centered}>
          <Text style={styles.reviewIcon}>🎉</Text>
          <Text style={styles.reviewTitle}>Task Completed!</Text>
          <Text style={styles.reviewText}>Would you like to leave a review?</Text>
          <View style={styles.reviewButtons}>
            <Button onPress={() => setShowReviewPrompt(false)} textColor="#6b7280">Maybe Later</Button>
            <Button mode="contained" onPress={handleLeaveReview}>Leave Review</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Task Details', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Row 1: Category + Urgent + Flag + Price */}
        <View style={styles.topRow}>
          <View style={styles.topRowLeft}>
            <Text style={styles.category}>
              {categoryData?.icon || '📋'} {categoryData?.label || task.category}
            </Text>
            {task.is_urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>🔥 Urgent</Text>
              </View>
            )}
          </View>
          <View style={styles.topRowRight}>
            <TouchableOpacity onPress={handleReport} style={styles.flagButton}>
              <Text style={styles.flagIcon}>🚩</Text>
            </TouchableOpacity>
            <Text style={styles.price}>€{task.budget || task.reward || 0}</Text>
          </View>
        </View>

        {/* Row 2: Title */}
        <Text style={styles.title}>{task.title}</Text>

        {/* Row 3: User Section - Avatar | Name/Rating/City | Message */}
        <TouchableOpacity style={styles.userSection} onPress={handleViewProfile} activeOpacity={0.7}>
          <View style={styles.userLeft}>
            {task.creator_avatar ? (
              <Image source={{ uri: getImageUrl(task.creator_avatar) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{task.creator_name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{task.creator_name || 'Anonymous'}</Text>
              {hasRating && (
                <StarRating 
                  rating={task.creator_rating || 0} 
                  reviewCount={task.creator_review_count}
                  size={12}
                  showCount={true}
                />
              )}
              {task.creator_city && (
                <Text style={styles.userCity}>📍 {task.creator_city}</Text>
              )}
            </View>
          </View>
          {!isOwnTask && (
            <TouchableOpacity onPress={handleMessage} style={styles.messageButton}>
              <Text style={styles.messageIcon}>💬</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Row 4: Description */}
        <Text style={styles.description}>{task.description}</Text>

        {/* Row 5: Location + Map button */}
        {task.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {task.location}</Text>
            {task.latitude && task.longitude && (
              <TouchableOpacity onPress={handleOpenMap} style={styles.mapLink}>
                <Text style={styles.mapLinkText}>Open Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Row 6: Meta - Applicants + Difficulty + Time */}
        <View style={styles.metaRow}>
          {(task.pending_applications_count ?? 0) > 0 && (
            <>
              <Text style={styles.metaText}>👤 {task.pending_applications_count} applied</Text>
              <Text style={styles.metaDot}>•</Text>
            </>
          )}
          <View style={styles.difficultyBadge}>
            <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
            <Text style={styles.difficultyText}>{difficulty.label}</Text>
          </View>
          {timeAgo && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{timeAgo}</Text>
            </>
          )}
        </View>

        {/* Images (if any) */}
        {taskImages.length > 0 && (
          <View style={styles.imageSection}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {taskImages.map((imageUrl, index) => (
                <Image key={index} source={{ uri: imageUrl }} style={styles.taskImage} resizeMode="cover" />
              ))}
            </ScrollView>
            {taskImages.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>{taskImages.length} photos</Text>
              </View>
            )}
          </View>
        )}

        {/* Status notices */}
        {hasApplied && (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeText}>✅ You have applied for this task</Text>
          </View>
        )}

        {task.status === 'pending_confirmation' && isOwnTask && (
          <View style={[styles.noticeBanner, styles.warningBanner]}>
            <Text style={styles.noticeText}>⏳ {task.assigned_to_name} marked this as done. Please confirm.</Text>
          </View>
        )}

        {isAssignedToMe && (task.status === 'assigned' || task.status === 'in_progress') && (
          <View style={[styles.noticeBanner, styles.successBanner]}>
            <Text style={styles.noticeText}>🎯 You are assigned to this task</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <Surface style={styles.bottomBar} elevation={4}>
        {/* Apply button */}
        {canApply && (
          <Button
            mode="contained"
            onPress={handleApply}
            loading={applyMutation.isPending}
            disabled={applyMutation.isPending}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Apply for this Task
          </Button>
        )}

        {/* Withdraw button */}
        {canWithdraw && (
          <Button
            mode="outlined"
            onPress={handleWithdraw}
            loading={withdrawMutation.isPending}
            textColor="#ef4444"
            style={[styles.actionButton, styles.withdrawButton]}
            contentStyle={styles.actionButtonContent}
          >
            Withdraw Application
          </Button>
        )}

        {/* Owner actions - Open status */}
        {isOwnTask && task.status === 'open' && (
          <View style={styles.ownerActions}>
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                loading={cancelMutation.isPending}
                textColor="#ef4444"
                style={[styles.flexButton, styles.cancelButton]}
              >
                Cancel
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push(`/task/${taskId}/edit`)}
                style={styles.flexButton}
              >
                Edit
              </Button>
            </View>
            <Button
              mode="contained"
              onPress={() => router.push(`/task/${taskId}/applications`)}
              style={styles.actionButton}
            >
              View Applications ({task.pending_applications_count || 0})
            </Button>
          </View>
        )}

        {/* Owner actions - Pending confirmation */}
        {canConfirm && (
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleDispute}
              loading={disputeMutation.isPending}
              textColor="#ef4444"
              style={[styles.flexButton, styles.cancelButton]}
            >
              Dispute
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={confirmMutation.isPending}
              style={[styles.flexButton, styles.confirmButton]}
            >
              Confirm Done
            </Button>
          </View>
        )}

        {/* Worker actions - Can mark done */}
        {canMarkDone && (
          <Button
            mode="contained"
            onPress={handleMarkDone}
            loading={markDoneMutation.isPending}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Mark as Done
          </Button>
        )}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Row 1: Category + Urgent + Flag + Price
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  flagButton: {
    padding: 4,
  },
  flagIcon: {
    fontSize: 18,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },

  // Row 2: Title
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },

  // Row 3: User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userCity: {
    fontSize: 13,
    color: '#6b7280',
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: 20,
  },

  // Row 4: Description
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Row 5: Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  mapLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  mapLinkText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },

  // Row 6: Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  metaDot: {
    fontSize: 13,
    color: '#d1d5db',
    marginHorizontal: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Images
  imageSection: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  taskImage: {
    width: SCREEN_WIDTH - 32,
    height: IMAGE_HEIGHT,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Notice banners
  noticeBanner: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
  },
  successBanner: {
    backgroundColor: '#dcfce7',
  },
  noticeText: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 6,
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
  flexButton: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: '#fecaca',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },

  // Review prompt
  reviewIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
