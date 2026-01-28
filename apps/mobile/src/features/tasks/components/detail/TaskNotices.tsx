import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, useAuthStore } from '@marketplace/shared';
import { styles } from '../../styles/taskDetailStyles';

interface TaskNoticesProps {
  task: Task;
}

export function TaskNotices({ task }: TaskNoticesProps) {
  const { user } = useAuthStore();
  
  const isOwnTask = user?.id === task.creator_id;
  const hasApplied = task.has_applied && task.user_application?.status === 'pending';

  return (
    <>
      {/* Applied notice - for applicants who applied but aren't assigned yet */}
      {hasApplied && !task.assigned_to_id && (
        <View style={[styles.noticeCard, styles.noticeInfo]}>
          <Text style={styles.noticeText}>✅ You have applied for this task</Text>
        </View>
      )}

      {/* Pending confirmation notice - for creator when worker marked as done */}
      {task.status === 'pending_confirmation' && isOwnTask && (
        <View style={[styles.noticeCard, styles.noticeWarning]}>
          <Text style={styles.noticeText}>
            ⏳ {task.assigned_to_name || 'Worker'} marked this as done. Please review and confirm.
          </Text>
        </View>
      )}
    </>
  );
}
