import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  color?: string;
  showCount?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  reviewCount, 
  size = 14, 
  color = '#f59e0b',
  showCount = true 
}) => {
  // Round to nearest 0.5 for display
  const fraction = rating % 1;
  const fullStars = fraction >= 0.8 ? Math.ceil(rating) : Math.floor(rating);
  const hasHalfStar = fraction >= 0.3 && fraction < 0.8;

  const renderStars = () => {
    const stars = [];

    // Full stars only
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`full-${i}`} style={[styles.star, { fontSize: size, color, lineHeight: size + 2 }]}>
          ★
        </Text>
      );
    }

    // Half star (shown as a slightly dimmer full star to keep it clean)
    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={[styles.star, { fontSize: size, color, opacity: 0.5, lineHeight: size + 2 }]}>
          ★
        </Text>
      );
    }

    // No empty stars — that's it, clean and done

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {/* Show numeric rating for precision */}
      <Text style={[styles.ratingNumber, { fontSize: size * 0.85, color, lineHeight: size + 2 }]}>
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <Text style={[styles.count, { fontSize: size * 0.85, lineHeight: size + 2 }]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 3,
  },
  star: {
    marginRight: 1,
  },
  ratingNumber: {
    fontWeight: '600',
    marginRight: 3,
  },
  count: {
    color: '#6b7280',
  },
});

export default StarRating;
