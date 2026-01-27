import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { type Task, getCategoryByKey } from '@marketplace/shared';
import { formatPostedDate, getDifficultyIndicator } from '../utils/formatters';
import { getMarkerColor } from '../constants';
import { colors } from '../../../../src/theme';

interface FocusedTaskCardProps {
  task: Task;
  distanceKm: string | null;
  onViewDetails: (id: number) => void;
  themeColors: typeof colors.light;
}

/**
 * Memoized Focused Task Card
 * Shows detailed view when a task is selected
 */
const FocusedTaskCardComponent: React.FC<FocusedTaskCardProps> = ({
  task,
  distanceKm,
  onViewDetails,
  themeColors,
}) => {
  const categoryData = getCategoryByKey(task.category);
  const categoryColor = getMarkerColor(task.category);
  const applicantsCount = task.pending_applications_count ?? 0;
  const difficulty = getDifficultyIndicator(task.difficulty);
  const city = task.location?.split(',')[0]?.trim() || task.creator_city || '';

  const styles = createStyles(themeColors);

  return (
    <View style={styles.focusedCard}>
      <View style={styles.focusedTopRow}>
        <View style={[styles.focusedCategoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.focusedCategoryIcon}>{categoryData?.icon || '📋'}</Text>
          <Text style={styles.focusedCategoryText}>
            {categoryData?.label || task.category}
          </Text>
        </View>
        <Text style={[styles.focusedPrice, { color: categoryColor }]}>
          €{task.budget?.toFixed(0) || '0'}
        </Text>
      </View>

      <Text style={styles.focusedTitle} numberOfLines={2}>
        {task.title}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <Text style={styles.statValue}>{distanceKm ? `${distanceKm}km` : '—'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>POSTED</Text>
          <Text style={styles.statValue}>{formatPostedDate(task.created_at!)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>APPLICANTS</Text>
          <Text style={styles.statValue}>{applicantsCount}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Icon name="person" size={16} color="#3b82f6" />
          <Text style={styles.infoText} numberOfLines={1}>{task.creator_name || 'Anon'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="place" size={16} color="#ef4444" />
          <Text style={styles.infoText} numberOfLines={1}>{city || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
          <Text style={styles.infoText}>{difficulty.label}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.viewButton, { backgroundColor: categoryColor }]}
        onPress={() => onViewDetails(task.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewButtonText}>View and apply</Text>
        <Icon name="arrow-forward" size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

// Custom comparison - only re-render if task ID changes
const areEqual = (prev: FocusedTaskCardProps, next: FocusedTaskCardProps): boolean => {
  return (
    prev.task.id === next.task.id &&
    prev.distanceKm === next.distanceKm
  );
};

export const FocusedTaskCard = memo(FocusedTaskCardComponent, areEqual);

const createStyles = (themeColors: typeof colors.light) => StyleSheet.create({
  focusedCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  focusedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusedCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  focusedCategoryIcon: {
    fontSize: 14,
  },
  focusedCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  focusedPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  focusedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 16,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    backgroundColor: themeColors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: themeColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.text,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: themeColors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: themeColors.textSecondary,
    fontWeight: '500',
    maxWidth: 90,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
