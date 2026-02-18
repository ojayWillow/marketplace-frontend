import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '@marketplace/shared';
import { reviewsApi } from '@marketplace/shared';
import { StarRating } from '../StarRating';
import type { Review } from '@marketplace/shared';

interface ReviewsTabProps {
  reviews: Review[];
  currentUserId?: number;
  onDeleteReview: (id: number) => void;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const ReviewsTab = ({ reviews, currentUserId, onDeleteReview, setReviews }: ReviewsTabProps) => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewEditData, setReviewEditData] = useState<{ rating: number; content: string }>({ rating: 5, content: '' });

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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.reviewsTab.title')}</h2>
      
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-gray-500 dark:text-gray-400">{t('profile.reviewsTab.noReviews')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {editingReview === review.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.reviewsTab.rating')}</label>
                    <StarRating
                      rating={reviewEditData.rating}
                      editable
                      onChange={(rating) => setReviewEditData(prev => ({ ...prev, rating }))}
                      size="lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.reviewsTab.comment')}</label>
                    <textarea
                      value={reviewEditData.content}
                      onChange={(e) => setReviewEditData(prev => ({ ...prev, content: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveReview(review.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">{t('profile.reviewsTab.save')}</button>
                    <button onClick={() => setEditingReview(null)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm">{t('profile.reviewsTab.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {review.reviewer_avatar ? (
                      <img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{review.reviewer_name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{review.reviewer_name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.content ? (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.content}</p>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-sm italic">{t('profile.reviewsTab.noComment')}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  {currentUserId && review.reviewer_id === currentUserId && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditReview(review)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('profile.reviewsTab.edit')}</button>
                      <button onClick={() => onDeleteReview(review.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">{t('profile.reviewsTab.delete')}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
