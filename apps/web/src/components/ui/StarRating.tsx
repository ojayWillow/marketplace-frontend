import React from 'react';

interface StarRatingProps {
  /** Rating value from 0 to 5 */
  rating: number;
  /** Size of the stars */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the numeric rating value */
  showValue?: boolean;
  /** Number of reviews (optional, displayed in parentheses) */
  reviewCount?: number;
}

/**
 * Renders a star rating display with full, half, and empty stars.
 * 
 * @example
 * // Basic usage
 * <StarRating rating={4.5} />
 * 
 * @example
 * // With review count
 * <StarRating rating={4.5} showValue reviewCount={42} />
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  className = '',
  showValue = false,
  reviewCount,
}) => {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`text-yellow-500 ${sizeClasses[size]}`}>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
      {showValue && (
        <span className="text-gray-500 text-sm">
          {clampedRating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount} reviews)`}
        </span>
      )}
    </span>
  );
};

export default StarRating;
