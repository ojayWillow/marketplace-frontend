import { useState, useCallback } from 'react';
import { Alert, Share, Linking } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  applyToTask, 
  markTaskDone, 
  confirmTaskCompletion, 
  cancelTask, 
  withdrawApplication,
  useAuthStore,
  type Task 
} from '@marketplace/shared';
import { useTranslation } from '../../../hooks/useTranslation';

export interface TaskActionsReturn {
  // State
  showReviewPrompt: boolean;
  setShowReviewPrompt: (show: boolean) => void;
  
  // Mutation loading states
  isApplying: boolean;
  isWithdrawing: boolean;
  isMarkingDone: boolean;
  isConfirming: boolean;
  isCancelling: boolean;
  
  // Handlers
  handleApply: () => void;
  handleWithdraw: () => void;
  handleMarkDone: () => void;
  handleConfirm: () => void;
  handleDispute: () => void;
  handleCancel: () => void;
  handleShare: () => Promise<void>;
  handleMessage: () => void;
  handleReport: () => void;
  handleOpenMap: () => void;
  handleViewProfile: () => void;
}

export function useTaskActions(taskId: number, task: Task | undefined): TaskActionsReturn {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // ============ MUTATIONS ============

  const applyMutation = useMutation({
    mutationFn: () => applyToTask(taskId),
    onSuccess: () => {
      Alert.alert(t.task.alerts.applySuccess, t.task.alerts.applySuccessMessage);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: any) => {
      Alert.alert(t.task.alerts.error, error.response?.data?.message || 'Failed to apply.');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!task?.user_application?.id) throw new Error('No application');
      return withdrawApplication(taskId, task.user_application.id);
    },
    onSuccess: () => {
      Alert.alert(t.task.alerts.withdrawSuccess, t.task.alerts.withdrawSuccessMessage);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: any) => {
      Alert.alert(t.task.alerts.error, error.response?.data?.message || 'Failed.');
    },
  });

  const markDoneMutation = useMutation({
    mutationFn: () => markTaskDone(taskId),
    onSuccess: () => {
      Alert.alert(t.task.alerts.markDoneSuccess, t.task.alerts.markDoneSuccessMessage);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      Alert.alert(t.task.alerts.error, error.response?.data?.message || 'Failed.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmTaskCompletion(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setShowReviewPrompt(true);
    },
    onError: (error: any) => {
      Alert.alert(t.task.alerts.error, error.response?.data?.message || 'Failed.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(taskId),
    onSuccess: () => {
      Alert.alert(t.task.alerts.cancelSuccess, t.task.alerts.cancelSuccessMessage);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      // Invalidate map and search queries to remove cancelled task from map
      queryClient.invalidateQueries({ queryKey: ['tasks-home-all'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-search'] });
    },
    onError: (error: any) => {
      Alert.alert(t.task.alerts.error, error.response?.data?.message || 'Failed.');
    },
  });

  // ============ HANDLERS ============

  const handleShare = useCallback(async () => {
    if (!task) return;
    try {
      await Share.share({
        message: `${task.title} - \u20ac${task.budget || task.reward || 0}\n${task.description}`,
      });
    } catch (e) {
      // Silently fail
    }
  }, [task]);

  const handleApply = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(t.task.alerts.signInRequired, t.task.alerts.signInToApply, [
        { text: t.task.alerts.cancelButton, style: 'cancel' },
        { text: t.task.alerts.signInButton, onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    Alert.alert(t.task.alerts.applyTitle, t.task.alerts.applyMessage, [
      { text: t.task.alerts.cancelButton, style: 'cancel' },
      { text: t.task.alerts.applyButton, onPress: () => applyMutation.mutate() },
    ]);
  }, [isAuthenticated, applyMutation, t]);

  const handleWithdraw = useCallback(() => {
    Alert.alert(t.task.alerts.withdrawTitle, t.task.alerts.withdrawMessage, [
      { text: t.task.alerts.cancelButton, style: 'cancel' },
      { text: t.task.alerts.withdrawButton, style: 'destructive', onPress: () => withdrawMutation.mutate() },
    ]);
  }, [withdrawMutation, t]);

  const handleMarkDone = useCallback(() => {
    Alert.alert(t.task.alerts.markDoneTitle, t.task.alerts.markDoneMessage, [
      { text: t.task.alerts.cancelButton, style: 'cancel' },
      { text: t.task.alerts.markDoneButton, onPress: () => markDoneMutation.mutate() },
    ]);
  }, [markDoneMutation, t]);

  const handleConfirm = useCallback(() => {
    Alert.alert(t.task.alerts.confirmTitle, t.task.alerts.confirmMessage, [
      { text: t.task.alerts.cancelButton, style: 'cancel' },
      { text: t.task.alerts.confirmButton, onPress: () => confirmMutation.mutate() },
    ]);
  }, [confirmMutation, t]);

  const handleDispute = useCallback(() => {
    // Navigate to dispute creation screen instead of old simple dispute
    router.push(`/task/${taskId}/dispute`);
  }, [taskId]);

  const handleCancel = useCallback(() => {
    Alert.alert(t.task.alerts.cancelTitle, t.task.alerts.cancelMessage, [
      { text: t.task.alerts.cancelNo, style: 'cancel' },
      { text: t.task.alerts.cancelYes, style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  }, [cancelMutation, t]);

  const handleOpenMap = useCallback(() => {
    if (task?.latitude && task?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${task.latitude},${task.longitude}`);
    }
  }, [task]);

  const handleMessage = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(t.task.alerts.signInRequired, t.task.alerts.signInToMessage, [
        { text: t.task.alerts.cancelButton, style: 'cancel' },
        { text: t.task.alerts.signInButton, onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (task?.creator_id) {
      // Use 'new' as the conversation ID with userId param
      // This tells the conversation screen to find/create a conversation with this user
      const creatorName = task.creator?.username || task.creator?.first_name || 'User';
      router.push({
        pathname: '/conversation/new',
        params: { 
          userId: task.creator_id.toString(),
          username: creatorName
        }
      });
    }
  }, [isAuthenticated, task, t]);

  const handleReport = useCallback(() => {
    Alert.alert(t.task.alerts.reportTitle, t.task.alerts.reportMessage, [
      { text: t.task.alerts.cancelButton, style: 'cancel' },
      { text: t.task.alerts.reportButton, style: 'destructive', onPress: () => Alert.alert(t.task.alerts.reportedTitle, t.task.alerts.reportedMessage) },
    ]);
  }, [t]);

  const handleViewProfile = useCallback(() => {
    if (task?.creator_id) {
      router.push(`/user/${task.creator_id}`);
    }
  }, [task]);

  return {
    // State
    showReviewPrompt,
    setShowReviewPrompt,
    
    // Loading states
    isApplying: applyMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isMarkingDone: markDoneMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
    
    // Handlers
    handleApply,
    handleWithdraw,
    handleMarkDone,
    handleConfirm,
    handleDispute,
    handleCancel,
    handleShare,
    handleMessage,
    handleReport,
    handleOpenMap,
    handleViewProfile,
  };
}
