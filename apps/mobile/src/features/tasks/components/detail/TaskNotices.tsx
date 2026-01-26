import { View, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { type Task, useAuthStore } from '@marketplace/shared';
import { styles } from '../../styles/taskDetailStyles';
import { StyleSheet } from 'react-native';

const SUPPORT_EMAIL = 'support@tirgus.lv';

interface TaskNoticesProps {
  task: Task;
}

export function TaskNotices({ task }: TaskNoticesProps) {
  const { user } = useAuthStore();
  
  const isOwnTask = user?.id === task.creator_id;
  const isAssignedToMe = user?.id === task.assigned_to_id;
  const hasApplied = task.has_applied && task.user_application?.status === 'pending';

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Dispute Help - Task #${task.id}`);
  };

  const handleViewDispute = () => {
    router.push(`/task/${task.id}/dispute`);
  };

  return (
    <>
      {/* Disputed notice - show prominently for both parties */}
      {task.status === 'disputed' && (
        <View style={[styles.noticeCard, localStyles.disputeNotice]}>
          <Text style={localStyles.disputeIcon}>⚠️</Text>
          <Text style={localStyles.disputeTitle}>Task Under Review</Text>
          <Text style={localStyles.disputeText}>
            {isOwnTask 
              ? 'A problem has been reported with this task. The worker has filed a dispute that needs your attention.'
              : isAssignedToMe
                ? 'Your report has been submitted. The task creator has been notified and can respond.'
                : 'This task is currently under dispute review.'
            }
          </Text>
          
          <View style={localStyles.disputeActions}>
            <TouchableOpacity 
              style={localStyles.disputeButton}
              onPress={handleViewDispute}
            >
              <Text style={localStyles.disputeButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[localStyles.disputeButton, localStyles.disputeButtonOutline]}
              onPress={handleContactSupport}
            >
              <Text style={[localStyles.disputeButtonText, localStyles.disputeButtonTextOutline]}>
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Applied notice */}
      {hasApplied && (
        <View style={[styles.noticeCard, styles.noticeInfo]}>
          <Text style={styles.noticeText}>✅ You have applied for this task</Text>
        </View>
      )}

      {/* Pending confirmation notice */}
      {task.status === 'pending_confirmation' && isOwnTask && (
        <View style={[styles.noticeCard, styles.noticeWarning]}>
          <Text style={styles.noticeText}>
            ⏳ {task.assigned_to_name} marked this as done
          </Text>
        </View>
      )}

      {/* Assigned to me notice */}
      {isAssignedToMe && (task.status === 'assigned' || task.status === 'in_progress') && (
        <View style={[styles.noticeCard, styles.noticeSuccess]}>
          <Text style={styles.noticeText}>🎯 You are assigned to this task</Text>
        </View>
      )}
    </>
  );
}

const localStyles = StyleSheet.create({
  disputeNotice: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  disputeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  disputeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  disputeText: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  disputeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  disputeButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disputeButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  disputeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disputeButtonTextOutline: {
    color: '#dc2626',
  },
});
