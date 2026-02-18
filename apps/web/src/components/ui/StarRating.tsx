import React from 'react';

interface StarRatingProps {
  /** Rating value from 0 to 5 */
  rating: number;
  /** Size of the stars */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the numeric rating value next to stars (e.g. "4.2") */
  showValue?: boolean;
  /** Number of reviews (optional) */
  reviewCount?: number;
  /** Whether to show the review count — shown as "(3 reviews)" when showValue is true, or "(3)" in compact mode */
  showCount?: boolean;
  /** Use compact count format "(3)" instead of "(3 reviews)" */
  compact?: boolean;
}

/**
 * Unified star rating display with precise fractional fill using CSS clip-path.
 *
 * Standard format:  ★★★★☆ 4.2 (3 reviews)
 * Compact format:   ★★★★☆ 4.2 (3)
 *
 * @example
 * // Full display
 * <StarRating rating={4.2} showValue reviewCount={3} showCount />
 *
 * // Compact (cards)
 * <StarRating rating={4.2} size="xs" showValue reviewCount={3} showCount compact />
 *
 * // Stars only
 * <StarRating rating={4.2} />
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  className = '',
  showValue = false,
  reviewCount,
  showCount = false,
  compact = false,
}) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  const sizeClasses: Record<string, string> = {
    xs: 'text-[10px]',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const valueSizeClasses: Record<string, string> = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const stars = [];
  for (let i = 0; i < 5; i++) {
    const fill = Math.max(0, Math.min(1, clampedRating - i));

    if (fill >= 1) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    } else if (fill > 0) {
      const percentage = Math.round(fill * 100);
      stars.push(
        <span key={i} className="relative inline-block">
          <span className="text-gray-300 dark:text-gray-600">★</span>
          <span
            className="absolute inset-0 text-yellow-400 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
          >
            ★
          </span>
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="text-gray-300 dark:text-gray-600">
          ★
        </span>
      );
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`inline-flex ${sizeClasses[size]}`}>{stars}</span>
      {showValue && (
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${valueSizeClasses[size]}`}>
          {clampedRating.toFixed(1)}
        </span>
      )}
      {showCount && reviewCount !== undefined && (
        <span className={`text-gray-400 dark:text-gray-500 ${valueSizeClasses[size]}`}>
          {compact ? `(${reviewCount})` : `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`}
        </span>
      )}
    </span>
  );
};

export default StarRating;
