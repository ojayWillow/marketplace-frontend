import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, getCategoryByKey } from '@marketplace/shared';
import { formatTimeAgo } from '../utils/formatters';
import { getMarkerColor, JOB_COLOR } from '../constants';
import { colors } from '../../../../src/theme';

interface TaskCardProps {
  task: Task;
  distance: number | null;
  onPress: (task: Task) => void;
  themeColors: typeof colors.light;
}

/**
 * Memoized Task Card for FlatList
 * Only re-renders when task data or distance changes
 */
const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  distance,
  onPress,
  themeColors,
}) => {
  const categoryData = getCategoryByKey(task.category);
  const categoryColor = getMarkerColor(task.category);

  const styles = createStyles(themeColors);

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.jobCardLeft}>
        <View style={[styles.jobCategoryDot, { backgroundColor: categoryColor }]} />
        <View style={styles.jobCardContent}>
          <View style={styles.jobCardRow1}>
            <Text style={styles.jobCardCategory}>
              {categoryData?.icon || '📋'} {categoryData?.label || task.category}
            </Text>
            <Text style={styles.jobCardDot}>•</Text>
            <Text style={styles.jobCardTime}>{formatTimeAgo(task.created_at!)}</Text>
          </View>
          <Text style={styles.jobCardTitle} numberOfLines={1}>
            {task.title}
          </Text>
        </View>
      </View>

      <View style={styles.jobCardRight}>
        <Text style={styles.jobCardPrice}>€{task.budget?.toFixed(0) || '0'}</Text>
        {distance !== null && (
          <Text style={styles.jobCardDistance}>{distance.toFixed(1)} km</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Custom comparison function for memo
// Only re-render if these specific props change
const areEqual = (prevProps: TaskCardProps, nextProps: TaskCardProps): boolean => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.budget === nextProps.task.budget &&
    prevProps.task.category === nextProps.task.category &&
    prevProps.distance === nextProps.distance
  );
};

export const TaskCard = memo(TaskCardComponent, areEqual);

const createStyles = (themeColors: typeof colors.light) => StyleSheet.create({
  jobCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    backgroundColor: themeColors.card,
  },
  jobCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  jobCardContent: {
    flex: 1,
  },
  jobCardRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobCardCategory: {
    fontSize: 13,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  jobCardDot: {
    fontSize: 13,
    color: themeColors.border,
    marginHorizontal: 6,
  },
  jobCardTime: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
  jobCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.text,
  },
  jobCardRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  jobCardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: JOB_COLOR,
  },
  jobCardDistance: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginTop: 2,
  },
});
