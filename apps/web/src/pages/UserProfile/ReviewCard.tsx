import StarRating from '../../components/ui/StarRating';

interface ReviewCardProps {
  review: {
    id: number;
    reviewer_name: string;
    reviewer_avatar?: string;
    rating: number;
    content?: string;
    created_at: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {review.reviewer_avatar ? (
            <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-white text-sm font-bold">
              {(review.reviewer_name?.[0] || '?').toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {review.reviewer_name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(review.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <StarRating rating={review.rating} size="sm" />

          {review.content && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
              {review.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
