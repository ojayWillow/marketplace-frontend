import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import type { Offering } from '@marketplace/shared';
import { getImageUrl, getCategoryByKey } from '@marketplace/shared';
import StarRating from './StarRating';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';

interface OfferingCardProps {
  offering: Offering;
  onPress?: (offering: Offering) => void;
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
const formatLocationDisplay = (offering: Offering): string => {
  const hasDistance = (offering as any).distance !== undefined && (offering as any).distance !== null;
  const city = extractCity(offering.location) || offering.creator_city;
  
  if (hasDistance && city) {
    return `${(offering as any).distance.toFixed(1)} km, ${city}`;
  } else if (hasDistance) {
    return `${(offering as any).distance.toFixed(1)} km`;
  } else if (city) {
    return city;
  }
  
  return '';
};

const OfferingCard: React.FC<OfferingCardProps> = ({ offering, onPress }) => {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  const timeAgo = formatTimeAgo(offering.created_at);
  const hasRating = (offering.creator_rating ?? 0) > 0;
  const categoryData = getCategoryByKey(offering.category);
  const locationDisplay = formatLocationDisplay(offering);

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

  const styles = StyleSheet.create({
    card: { 
      marginBottom: 12, 
      backgroundColor: themeColors.card,
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
      color: themeColors.textSecondary,
    },
    price: {
      fontSize: 18,
      fontWeight: '700',
      color: '#f97316', // Orange for services - keep consistent
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
      backgroundColor: '#f97316',
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
  });

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        {/* Row 1: Category + Price */}
        <View style={styles.row1}>
          <Text style={styles.category}>
            {categoryData?.icon || '🛠️'} {categoryData?.label || offering.category}
          </Text>
          <Text style={styles.price}>{getPriceText()}</Text>
        </View>
        
        {/* Row 2: Title */}
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {offering.title}
        </Text>
        
        {/* Row 3: Creator with Avatar + Name + City + Rating */}
        <View style={styles.row3}>
          {offering.creator_avatar ? (
            <Image 
              source={{ uri: getImageUrl(offering.creator_avatar) }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {offering.creator_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.creatorName} numberOfLines={1}>
            {offering.creator_name || 'Anonymous'}
          </Text>
          {offering.creator_city && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.creatorCity} numberOfLines={1}>{offering.creator_city}</Text>
            </>
          )}
          {hasRating && (
            <>
              <Text style={styles.dot}>•</Text>
              <StarRating 
                rating={offering.creator_rating || 0} 
                reviewCount={offering.creator_review_count}
                size={12}
                showCount={true}
              />
            </>
          )}
        </View>
        
        {/* Row 4: Description Preview */}
        {offering.description && (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {offering.description}
          </Text>
        )}
        
        {/* Row 5: Location + Time */}
        <View style={styles.row5}>
          {locationDisplay && (
            <>
              <Text style={styles.metaText}>📍 {locationDisplay}</Text>
              <Text style={styles.metaDot}>•</Text>
            </>
          )}
          
          {timeAgo && (
            <Text style={styles.metaText}>{timeAgo}</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

// Memoize with custom comparison
export default memo(OfferingCard, (prevProps, nextProps) => {
  return (
    prevProps.offering.id === nextProps.offering.id &&
    prevProps.offering.status === nextProps.offering.status &&
    prevProps.onPress === nextProps.onPress
  );
});
