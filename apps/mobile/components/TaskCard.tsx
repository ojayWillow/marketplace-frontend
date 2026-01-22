import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Task } from '@marketplace/shared';

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
}

// Helper to shorten location - extract city name
const shortenLocation = (location: string | undefined): string => {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim());
  
  // Try to find city (skip street addresses, postal codes, country)
  for (const part of parts) {
    if (/^\d/.test(part)) continue;
    if (/LV-\d+/.test(part)) continue;
    if (part.toLowerCase() === 'latvia') continue;
    if (part.length < 3) continue;
    return part;
  }
  
  return location.length > 15 ? location.substring(0, 15) + '...' : location;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return { bg: '#dcfce7', text: '#166534' };
    case 'assigned': return { bg: '#fef3c7', text: '#92400e' };
    case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
    case 'pending_confirmation': return { bg: '#f3e8ff', text: '#7c3aed' };
    case 'completed': return { bg: '#f3f4f6', text: '#374151' };
    case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Open';
    case 'assigned': return 'Assigned';
    case 'in_progress': return 'In Progress';
    case 'pending_confirmation': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const statusColors = getStatusColor(task.status);
  const shortLocation = shortenLocation(task.location);

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
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
            {task.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.category}>{task.category}</Text>
        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.price}>€{task.budget?.toFixed(0) || '0'}</Text>
          <View style={styles.footerMeta}>
            {shortLocation ? (
              <Text style={styles.location}>📍 {shortLocation}</Text>
            ) : null}
            <Text style={styles.creator}>👤 {task.creator_name || 'Anonymous'}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// Memoize with custom comparison
export default memo(TaskCard, (prevProps, nextProps) => {
  // Only re-render if task ID or status changed
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
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
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: { 
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    color: '#1f2937',
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  statusBadgeText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  category: { 
    color: '#0ea5e9', 
    fontSize: 13,
    marginBottom: 6,
  },
  description: { 
    color: '#6b7280', 
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  price: { 
    color: '#0ea5e9', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  location: { 
    color: '#9ca3af', 
    fontSize: 13,
  },
  creator: { 
    color: '#9ca3af', 
    fontSize: 13 
  },
});
