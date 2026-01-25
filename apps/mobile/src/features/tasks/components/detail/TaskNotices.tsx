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
  const isAssignedToMe = user?.id === task.assigned_to_id;
  const hasApplied = task.has_applied && task.user_application?.status === 'pending';

  return (
    <>
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
