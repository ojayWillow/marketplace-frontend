import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Offering } from '@marketplace/shared';

interface OfferingCardProps {
  offering: Offering;
  onPress?: (offering: Offering) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return { bg: '#dcfce7', text: '#166534' };
    case 'paused': return { bg: '#fef3c7', text: '#92400e' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'paused': return 'Paused';
    default: return status;
  }
};

const OfferingCard: React.FC<OfferingCardProps> = ({ offering, onPress }) => {
  const statusColors = getStatusColor(offering.status || 'active');

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(offering);
    } else {
      router.push(`/offering/${offering.id}`);
    }
  }, [offering, onPress]);

  const getPriceText = () => {
    if (offering.price_type === 'hourly') {
      return `€${offering.price}/hr`;
    } else if (offering.price_type === 'fixed') {
      return `€${offering.price}`;
    }
    return 'Negotiable';
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
            {offering.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {getStatusLabel(offering.status || 'active')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.category}>{offering.category}</Text>
        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {offering.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{getPriceText()}</Text>
          <Text style={styles.creator}>👤 {offering.creator_name || 'Anonymous'}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

// Memoize with custom comparison
export default memo(OfferingCard, (prevProps, nextProps) => {
  // Only re-render if offering ID or status changed
  return (
    prevProps.offering.id === nextProps.offering.id &&
    prevProps.offering.status === nextProps.offering.status &&
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
    color: '#f97316', 
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
    color: '#f97316', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  creator: { 
    color: '#9ca3af', 
    fontSize: 13 
  },
});
