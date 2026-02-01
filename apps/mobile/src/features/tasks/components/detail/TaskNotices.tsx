import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, useAuthStore } from '@marketplace/shared';
import { styles } from '../../styles/taskDetailStyles';
import { useTranslation } from '../../../../hooks/useTranslation';

interface TaskNoticesProps {
  task: Task;
}

export function TaskNotices({ task }: TaskNoticesProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const isOwnTask = user?.id === task.creator_id;
  const hasApplied = task.has_applied && task.user_application?.status === 'pending';

  // Helper to replace {{name}} placeholder with actual name
  const formatWorkerDoneMessage = () => {
    const template = t.task?.notices?.workerMarkedDone || '{{name}} marked this as done. Please review and confirm.';
    return template.replace('{{name}}', task.assigned_to_name || 'Worker');
  };

  return (
    <>
      {/* Applied notice - for applicants who applied but aren't assigned yet */}
      {hasApplied && !task.assigned_to_id && (
        <View style={[styles.noticeCard, styles.noticeInfo]}>
          <Text style={styles.noticeText}>✅ {t.task?.notices?.youHaveApplied || 'You have applied for this task'}</Text>
        </View>
      )}

      {/* Pending confirmation notice - for creator when worker marked as done */}
      {task.status === 'pending_confirmation' && isOwnTask && (
        <View style={[styles.noticeCard, styles.noticeWarning]}>
          <Text style={styles.noticeText}>
            ⏳ {formatWorkerDoneMessage()}
          </Text>
        </View>
      )}
    </>
  );
}
