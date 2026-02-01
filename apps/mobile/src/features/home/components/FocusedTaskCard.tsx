import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task } from '@marketplace/shared';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { calculateDistance, formatPostedDate, getMarkerColor } from '../constants';
import { useCategories } from '../../../hooks/useCategories';
import { useTranslation } from '../../../hooks/useTranslation';

interface FocusedTaskCardProps {
  task: Task;
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
  onViewDetails: (id: number) => void;
  styles: any;
}

export const FocusedTaskCard = memo(function FocusedTaskCard({ 
  task, 
  userLocation, 
  hasRealLocation, 
  onViewDetails, 
  styles 
}: FocusedTaskCardProps) {
  const { t } = useTranslation();
  const { getCategoryLabel, getCategoryIcon } = useCategories();
  
  const categoryColor = getMarkerColor(task.category);
  const applicantsCount = task.pending_applications_count ?? 0;
  
  // Get translated difficulty
  const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined): { color: string; label: string } => {
    switch (difficulty) {
      case 'easy': return { color: '#10b981', label: t.difficulty?.easy || 'Easy' };
      case 'hard': return { color: '#ef4444', label: t.difficulty?.hard || 'Hard' };
      case 'medium':
      default: return { color: '#f59e0b', label: t.difficulty?.medium || 'Medium' };
    }
  };
  
  const difficulty = getDifficultyIndicator(task.difficulty);

  const distanceKm = hasRealLocation && task.latitude && task.longitude
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        task.latitude,
        task.longitude
      ).toFixed(0)
    : null;
  
  const city = task.location?.split(',')[0]?.trim() || task.creator_city || '';
  
  return (
    <View style={styles.focusedCard}>
      <View style={styles.focusedTopRow}>
        <View style={[styles.focusedCategoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.focusedCategoryIcon}>{getCategoryIcon(task.category)}</Text>
          <Text style={styles.focusedCategoryText}>
            {getCategoryLabel(task.category)}
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
          <Text style={styles.statLabel}>{t.task?.distance || 'DISTANCE'}</Text>
          <Text style={styles.statValue}>{distanceKm ? `${distanceKm}km` : '—'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.task?.posted || 'POSTED'}</Text>
          <Text style={styles.statValue}>{formatPostedDate(task.created_at!)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.task?.applicants || 'APPLICANTS'}</Text>
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
        <Text style={styles.viewButtonText}>{t.task?.viewAndApply || 'View and apply'}</Text>
        <Icon name="arrow-forward" size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
});
