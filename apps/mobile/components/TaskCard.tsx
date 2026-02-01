import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Task } from '@marketplace/shared';
import { getImageUrl, useAuthStore } from '@marketplace/shared';
import StarRating from './StarRating';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';
import { useCategories } from '../src/hooks/useCategories';
import { useTranslation } from '../src/hooks/useTranslation';

const JOB_COLOR = '#3B82F6'; // Blue for jobs

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
}

// Helper to format time ago with translations
const formatTimeAgo = (dateString: string | undefined, timeT: any): string => {
  if (!dateString) return '';
  
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return timeT?.justNow || 'Just now';
  if (diffMins < 60) return timeT?.minutesAgo?.replace('{{count}}', String(diffMins)) || `${diffMins}m ago`;
  if (diffHours < 24) return timeT?.hoursAgo?.replace('{{count}}', String(diffHours)) || `${diffHours}h ago`;
  if (diffDays < 7) return timeT?.daysAgo?.replace('{{count}}', String(diffDays)) || `${diffDays}d ago`;
  return past.toLocaleDateString();
};

// Helper to extract just the city name from location string
const extractCity = (location: string | undefined): string => {
  if (!location) return '';
  
  const parts = location.split(',').map(p => p.trim());
  
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0];
  
  if (parts.length >= 3) {
    if (parts[1].match(/^\d+$/)) {
      return parts[2];
    }
    return parts[1];
  }
  
  return parts[0];
};

// Helper to format location display (distance + city)
const formatLocationDisplay = (task: Task): string => {
  const hasDistance = task.distance !== undefined && task.distance !== null;
  const city = extractCity(task.location);
  
  if (hasDistance && city) {
    return `${task.distance.toFixed(1)} km, ${city}`;
  } else if (hasDistance) {
    return `${task.distance.toFixed(1)} km`;
  } else if (city) {
    return city;
  }
  
  return '';
};

