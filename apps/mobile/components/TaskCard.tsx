import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Task } from '@marketplace/shared';
import { getImageUrl, getCategoryByKey } from '@marketplace/shared';

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
}

// Helper to format time ago
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

// Helper to get difficulty color indicator
const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined): { color: string; label: string } => {
  switch (difficulty) {
    case 'easy': return { color: '#10b981', label: 'Easy' };  // Green
    case 'hard': return { color: '#ef4444', label: 'Hard' };  // Red
    case 'medium':
    default: return { color: '#f59e0b', label: 'Medium' }; // Yellow/Orange
  }
};

// Helper to extract just the city name from location string
const extractCity = (location: string | undefined): string => {
  if (!location) return '';
  
  // Split by comma and get parts
  const parts = location.split(',').map(p => p.trim());
  
  // If only one part, it's probably already just the city
  if (parts.length === 1) return parts[0];
  
  // Common patterns:
  // "Street, City, Country" -> get City (index 1)
  // "Street, Postal, City, Country" -> get City (before last, skip postal codes)
  // "City, Country" -> get City (index 0)
  // "Street, City, Region, Country" -> get City (index 1)
  
  // If 2 parts, first is usually city (e.g., "Riga, Latvia")
  if (parts.length === 2) return parts[0];
  
  // If 3+ parts, usually index 1 is the city (after street/building)
  // But skip if it looks like a postal code (all numbers)
  if (parts.length >= 3) {
    // Check if parts[1] is a postal code (contains mostly digits)
    if (parts[1].match(/^\d+$/)) {
      // Postal code detected, city is at index 2
      return parts[2];
    }
    // Otherwise city is at index 1
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

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const difficulty = getDifficultyIndicator(task.difficulty);
  const timeAgo = formatTimeAgo(task.created_at);
  const hasApplicants = (task.pending_applications_count ?? 0) > 0;
  const hasRating = (task.creator_rating ?? 0) > 0;
  const reviewCount = task.creator_review_count ?? 0;
  const categoryData = getCategoryByKey(task.category);
  const locationDisplay = formatLocationDisplay(task);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(task);
    } else {
      router.push(`/task/${task.id}`);
    }
  }, [task, onPress]);

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        {/* Row 1: Category + Price */}
        <View style={styles.row1}>
          <Text style={styles.category}>
            {categoryData?.icon || '📋'} {categoryData?.label || task.category}
          </Text>
          <Text style={styles.price}>€{task.budget?.toFixed(0) || task.reward?.toFixed(0) || '0'}</Text>
        </View>
        
        {/* Row 2: Title */}
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {task.title}
        </Text>
        
        {/* Row 3: Creator - Name • Rating • City (Option A) */}
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
          
          {/* Rating - show after name */}
          {hasRating ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.rating}>
                ⭐ {task.creator_rating?.toFixed(1)} ({reviewCount})
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.newUser}>New</Text>
            </>
          )}
          
          {/* City - show last */}
          {task.creator_city && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.creatorCity} numberOfLines={1}>{task.creator_city}</Text>
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

// Memoize with custom comparison
export default memo(TaskCard, (prevProps, nextProps) => {
  // Re-render if task data changed
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.pending_applications_count === nextProps.task.pending_applications_count &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  card: { 
    marginBottom: 12, 
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  
  // Row 1: Category + Price
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  
  // Row 2: Title
  title: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  
  // Row 3: Creator Info - Name • Rating • City
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
    backgroundColor: '#0ea5e9',
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
    color: '#1f2937',
    maxWidth: 100,
  },
  dot: {
    fontSize: 13,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  newUser: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  creatorCity: {
    fontSize: 13,
    color: '#6b7280',
    maxWidth: 80,
  },
  
  // Row 4: Description
  description: {
    color: '#6b7280',
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
    color: '#9ca3af',
  },
  metaDot: {
    fontSize: 12,
    color: '#d1d5db',
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
    color: '#6b7280',
    fontWeight: '500',
  },
});
