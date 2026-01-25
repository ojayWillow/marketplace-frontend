import { useState, useCallback } from 'react';
import { Alert, Share, Linking } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  applyToTask, 
  markTaskDone, 
  confirmTaskCompletion, 
  cancelTask, 
  disputeTask, 
  withdrawApplication,
  useAuthStore,
  type Task 
} from '@marketplace/shared';

export interface TaskActionsReturn {
  // State
  showReviewPrompt: boolean;
  setShowReviewPrompt: (show: boolean) => void;
  
  // Mutation loading states
  isApplying: boolean;
  isWithdrawing: boolean;
  isMarkingDone: boolean;
  isConfirming: boolean;
  isDisputing: boolean;
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
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // ============ MUTATIONS ============

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

  // ============ HANDLERS ============

  const handleShare = useCallback(async () => {
    if (!task) return;
    try {
      await Share.share({
        message: `${task.title} - €${task.budget || task.reward || 0}\n${task.description}`,
      });
    } catch (e) {
      // Silently fail
    }
  }, [task]);

  const handleApply = useCallback(() => {
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
  }, [isAuthenticated, applyMutation]);

  const handleWithdraw = useCallback(() => {
    Alert.alert('Withdraw', 'Withdraw your application?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => withdrawMutation.mutate() },
    ]);
  }, [withdrawMutation]);

  const handleMarkDone = useCallback(() => {
    Alert.alert('Mark Done', 'Mark this task as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Done', onPress: () => markDoneMutation.mutate() },
    ]);
  }, [markDoneMutation]);

  const handleConfirm = useCallback(() => {
    Alert.alert('Confirm', 'Confirm task completion?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => confirmMutation.mutate() },
    ]);
  }, [confirmMutation]);

  const handleDispute = useCallback(() => {
    Alert.alert('Dispute', 'Not satisfied with the work?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dispute', style: 'destructive', onPress: () => disputeMutation.mutate() },
    ]);
  }, [disputeMutation]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancel Task', 'Cancel this task?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  }, [cancelMutation]);

  const handleOpenMap = useCallback(() => {
    if (task?.latitude && task?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${task.latitude},${task.longitude}`);
    }
  }, [task]);

  const handleMessage = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to message.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (task?.creator_id) {
      router.push(`/conversation/${task.creator_id}`);
    }
  }, [isAuthenticated, task]);

  const handleReport = useCallback(() => {
    Alert.alert('Report', 'Report this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thanks.') },
    ]);
  }, []);

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
    isDisputing: disputeMutation.isPending,
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
