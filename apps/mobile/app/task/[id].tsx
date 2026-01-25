import { View, ScrollView, StyleSheet, Alert, Linking, TouchableOpacity, Image, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, applyToTask, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask, withdrawApplication, useAuthStore, getImageUrl, getCategoryByKey } from '@marketplace/shared';
import { useState } from 'react';
import StarRating from '../../components/StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 200;
const ACCENT_COLOR = '#3B82F6';

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

const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined) => {
  switch (difficulty) {
    case 'easy': return { color: '#10b981', label: 'Easy' };
    case 'hard': return { color: '#ef4444', label: 'Hard' };
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply.');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!task?.user_application?.id) throw new Error('No application');
      return withdrawApplication(taskId, task.user_application.id);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed.');
    },
  });

  const markDoneMutation = useMutation({
    mutationFn: () => markTaskDone(taskId),
    onSuccess: () => {
      Alert.alert('Success', 'Task marked as done!');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmTaskCompletion(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setShowReviewPrompt(true);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed.');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () => disputeTask(taskId, 'Work not completed satisfactorily'),
    onSuccess: () => {
      Alert.alert('Disputed', 'Task has been disputed.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(taskId),
    onSuccess: () => {
      Alert.alert('Cancelled', 'Task has been cancelled.');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed.');
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${task?.title} - €${task?.budget || task?.reward || 0}\n${task?.description}`,
      });
    } catch (e) {}
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to apply.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    Alert.alert('Apply', 'Apply for this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Apply', onPress: () => applyMutation.mutate() },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Withdraw your application?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => withdrawMutation.mutate() },
    ]);
  };

  const handleMarkDone = () => {
    Alert.alert('Mark Done', 'Mark this task as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Done', onPress: () => markDoneMutation.mutate() },
    ]);
  };

  const handleConfirm = () => {
    Alert.alert('Confirm', 'Confirm task completion?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => confirmMutation.mutate() },
    ]);
  };

  const handleDispute = () => {
    Alert.alert('Dispute', 'Not satisfied with the work?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dispute', style: 'destructive', onPress: () => disputeMutation.mutate() },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Task', 'Cancel this task?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  const handleOpenMap = () => {
    if (task?.latitude && task?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${task.latitude},${task.longitude}`);
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to message.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (task?.creator_id) router.push(`/conversation/${task.creator_id}`);
  };

  const handleReport = () => {
    Alert.alert('Report', 'Report this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thanks.') },
    ]);
  };

  const handleViewProfile = () => {
    if (task?.creator_id) router.push(`/user/${task.creator_id}`);
  };

  // Computed
  const isOwnTask = user?.id === task?.creator_id;
  const isAssignedToMe = user?.id === task?.assigned_to_id;
  const hasApplied = task?.has_applied && task?.user_application?.status === 'pending';
  const canWithdraw = hasApplied;
  const canMarkDone = isAssignedToMe && (task?.status === 'assigned' || task?.status === 'in_progress');
  const canConfirm = isOwnTask && task?.status === 'pending_confirmation';
  
  // Show apply button if: task is open AND user is not the owner AND user hasn't applied yet
  const showApplyButton = task?.status === 'open' && !isOwnTask && !hasApplied;

  const categoryData = task ? getCategoryByKey(task.category) : null;
  const difficulty = getDifficultyIndicator(task?.difficulty);
  const timeAgo = formatTimeAgo(task?.created_at);
  const hasRating = (task?.creator_rating ?? 0) > 0;
  const applicantsCount = task?.pending_applications_count ?? 0;
  const distance = task?.distance;
  
  const taskImages = task?.images 
    ? task.images.split(',').filter(Boolean).map(url => getImageUrl(url))
    : [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Task Details' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

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

  if (showReviewPrompt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Completed' }} />
        <View style={styles.centered}>
          <Text style={styles.celebrateIcon}>🎉</Text>
          <Text style={styles.celebrateTitle}>Task Completed!</Text>
          <Text style={styles.celebrateText}>Leave a review?</Text>
          <View style={styles.celebrateButtons}>
            <Button onPress={() => setShowReviewPrompt(false)} textColor="#6b7280">Later</Button>
            <Button mode="contained" onPress={() => { setShowReviewPrompt(false); router.push(`/task/${taskId}/review`); }}>Review</Button>
          </View>
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
          headerRight: () => (
            <IconButton icon="share-variant" iconColor={ACCENT_COLOR} size={24} onPress={handleShare} />
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO CARD - Contains everything important */}
        <View style={styles.heroCard}>
          {/* ROW 1: Category + Urgent + Flag + Price */}
          <View style={styles.topRow}>
            <View style={styles.topRowLeft}>
              <Text style={styles.categoryText}>{categoryData?.icon || '📋'} {categoryData?.label || task.category}</Text>
              {task.is_urgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>🔥</Text>
                </View>
              )}
            </View>
            <View style={styles.topRowRight}>
              <TouchableOpacity onPress={handleReport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.flagIcon}>🚩</Text>
              </TouchableOpacity>
              <Text style={styles.price}>€{task.budget || task.reward || 0}</Text>
            </View>
          </View>

          {/* ROW 2: Title */}
          <Text style={styles.heroTitle}>{task.title}</Text>

          {/* ROW 3: POSTED BY - Now inside hero card */}
          <TouchableOpacity style={styles.userRow} onPress={handleViewProfile} activeOpacity={0.7}>
            {task.creator_avatar ? (
              <Image source={{ uri: getImageUrl(task.creator_avatar) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{task.creator_name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{task.creator_name || 'Anonymous'}</Text>
              {hasRating && <StarRating rating={task.creator_rating || 0} reviewCount={task.creator_review_count} size={12} showCount />}
              {task.creator_city && <Text style={styles.userCity}>📍 {task.creator_city}</Text>}
            </View>
            {!isOwnTask && (
              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
                <Text style={styles.messageBtnText}>💬</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* ROW 4: Stats - Below posted by */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{applicantsCount}</Text>
              <Text style={styles.statLabel}>APPLICANTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.difficultyRow}>
                <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
                <Text style={styles.statValue}>{difficulty.label}</Text>
              </View>
              <Text style={styles.statLabel}>DIFFICULTY</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeAgo || 'Now'}</Text>
              <Text style={styles.statLabel}>POSTED</Text>
            </View>
          </View>
        </View>

        {/* IMAGES */}
        {taskImages.length > 0 && (
          <View style={styles.imageCard}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {taskImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.taskImage} resizeMode="cover" />
              ))}
            </ScrollView>
            {taskImages.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>{taskImages.length} photos</Text>
              </View>
            )}
          </View>
        )}

        {/* DESCRIPTION + LOCATION - Combined into one card */}
        <View style={styles.sectionCard}>
          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>

          {/* Location - in same card */}
          {task.location && (
            <>
              <View style={styles.divider} />
              <View style={styles.locationHeader}>
                <Text style={styles.sectionTitle}>Location</Text>
                {distance !== undefined && distance !== null && (
                  <Text style={styles.distanceText}>{distance.toFixed(1)} km away</Text>
                )}
              </View>
              <Text style={styles.locationAddress}>{task.location}</Text>
              {task.latitude && task.longitude && (
                <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap}>
                  <Text style={styles.mapBtnText}>🗺️ Open in Maps</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* NOTICES */}
        {hasApplied && (
          <View style={[styles.noticeCard, styles.noticeInfo]}>
            <Text style={styles.noticeText}>✅ You have applied for this task</Text>
          </View>
        )}
        {task.status === 'pending_confirmation' && isOwnTask && (
          <View style={[styles.noticeCard, styles.noticeWarning]}>
            <Text style={styles.noticeText}>⏳ {task.assigned_to_name} marked this as done</Text>
          </View>
        )}
        {isAssignedToMe && (task.status === 'assigned' || task.status === 'in_progress') && (
          <View style={[styles.noticeCard, styles.noticeSuccess]}>
            <Text style={styles.noticeText}>🎯 You are assigned to this task</Text>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM BAR - ALWAYS VISIBLE */}
      <View style={styles.bottomBar}>
        {/* APPLY BUTTON - for anyone who can apply */}
        {showApplyButton && (
          <Button 
            mode="contained" 
            onPress={handleApply} 
            loading={applyMutation.isPending} 
            style={styles.primaryBtn} 
            contentStyle={styles.btnContent} 
            labelStyle={styles.btnLabel}
          >
            Apply Now
          </Button>
        )}

        {/* WITHDRAW */}
        {canWithdraw && (
          <Button 
            mode="outlined" 
            onPress={handleWithdraw} 
            loading={withdrawMutation.isPending} 
            textColor="#ef4444" 
            style={[styles.primaryBtn, styles.dangerBtn]} 
            contentStyle={styles.btnContent}
          >
            Withdraw Application
          </Button>
        )}

        {/* OWNER ACTIONS */}
        {isOwnTask && task.status === 'open' && (
          <View style={styles.ownerActions}>
            <Button 
              mode="contained" 
              onPress={() => router.push(`/task/${taskId}/applications`)} 
              style={styles.primaryBtn} 
              contentStyle={styles.btnContent} 
              labelStyle={styles.btnLabel}
            >
              View Applications ({applicantsCount})
            </Button>
            <View style={styles.ownerBtnRow}>
              <Button mode="outlined" onPress={handleCancel} textColor="#ef4444" style={[styles.halfBtn, styles.dangerBtn]}>Cancel</Button>
              <Button mode="outlined" onPress={() => router.push(`/task/${taskId}/edit`)} style={styles.halfBtn}>Edit</Button>
            </View>
          </View>
        )}

        {/* CONFIRM/DISPUTE */}
        {canConfirm && (
          <View style={styles.ownerBtnRow}>
            <Button mode="outlined" onPress={handleDispute} textColor="#ef4444" style={[styles.halfBtn, styles.dangerBtn]} loading={disputeMutation.isPending}>Dispute</Button>
            <Button mode="contained" onPress={handleConfirm} style={[styles.halfBtn, styles.successBtn]} loading={confirmMutation.isPending}>Confirm Done</Button>
          </View>
        )}

        {/* MARK DONE */}
        {canMarkDone && (
          <Button 
            mode="contained" 
            onPress={handleMarkDone} 
            loading={markDoneMutation.isPending} 
            style={[styles.primaryBtn, styles.successBtn]} 
            contentStyle={styles.btnContent} 
            labelStyle={styles.btnLabel}
          >
            Mark as Done
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 120 },

  // Hero Card - Now contains Posted By + Stats
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // TOP ROW
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
    gap: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
  },
  flagIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: ACCENT_COLOR,
  },
  
  // Title
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 26,
  },

  // User Row - Now inside hero card
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT_COLOR, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 10, gap: 2 },
  userName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  userCity: { fontSize: 12, color: '#6b7280' },
  messageBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT_COLOR, justifyContent: 'center', alignItems: 'center' },
  messageBtnText: { fontSize: 18 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 9, color: '#9ca3af', marginTop: 2, fontWeight: '600', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 24, backgroundColor: '#e5e7eb' },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4 },

  // Image Card
  imageCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative' },
  taskImage: { width: SCREEN_WIDTH - 24, height: IMAGE_HEIGHT },
  imageCounter: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  imageCounterText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  // Section Card - Now contains Description + Location
  sectionCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#9ca3af', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  descriptionText: { fontSize: 15, color: '#1f2937', lineHeight: 22 },

  // Divider between description and location
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },

  // Location
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  distanceText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },
  locationAddress: { fontSize: 14, color: '#1f2937', marginBottom: 10 },
  mapBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  mapBtnText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },

  // Notices
  noticeCard: { borderRadius: 10, padding: 12, marginBottom: 10 },
  noticeInfo: { backgroundColor: '#dbeafe' },
  noticeWarning: { backgroundColor: '#fef3c7' },
  noticeSuccess: { backgroundColor: '#dcfce7' },
  noticeText: { fontSize: 13, fontWeight: '500', color: '#1f2937', textAlign: 'center' },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 12, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  primaryBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  dangerBtn: { borderColor: '#fecaca' },
  successBtn: { backgroundColor: '#10b981' },
  ownerActions: { gap: 8 },
  ownerBtnRow: { flexDirection: 'row', gap: 8 },
  halfBtn: { flex: 1, borderRadius: 12 },

  // Celebrate
  celebrateIcon: { fontSize: 64, marginBottom: 16 },
  celebrateTitle: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  celebrateText: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  celebrateButtons: { flexDirection: 'row', gap: 12 },
});
