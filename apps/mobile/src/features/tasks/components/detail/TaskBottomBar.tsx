import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { type Task, useAuthStore } from '@marketplace/shared';
import { styles } from '../../styles/taskDetailStyles';
import { type TaskActionsReturn } from '../../hooks/useTaskActions';

interface TaskBottomBarProps {
  task: Task;
  taskId: number;
  actions: TaskActionsReturn;
}

export function TaskBottomBar({ task, taskId, actions }: TaskBottomBarProps) {
  const { user } = useAuthStore();
  
  const isOwnTask = user?.id === task.creator_id;
  const isAssignedToMe = user?.id === task.assigned_to_id;
  const hasApplied = task.has_applied && task.user_application?.status === 'pending';
  const applicantsCount = task.pending_applications_count ?? 0;
  
  // Computed flags
  const canWithdraw = hasApplied;
  const canMarkDone = isAssignedToMe && (task.status === 'assigned' || task.status === 'in_progress');
  const canConfirm = isOwnTask && task.status === 'pending_confirmation';
  const showApplyButton = task.status === 'open' && !isOwnTask && !hasApplied;
  
  // Worker can report issue when assigned or in progress (not disputed yet)
  const canWorkerReportIssue = isAssignedToMe && 
    (task.status === 'assigned' || task.status === 'in_progress') && 
    task.status !== 'disputed';

  return (
    <View style={styles.bottomBar}>
      {/* APPLY BUTTON - for anyone who can apply */}
      {showApplyButton && (
        <Button 
          mode="contained" 
          onPress={actions.handleApply} 
          loading={actions.isApplying} 
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
          onPress={actions.handleWithdraw} 
          loading={actions.isWithdrawing} 
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
            <Button 
              mode="outlined" 
              onPress={actions.handleCancel} 
              textColor="#ef4444" 
              style={[styles.halfBtn, styles.dangerBtn]}
            >
              Cancel
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => router.push(`/task/${taskId}/edit`)} 
              style={styles.halfBtn}
            >
              Edit
            </Button>
          </View>
        </View>
      )}

      {/* CONFIRM/DISPUTE - for job giver when pending confirmation */}
      {canConfirm && (
        <View style={styles.ownerBtnRow}>
          <Button 
            mode="outlined" 
            onPress={actions.handleDispute} 
            textColor="#ef4444" 
            style={[styles.halfBtn, styles.dangerBtn]}
          >
            Dispute
          </Button>
          <Button 
            mode="contained" 
            onPress={actions.handleConfirm} 
            style={[styles.halfBtn, styles.successBtn]} 
            loading={actions.isConfirming}
          >
            Confirm Done
          </Button>
        </View>
      )}

      {/* WORKER ACTIONS - Mark Done + Report Issue */}
      {canMarkDone && (
        <View style={styles.ownerActions}>
          <Button 
            mode="contained" 
            onPress={actions.handleMarkDone} 
            loading={actions.isMarkingDone} 
            style={[styles.primaryBtn, styles.successBtn]} 
            contentStyle={styles.btnContent} 
            labelStyle={styles.btnLabel}
          >
            Mark as Done
          </Button>
          {canWorkerReportIssue && (
            <Button 
              mode="outlined" 
              onPress={actions.handleDispute} 
              textColor="#ef4444" 
              style={[styles.primaryBtn, styles.dangerBtn]}
            >
              Report Issue
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
