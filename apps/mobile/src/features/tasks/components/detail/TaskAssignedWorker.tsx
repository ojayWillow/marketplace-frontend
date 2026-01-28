import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Task } from '@marketplace/shared';
import { getImageUrl, useAuthStore } from '@marketplace/shared';

interface TaskAssignedWorkerProps {
  task: Task;
}

/**
 * Shows who is assigned/working on the task
 * Provides context-aware status and guidance for both creator and worker
 */
export const TaskAssignedWorker = ({ task }: TaskAssignedWorkerProps) => {
  const { user } = useAuthStore();
  
  // Only show if task has someone assigned
  if (!task.assigned_to_id) return null;
  
  const isCreator = task.creator_id === user?.id;
  const isWorker = task.assigned_to_id === user?.id;
  
  // Get status info with role-specific messaging
  const getStatusInfo = () => {
    const workerName = task.assigned_to_name || 'Helper';
    
    switch (task.status) {
      case 'assigned':
        return {
          label: 'Assigned',
          color: '#2563eb',
          bgColor: '#dbeafe',
          icon: '🎯',
          creatorMsg: `${workerName} has been assigned`,
          creatorSubtext: 'Waiting for them to start working',
          workerMsg: 'You are assigned to this task',
          workerSubtext: 'Start working when ready',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '🔨',
          creatorMsg: `${workerName} is working on this`,
          creatorSubtext: 'Task is being completed',
          workerMsg: 'You are working on this',
          workerSubtext: 'Mark as done when complete',
        };
      case 'pending_confirmation':
        return {
          label: 'Awaiting Your Review',
          color: '#16a34a',
          bgColor: '#dcfce7',
          icon: '✅',
          creatorMsg: `${workerName} marked this as done`,
          creatorSubtext: 'Review and confirm completion',
          workerMsg: 'Waiting for confirmation',
          workerSubtext: 'Creator will review your work',
        };
      case 'completed':
        return {
          label: 'Completed',
          color: '#16a34a',
          bgColor: '#dcfce7',
          icon: '🎉',
          creatorMsg: `Completed by ${workerName}`,
          creatorSubtext: 'Task finished successfully',
          workerMsg: 'Task completed!',
          workerSubtext: 'Great job!',
        };
      default:
        return {
          label: 'Assigned',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          icon: '👤',
          creatorMsg: `Assigned to ${workerName}`,
          creatorSubtext: '',
          workerMsg: 'You are assigned',
          workerSubtext: '',
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Pick the right message based on user role
  const getMessage = () => {
    if (isWorker) {
      return { main: statusInfo.workerMsg, sub: statusInfo.workerSubtext };
    } else if (isCreator) {
      return { main: statusInfo.creatorMsg, sub: statusInfo.creatorSubtext };
    } else {
      return { main: 'Someone is working on this', sub: '' };
    }
  };
  
  const message = getMessage();
  
  const handleViewProfile = () => {
    if (task.assigned_to_id) {
      router.push(`/user/${task.assigned_to_id}`);
    }
  };
  
  const handleMessage = () => {
    if (task.assigned_to_id) {
      const workerName = task.assigned_to_name || 'Helper';
      router.push({
        pathname: '/conversation/new',
        params: {
          userId: task.assigned_to_id.toString(),
          username: workerName,
        },
      });
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: statusInfo.color }]}>
      {/* Status header */}
      <View style={[styles.statusHeader, { backgroundColor: statusInfo.bgColor }]}>
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.icon} {statusInfo.label}
        </Text>
      </View>
      
      {/* Content row */}
      <View style={styles.contentRow}>
        <View style={styles.infoSection}>
          {/* For worker: just show the message */}
          {isWorker ? (
            <>
              <Text style={styles.mainMessage}>{message.main}</Text>
              {message.sub ? <Text style={styles.subMessage}>{message.sub}</Text> : null}
            </>
          ) : isCreator ? (
            /* For creator: show worker profile */
            <>
              <TouchableOpacity onPress={handleViewProfile} style={styles.workerProfile}>
                {task.assigned_user_avatar ? (
                  <Image 
                    source={{ uri: getImageUrl(task.assigned_user_avatar) }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {task.assigned_to_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.workerTextContainer}>
                  <Text style={styles.workerName}>{task.assigned_to_name || 'Helper'}</Text>
                  {message.sub ? <Text style={styles.subMessage}>{message.sub}</Text> : null}
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.mainMessage}>{message.main}</Text>
          )}
        </View>
        
        {/* Message button - for creator to contact worker */}
        {isCreator && task.status !== 'completed' && (
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Text style={styles.messageBtnText}>💬</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  
  statusHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  infoSection: {
    flex: 1,
  },
  
  mainMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subMessage: {
    fontSize: 13,
    color: '#6b7280',
  },
  
  workerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  
  workerTextContainer: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  
  messageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  messageBtnText: {
    fontSize: 20,
  },
});
