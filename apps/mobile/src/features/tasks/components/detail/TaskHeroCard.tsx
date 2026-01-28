import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, getCategoryByKey, getImageUrl, useAuthStore } from '@marketplace/shared';
import StarRating from '../../../../../components/StarRating';
import { styles, ACCENT_COLOR } from '../../styles/taskDetailStyles';
import { formatTimeAgo, getDifficultyIndicator } from '../../utils/taskHelpers';

interface TaskHeroCardProps {
  task: Task;
  isOwnTask: boolean;
  onMessage: () => void;
  onReport: () => void;
  onViewProfile: () => void;
}

/**
 * Get compact status info for the current user
 */
function getStatusBadge(task: Task, userId?: number): { text: string; color: string; bgColor: string } | null {
  if (!userId) return null;
  
  const isCreator = task.creator_id === userId;
  const isWorker = task.assigned_user_id === userId;
  const isApplicant = task.user_application_status === 'pending';
  
  // Skip for terminal states
  if (task.status === 'completed' || task.status === 'cancelled' || task.status === 'disputed') {
    return null;
  }
  
  // Creator view
  if (isCreator) {
    if (task.status === 'open' && (task.pending_applications_count ?? 0) > 0) {
      return { text: '👀 Review Applicants', color: '#9333ea', bgColor: '#f3e8ff' };
    }
    if (task.status === 'open') {
      return { text: '⏳ Awaiting Applicants', color: '#6b7280', bgColor: '#f3f4f6' };
    }
    if (task.status === 'assigned' || task.status === 'in_progress') {
      return { text: '🔨 In Progress', color: '#2563eb', bgColor: '#dbeafe' };
    }
    if (task.status === 'pending_confirmation') {
      return { text: '✅ Review & Confirm', color: '#16a34a', bgColor: '#dcfce7' };
    }
    return null;
  }
  
  // Worker view
  if (isWorker) {
    if (task.status === 'assigned') {
      return { text: '🎯 Start Working', color: '#2563eb', bgColor: '#dbeafe' };
    }
    if (task.status === 'in_progress') {
      return { text: '🔨 Mark Complete', color: '#f59e0b', bgColor: '#fef3c7' };
    }
    if (task.status === 'pending_confirmation') {
      return { text: '⏳ Awaiting Confirmation', color: '#6b7280', bgColor: '#f3f4f6' };
    }
    return null;
  }
  
  // Applicant view
  if (isApplicant) {
    return { text: '📩 Application Pending', color: '#9333ea', bgColor: '#f3e8ff' };
  }
  
  return null;
}

export function TaskHeroCard({ 
  task, 
  isOwnTask, 
  onMessage, 
  onReport, 
  onViewProfile 
}: TaskHeroCardProps) {
  const { user } = useAuthStore();
  const categoryData = getCategoryByKey(task.category);
  const difficulty = getDifficultyIndicator(task.difficulty);
  const timeAgo = formatTimeAgo(task.created_at);
  const hasRating = (task.creator_rating ?? 0) > 0;
  const applicantsCount = task.pending_applications_count ?? 0;
  
  // Get status badge for current user
  const statusBadge = getStatusBadge(task, user?.id);

  return (
    <View style={styles.heroCard}>
      {/* ROW 1: Category + Urgent + Flag + Price */}
      <View style={styles.topRow}>
        <View style={styles.topRowLeft}>
          <Text style={styles.categoryText}>
            {categoryData?.icon || '📋'} {categoryData?.label || task.category}
          </Text>
          {task.is_urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>🔥</Text>
            </View>
          )}
        </View>
        <View style={styles.topRowRight}>
          <TouchableOpacity 
            onPress={onReport} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.flagIcon}>🚩</Text>
          </TouchableOpacity>
          <Text style={styles.price}>€{task.budget || task.reward || 0}</Text>
        </View>
      </View>

      {/* ROW 1.5: Status Badge (only for involved users) */}
      {statusBadge && (
        <View style={[badgeStyles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
          <Text style={[badgeStyles.statusText, { color: statusBadge.color }]}>
            {statusBadge.text}
          </Text>
        </View>
      )}

      {/* ROW 2: Title */}
      <Text style={styles.heroTitle}>{task.title}</Text>

      {/* ROW 3: POSTED BY */}
      <TouchableOpacity 
        style={styles.userRow} 
        onPress={onViewProfile} 
        activeOpacity={0.7}
      >
        {task.creator_avatar ? (
          <Image 
            source={{ uri: getImageUrl(task.creator_avatar) }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {task.creator_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{task.creator_name || 'Anonymous'}</Text>
          {hasRating && (
            <StarRating 
              rating={task.creator_rating || 0} 
              reviewCount={task.creator_review_count} 
              size={12} 
              showCount 
            />
          )}
          {task.creator_city && (
            <Text style={styles.userCity}>📍 {task.creator_city}</Text>
          )}
        </View>
        {!isOwnTask && (
          <TouchableOpacity style={styles.messageBtn} onPress={onMessage}>
            <Text style={styles.messageBtnText}>💬</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* ROW 4: Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{applicantsCount}</Text>
          <Text style={styles.statLabel}>APPLICANTS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.difficultyRow}>
            <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
            <Text style={styles.statValue}>{difficulty.label}</Text>
          </View>
          <Text style={styles.statLabel}>DIFFICULTY</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{timeAgo || 'Now'}</Text>
          <Text style={styles.statLabel}>POSTED</Text>
        </View>
      </View>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
