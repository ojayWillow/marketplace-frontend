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
 * Visible to creators when task has an assigned worker
 * Visible to workers showing they are assigned
 */
export const TaskAssignedWorker = ({ task }: TaskAssignedWorkerProps) => {
  const { user } = useAuthStore();
  
  // Only show if task has someone assigned
  if (!task.assigned_to_id) return null;
  
  const isCreator = task.creator_id === user?.id;
  const isWorker = task.assigned_to_id === user?.id;
  
  // Get status label and color based on task status
  const getStatusInfo = () => {
    switch (task.status) {
      case 'assigned':
        return { label: 'Assigned', color: '#2563eb', bgColor: '#dbeafe', icon: '🎯' };
      case 'in_progress':
        return { label: 'In Progress', color: '#f59e0b', bgColor: '#fef3c7', icon: '🔨' };
      case 'pending_confirmation':
        return { label: 'Awaiting Confirmation', color: '#16a34a', bgColor: '#dcfce7', icon: '✅' };
      case 'completed':
        return { label: 'Completed', color: '#16a34a', bgColor: '#dcfce7', icon: '🎉' };
      default:
        return { label: 'Assigned', color: '#6b7280', bgColor: '#f3f4f6', icon: '👤' };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  const handleViewProfile = () => {
    if (task.assigned_to_id) {
      // Use /user/[id] route for viewing profiles
      router.push(`/user/${task.assigned_to_id}`);
    }
  };
  
  const handleMessage = () => {
    if (task.assigned_to_id) {
      // Use /conversation/new with userId and username params to start/open conversation
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
      
      {/* Worker info row */}
      <View style={styles.workerRow}>
        {/* For creator: show "Being done by [worker]" */}
        {/* For worker: show "You are assigned" */}
        <View style={styles.workerInfo}>
          {isWorker ? (
            <>
              <Text style={styles.roleLabel}>🛠️ You are working on this</Text>
              <Text style={styles.roleSubtext}>Complete the task and mark it done</Text>
            </>
          ) : isCreator ? (
            <>
              <Text style={styles.roleLabel}>👷 Being done by</Text>
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
                <Text style={styles.workerName}>{task.assigned_to_name || 'Helper'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.roleLabel}>Someone is working on this</Text>
          )}
        </View>
        
        {/* Message button - for creator to contact worker */}
        {isCreator && (
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
  
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  workerInfo: {
    flex: 1,
  },
  
  roleLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  roleSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  workerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  
  messageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBtnText: {
    fontSize: 20,
  },
});
