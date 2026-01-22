import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import type { Task } from '@marketplace/shared';
import { getMarkerColor } from '../utils/constants';
import { calculateDistance, formatTimeAgo } from '../utils/distance';
import { styles } from '../styles';

interface JobCardProps {
  task: Task;
  userLocation: { latitude: number; longitude: number } | null;
  onPress: (task: Task) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ task, userLocation, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.jobLeft}>
        <View style={[styles.jobCategoryDot, { backgroundColor: getMarkerColor(task.category) }]} />
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.jobMeta}>
            {task.category} • {formatTimeAgo(task.created_at!)}
          </Text>
        </View>
      </View>
      <View style={styles.jobRight}>
        <Text style={styles.jobPrice}>€{task.budget?.toFixed(0) || '0'}</Text>
        {userLocation && task.latitude && task.longitude && (
          <Text style={styles.jobDistance}>
            {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              task.latitude,
              task.longitude
            ).toFixed(1)} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