// Helper to get status badge info
const getStatusBadge = (
  task: Task, 
  userId: number | undefined,
  tasksT: any
): { text: string; color: string; bgColor: string } | null => {
  const isMyTask = task.creator_id === userId;
  const isAssignedToMe = task.assigned_to_id === userId;
  const applicantsCount = task.pending_applications_count ?? 0;

  // Disputed - highest priority (check both status and dispute_status field)
  if (task.status === 'disputed' || (task as any).dispute_status === 'open') {
    return {
      text: `⚠️ ${tasksT.status?.disputed || 'Disputed'}`,
      color: '#fff',
      bgColor: '#f59e0b', // Orange
    };
  }

  // For task creators (job givers)
  if (isMyTask) {
    // Action needed: Worker marked done, needs confirmation
    if (task.status === 'pending_confirmation') {
      return {
        text: tasksT.actionNeeded || 'Action needed',
        color: '#fff',
        bgColor: '#ef4444', // Red
      };
    }
    
    // New applicants
    if (task.status === 'open' && applicantsCount > 0) {
      const label = applicantsCount > 1 
        ? (tasksT.applicantsLabel || 'applicants')
        : (tasksT.applicantLabel || 'applicant');
      return {
        text: `${applicantsCount} ${label}`,
        color: '#fff',
        bgColor: '#3b82f6', // Blue
      };
    }
    
    // Worker assigned
    if (task.status === 'assigned' || task.status === 'in_progress') {
      return {
        text: tasksT.status?.assigned || 'Assigned',
        color: '#fff',
        bgColor: '#10b981', // Green
      };
    }
  }

  // For workers (helpers)
  if (isAssignedToMe) {
    // Waiting for confirmation
    if (task.status === 'pending_confirmation') {
      return {
        text: tasksT.waiting || 'Waiting',
        color: '#fff',
        bgColor: '#f59e0b', // Yellow
      };
    }
    
    // In progress
    if (task.status === 'in_progress') {
      return {
        text: tasksT.status?.in_progress || 'In Progress',
        color: '#fff',
        bgColor: '#10b981', // Green
      };
    }
    
    // Assigned
    if (task.status === 'assigned') {
      return {
        text: tasksT.status?.assigned || 'Assigned',
        color: '#fff',
        bgColor: '#3b82f6', // Blue
      };
    }
  }

  // Completed
  if (task.status === 'completed') {
    return {
      text: tasksT.status?.completed || 'Completed',
      color: '#fff',
      bgColor: '#6b7280', // Gray
    };
  }

  // User has applied (but not assigned yet)
  if ((task as any).has_applied) {
    return {
      text: tasksT.applied || 'Applied',
      color: '#fff',
      bgColor: '#8b5cf6', // Purple
    };
  }

  return null;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const { t } = useTranslation();
  const { getCategoryLabel, getCategoryIcon } = useCategories();
  const { getActiveTheme } = useThemeStore();
  const { user } = useAuthStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  // Get translations for tasks
  const tasksT = t.tasks || {};
  
  // Get translated difficulty
  const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined): { color: string; label: string } => {
    const difficultyT = tasksT.difficulty || {};
    switch (difficulty) {
      case 'easy': return { color: '#10b981', label: difficultyT.easy || 'Easy' };
      case 'hard': return { color: '#ef4444', label: difficultyT.hard || 'Hard' };
      case 'medium':
      default: return { color: '#f59e0b', label: difficultyT.medium || 'Medium' };
    }
  };
  
  const difficulty = getDifficultyIndicator(task.difficulty);
  const timeAgo = formatTimeAgo(task.created_at, tasksT.time);
  const hasApplicants = (task.pending_applications_count ?? 0) > 0;
  const hasRating = (task.creator_rating ?? 0) > 0;
  const categoryLabel = getCategoryLabel(task.category);
  const categoryIcon = getCategoryIcon(task.category);
  const locationDisplay = formatLocationDisplay(task);
  const statusBadge = getStatusBadge(task, user?.id, tasksT);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(task);
    } else {
      router.push(`/task/${task.id}`);
    }
  }, [task, onPress]);

  const styles = StyleSheet.create({
    card: { 
      marginBottom: 12, 
      backgroundColor: themeColors.card,
      borderRadius: 12,
      // Blue left border accent for jobs
      borderLeftWidth: 4,
      borderLeftColor: JOB_COLOR,
      // Subtle shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: activeTheme === 'dark' ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    cardContent: {
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    
    // Row 1: Category + Status Badge + Price
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    category: {
      fontSize: 13,
      fontWeight: '500',
      color: themeColors.textSecondary,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      marginHorizontal: 8,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    price: {
      fontSize: 18,
      fontWeight: '700',
      color: JOB_COLOR,
    },
    
    // Row 2: Title
    title: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
    },
    
    // Row 3: Creator Info
    row3: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      flexWrap: 'wrap',
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 6,
    },
    avatarPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: JOB_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 6,
    },
    avatarText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
    creatorName: {
      fontSize: 13,
      fontWeight: '500',
      color: themeColors.text,
      maxWidth: 100,
    },
    dot: {
      fontSize: 13,
      color: themeColors.border,
      marginHorizontal: 6,
    },
    creatorCity: {
      fontSize: 13,
      color: themeColors.textSecondary,
      maxWidth: 80,
    },
    
    // Row 4: Description
    description: {
      color: themeColors.textSecondary,
      lineHeight: 18,
      marginBottom: 10,
    },
    
    // Row 5: Meta Info
    row5: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: 12,
      color: themeColors.textMuted,
    },
    metaDot: {
      fontSize: 12,
      color: themeColors.border,
      marginHorizontal: 6,
    },
    difficultyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    difficultyDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    difficultyText: {
      fontSize: 12,
      color: themeColors.textSecondary,
      fontWeight: '500',
    },
  });

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        {/* Row 1: Category + Status Badge (middle) + Price */}
        <View style={styles.row1}>
          <Text style={styles.category}>
            {categoryIcon} {categoryLabel}
          </Text>
          {statusBadge && (
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          )}
          <Text style={styles.price}>€{task.budget?.toFixed(0) || task.reward?.toFixed(0) || '0'}</Text>
        </View>
        
        {/* Row 2: Title */}
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {task.title}
        </Text>
        
        {/* Row 3: Creator with Avatar + Name + City + Rating */}
        <View style={styles.row3}>
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
          <Text style={styles.creatorName} numberOfLines={1}>
            {task.creator_name || 'Anonymous'}
          </Text>
          {task.creator_city && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.creatorCity} numberOfLines={1}>{task.creator_city}</Text>
            </>
          )}
          {hasRating && (
            <>
              <Text style={styles.dot}>•</Text>
              <StarRating 
                rating={task.creator_rating || 0} 
                reviewCount={task.creator_review_count}
                size={12}
                showCount={true}
              />
            </>
          )}
        </View>
        
        {/* Row 4: Description Preview */}
        {task.description && (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        {/* Row 5: Location (distance + city) + Time + Applicants + Difficulty */}
        <View style={styles.row5}>
          {locationDisplay && (
            <>
              <Text style={styles.metaText}>📍 {locationDisplay}</Text>
              <Text style={styles.metaDot}>•</Text>
            </>
          )}
          
          {timeAgo && (
            <>
              <Text style={styles.metaText}>{timeAgo}</Text>
              <Text style={styles.metaDot}>•</Text>
            </>
          )}
          
          {hasApplicants && (
            <>
              <Text style={styles.metaText}>
                👤 {task.pending_applications_count}
              </Text>
              <Text style={styles.metaDot}>•</Text>
            </>
          )}
          
          <View style={styles.difficultyBadge}>
            <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
            <Text style={styles.difficultyText}>{difficulty.label}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// Memoize with custom comparison - added dispute_status to dependencies
export default memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    (prevProps.task as any).dispute_status === (nextProps.task as any).dispute_status &&
    prevProps.task.pending_applications_count === nextProps.task.pending_applications_count &&
    (prevProps.task as any).has_applied === (nextProps.task as any).has_applied &&
    prevProps.onPress === nextProps.onPress
  );
});
