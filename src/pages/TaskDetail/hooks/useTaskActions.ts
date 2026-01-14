import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { markTaskDone, confirmTaskCompletion, cancelTask, disputeTask, acceptApplication, rejectApplication } from '../../../api/tasks';
import { startConversation } from '../../../api/messages';
import { taskKeys } from '../../../api/hooks';
import { useToastStore } from '../../../stores/toastStore';
import { Task } from '../../../api/tasks';
import { Offering } from '../../../api/offerings';

interface UseTaskActionsProps {
  taskId: number;
  task: Task | undefined;
  refetchTask: () => void;
  fetchApplications: () => void;
  isAuthenticated: boolean;
}

export const useTaskActions = ({
  taskId,
  task,
  refetchTask,
  fetchApplications,
  isAuthenticated,
}: UseTaskActionsProps) => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const queryClient = useQueryClient();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);

  // Helper to invalidate all task-related caches
  const invalidateTaskCaches = async () => {
    // Invalidate ALL task details (all languages) to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: taskKeys.details() });
    // Also invalidate task lists so "My Jobs" shows correct status
    await queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };

  const handleMarkDone = async () => {
    try {
      setActionLoading(true);
      await markTaskDone(taskId);
      toast.success('Task marked as done! Waiting for creator confirmation.');
      await invalidateTaskCaches();
      refetchTask();
    } catch (error: any) {
      console.error('Error marking task done:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark task as done');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDone = async () => {
    // Double-check status before making the request
    if (task?.status !== 'pending_confirmation') {
      toast.error('Task is not pending confirmation');
      await invalidateTaskCaches();
      refetchTask();
      return;
    }

    try {
      setActionLoading(true);
      await confirmTaskCompletion(taskId);
      toast.success('Task completed! You can now leave a review.');
      
      // Invalidate ALL task caches and refetch
      await invalidateTaskCaches();
      await refetchTask();
    } catch (error: any) {
      console.error('Error confirming task:', error);
      toast.error(error?.response?.data?.error || 'Failed to confirm task');
      // Refetch to get correct state even on error
      await invalidateTaskCaches();
      refetchTask();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt('Please provide a reason for the dispute:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await disputeTask(taskId, reason);
      toast.warning('Task has been disputed. Please resolve with the worker.');
      await invalidateTaskCaches();
      refetchTask();
    } catch (error: any) {
      console.error('Error disputing task:', error);
      toast.error(error?.response?.data?.error || 'Failed to dispute task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;

    try {
      setActionLoading(true);
      await cancelTask(taskId);
      toast.success('Task cancelled.');
      await invalidateTaskCaches();
      refetchTask();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error?.response?.data?.error || 'Failed to cancel task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      setAcceptingId(applicationId);
      await acceptApplication(taskId, applicationId);
      toast.success('🎉 Application accepted! The task has been assigned.');
      await invalidateTaskCaches();
      refetchTask();
      fetchApplications();
    } catch (error: any) {
      console.error('Error accepting application:', error);
      toast.error(error?.response?.data?.error || 'Failed to accept application');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;

    try {
      setRejectingId(applicationId);
      await rejectApplication(taskId, applicationId);
      toast.success('Application rejected');
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error?.response?.data?.error || 'Failed to reject application');
    } finally {
      setRejectingId(null);
    }
  };

  const handleMessageCreator = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to send messages');
      navigate('/login');
      return;
    }
    if (!task?.creator_id) return;

    try {
      setMessageLoading(true);
      const { conversation } = await startConversation(task.creator_id, undefined, task.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleMessageApplicant = async (applicantId: number) => {
    if (!isAuthenticated) return;

    try {
      const { conversation } = await startConversation(applicantId, undefined, task?.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    }
  };

  const handleContactHelper = async (helper: Offering) => {
    if (!isAuthenticated) {
      toast.warning('Please login to contact helpers');
      navigate('/login');
      return;
    }

    try {
      const { conversation } = await startConversation(
        helper.creator_id, 
        `Hi! I saw your "${helper.title}" offering and I have a job that might interest you: "${task?.title}"`,
        task?.id
      );
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error contacting helper:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    }
  };

  return {
    actionLoading,
    acceptingId,
    rejectingId,
    messageLoading,
    handleMarkDone,
    handleConfirmDone,
    handleDispute,
    handleCancel,
    handleAcceptApplication,
    handleRejectApplication,
    handleMessageCreator,
    handleMessageApplicant,
    handleContactHelper,
  };
};
