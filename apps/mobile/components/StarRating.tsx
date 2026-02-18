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
  showCount = true,
}) => {
  // Clamp rating between 0 and 5
  const clampedRating = Math.min(Math.max(rating, 0), 5);
  const fullStars = Math.floor(clampedRating);
  const fraction = clampedRating - fullStars;

  // Each star character needs a known width so we can clip it precisely.
  // The star character's visual width is roughly equal to the fontSize.
  const starWidth = size;

  const renderStar = (key: string, fillPercent: number) => (
    <View
      key={key}
      style={{
        width: starWidth * fillPercent,
        height: size + 2,
        overflow: 'hidden',
        marginRight: fillPercent === 1 ? 1 : 0,
      }}
    >
      <Text
        style={{
          fontSize: size,
          lineHeight: size + 2,
          color,
        }}
      >
        ★
      </Text>
    </View>
  );

  const renderStars = () => {
    const stars = [];

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(renderStar(`full-${i}`, 1));
    }

    // Fractional star — only if there is a fraction and we haven't hit 5 full stars
    if (fraction > 0 && fullStars < 5) {
      stars.push(renderStar('partial', fraction));
    }

    // No empty/gray placeholder stars — only the filled portion is rendered

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      {/* Show numeric rating for precision */}
      <Text
        style={[
          styles.ratingNumber,
          { fontSize: size * 0.85, color, lineHeight: size + 2 },
        ]}
      >
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <Text
          style={[
            styles.count,
            { fontSize: size * 0.85, lineHeight: size + 2 },
          ]}
        >
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
  ratingNumber: {
    fontWeight: '600',
    marginRight: 3,
  },
  count: {
    color: '#6b7280',
  },
});

export default StarRating;
