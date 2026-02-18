import React from 'react';

interface StarRatingProps {
  /** Rating value from 0 to 5 */
  rating: number;
  /** Size of the stars */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the numeric rating value */
  showValue?: boolean;
  /** Number of reviews (optional, displayed in parentheses) */
  reviewCount?: number;
  /** Whether to show the review count */
  showCount?: boolean;
}

/**
 * Renders a star rating display with precise fractional fill using CSS clip-path.
 * For example, a 3.7 rating shows 3 full stars + 1 star filled 70% + 1 empty star.
 *
 * @example
 * <StarRating rating={3.7} />
 * <StarRating rating={4.5} size="lg" showValue reviewCount={42} />
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  className = '',
  showValue = false,
  reviewCount,
  showCount = false,
}) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  const sizeClasses: Record<string, string> = {
    xs: 'text-[10px]',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const stars = [];
  for (let i = 0; i < 5; i++) {
    const fill = Math.max(0, Math.min(1, clampedRating - i));

    if (fill >= 1) {
      // Full star
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    } else if (fill > 0) {
      // Fractional star — overlay a clipped filled star on top of an empty star
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
      // Empty star
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
        <span className="text-gray-500 text-sm">
          {clampedRating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount} reviews)`}
        </span>
      )}
      {showCount && !showValue && reviewCount !== undefined && (
        <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: 'inherit' }}>
          ({reviewCount})
        </span>
      )}
    </span>
  );
};

export default StarRating;
