import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import type { Task } from '@marketplace/shared';
import { getMarkerColor } from '../utils/constants';
import { calculateDistance, formatTimeAgo } from '../utils/distance';
import { styles } from '../styles';

interface FocusedJobProps {
  task: Task;
  userLocation: { latitude: number; longitude: number } | null;
  onViewDetails: (id: number) => void;
}

export const FocusedJob: React.FC<FocusedJobProps> = ({ task, userLocation, onViewDetails }) => {
  return (
    <View style={styles.focusedJobContainer}>
      <View style={styles.focusedJobHeader}>
        <View style={[styles.focusedCategoryBadge, { backgroundColor: getMarkerColor(task.category) }]}>
          <Text style={styles.focusedCategoryText}>{task.category.toUpperCase()}</Text>
        </View>
        {userLocation && task.latitude && task.longitude && (
          <Text style={styles.focusedDistance}>
            📍 {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              task.latitude,
              task.longitude
            ).toFixed(1)} km away
          </Text>
        )}
      </View>
      
      <Text style={styles.focusedTitle}>{task.title}</Text>
      
      <View style={styles.focusedBudgetRow}>
        <Text style={styles.focusedBudget}>€{task.budget?.toFixed(0) || '0'}</Text>
        <Text style={styles.focusedMeta}>{formatTimeAgo(task.created_at!)}</Text>
      </View>
      
      {task.description && (
        <View style={styles.focusedSection}>
          <Text style={styles.focusedSectionTitle}>Description</Text>
          <Text style={styles.focusedDescription} numberOfLines={3}>{task.description}</Text>
        </View>
      )}
      
      {task.location && (
        <View style={styles.focusedSection}>
          <Text style={styles.focusedSectionTitle}>Location</Text>
          <Text style={styles.focusedLocation} numberOfLines={2}>📍 {task.location}</Text>
        </View>
      )}
      
      <Button
        mode="contained"
        onPress={() => onViewDetails(task.id)}
        style={styles.viewDetailsButton}
        icon="arrow-right"
      >
        View Full Details
      </Button>
    </View>
  );
};
