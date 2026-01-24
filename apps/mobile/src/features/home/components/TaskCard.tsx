import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task, getCategoryByKey } from '@marketplace/shared';
import { calculateDistance, formatTimeAgo, getMarkerColor } from '../constants';

interface TaskCardProps {
  task: Task;
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
  onPress: (task: Task) => void;
  styles: any;
}

export const TaskCard = memo(function TaskCard({ 
  task, 
  userLocation, 
  hasRealLocation, 
  onPress, 
  styles 
}: TaskCardProps) {
  const categoryData = getCategoryByKey(task.category);
  const distance = hasRealLocation && task.latitude && task.longitude
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        task.latitude,
        task.longitude
      )
    : null;

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.jobCardLeft}>
        <View style={[styles.jobCategoryDot, { backgroundColor: getMarkerColor(task.category) }]} />
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
});
