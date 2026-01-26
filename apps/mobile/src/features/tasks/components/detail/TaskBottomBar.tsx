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

// Statuses where disputes are allowed
// Workers can dispute from 'assigned' onwards (creator might ghost after accepting)
// Creators can only dispute from 'in_progress' onwards (work has started)
const WORKER_DISPUTABLE_STATUSES = ['assigned', 'in_progress', 'completed', 'pending_confirmation'];
const CREATOR_DISPUTABLE_STATUSES = ['in_progress', 'completed', 'pending_confirmation'];

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
  
  // Can report problem based on role and status
  // Workers can report from 'assigned' (creator might ghost after accepting them)
  // Creators can report from 'in_progress' (work has started)
  const canWorkerReport = isAssignedToMe && WORKER_DISPUTABLE_STATUSES.includes(task.status);
  const canCreatorReport = isOwnTask && CREATOR_DISPUTABLE_STATUSES.includes(task.status);
  const canReport = canWorkerReport || canCreatorReport;

  // Navigate to dispute form
  const handleReportProblem = () => {
    router.push(`/task/${taskId}/dispute`);
  };

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

      {/* CONFIRM/DISPUTE - Owner confirming completion */}
      {canConfirm && (
        <View style={styles.ownerBtnRow}>
          <Button 
            mode="outlined" 
            onPress={handleReportProblem} 
            textColor="#ef4444" 
            style={[styles.halfBtn, styles.dangerBtn]}
          >
            Report Problem
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

      {/* MARK DONE - Worker marking task complete */}
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
          {/* Worker can also report problem while working */}
          {canWorkerReport && (
            <Button 
              mode="text" 
              onPress={handleReportProblem} 
              textColor="#ef4444"
              style={{ marginTop: 8 }}
            >
              Report a Problem
            </Button>
          )}
        </View>
      )}

      {/* REPORT PROBLEM - For owner when task is in_progress (not yet submitted for completion) */}
      {isOwnTask && task.status === 'in_progress' && !canConfirm && (
        <Button 
          mode="outlined" 
          onPress={handleReportProblem} 
          textColor="#ef4444" 
          style={[styles.primaryBtn, styles.dangerBtn]} 
          contentStyle={styles.btnContent}
        >
          Report a Problem
        </Button>
      )}

      {/* DISPUTED STATUS MESSAGE */}
      {task.status === 'disputed' && (
        <View style={styles.disputedNotice}>
          <Button 
            mode="contained" 
            disabled
            style={[styles.primaryBtn, { backgroundColor: '#f59e0b' }]} 
            contentStyle={styles.btnContent}
          >
            ⚠️ Task Under Review
          </Button>
        </View>
      )}
    </View>
  );
}
