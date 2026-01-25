import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, getCategoryByKey, getImageUrl } from '@marketplace/shared';
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

export function TaskHeroCard({ 
  task, 
  isOwnTask, 
  onMessage, 
  onReport, 
  onViewProfile 
}: TaskHeroCardProps) {
  const categoryData = getCategoryByKey(task.category);
  const difficulty = getDifficultyIndicator(task.difficulty);
  const timeAgo = formatTimeAgo(task.created_at);
  const hasRating = (task.creator_rating ?? 0) > 0;
  const applicantsCount = task.pending_applications_count ?? 0;

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
