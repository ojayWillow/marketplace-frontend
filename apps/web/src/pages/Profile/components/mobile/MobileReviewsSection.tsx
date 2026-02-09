import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastStore, reviewsApi } from '@marketplace/shared';
import { StarRating } from '../StarRating';
import type { Review } from '@marketplace/shared';

interface MobileReviewsSectionProps {
  reviews: Review[];
  showAll: boolean;
  onToggleShowAll: () => void;
  currentUserId?: number;
  onDeleteReview: (id: number) => void;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const MobileReviewsSection = ({
  reviews,
  showAll,
  onToggleShowAll,
  currentUserId,
  onDeleteReview,
  setReviews,
}: MobileReviewsSectionProps) => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewEditData, setReviewEditData] = useState<{ rating: number; content: string }>({ rating: 5, content: '' });

  const displayReviews = showAll ? reviews : reviews.slice(0, 2);
  const hasMore = reviews.length > 2;

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setReviewEditData({ rating: review.rating, content: review.content || '' });
  };

  const handleSaveReview = async (reviewId: number) => {
    try {
      await reviewsApi.update(reviewId, reviewEditData);
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, ...reviewEditData } : r
      ));
      setEditingReview(null);
      toast.success(t('reviews.updateSuccess'));
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(t('reviews.submitError'));
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">{t('profile.reviewsTab.title')}</h3>
        </div>
        <div className="text-center py-4">
          <span className="text-2xl">⭐</span>
          <p className="text-gray-400 text-sm mt-1">{t('profile.reviewsTab.noReviews')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">
          {t('profile.reviewsTab.title')}
          <span className="text-gray-400 font-normal ml-1">({reviews.length})</span>
        </h3>
      </div>

      <div className="space-y-3">
        {displayReviews.map(review => (
          <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
            {editingReview === review.id ? (
              <div className="space-y-2">
                <div>
                  <StarRating
                    rating={reviewEditData.rating}
                    editable
                    onChange={(rating) => setReviewEditData(prev => ({ ...prev, rating }))}
                    size="lg"
                  />
                </div>
                <textarea
                  value={reviewEditData.content}
                  onChange={(e) => setReviewEditData(prev => ({ ...prev, content: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveReview(review.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs">{t('profile.reviewsTab.save')}</button>
                  <button onClick={() => setEditingReview(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs">{t('profile.reviewsTab.cancel')}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {review.reviewer_avatar ? (
                    <img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-xs font-medium">{review.reviewer_name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900 text-sm">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.content ? (
                    <p className="text-gray-600 text-sm">{review.content}</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">{t('profile.reviewsTab.noComment')}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                {currentUserId && review.reviewer_id === currentUserId && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEditReview(review)} className="text-xs text-blue-600 hover:underline">{t('profile.reviewsTab.edit')}</button>
                    <button onClick={() => onDeleteReview(review.id)} className="text-xs text-red-500 hover:underline">{t('profile.reviewsTab.delete')}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* See all / Show less toggle */}
      {hasMore && (
        <button
          onClick={onToggleShowAll}
          className="w-full mt-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showAll
            ? t('common.showLess', 'Show less')
            : t('profile.reviewsTab.seeAll', 'See all {{count}} reviews →', { count: reviews.length })
          }
        </button>
      )}
    </div>
  );
};
