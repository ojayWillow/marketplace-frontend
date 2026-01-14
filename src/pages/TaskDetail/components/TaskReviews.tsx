import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import { useToastStore } from '../../../stores/toastStore';
import { Review, CanReviewResponse } from '../types';

const MIN_REVIEW_LENGTH = 10;

interface TaskReviewsProps {
  taskId: number;
  reviews: Review[];
  canReview: CanReviewResponse | null;
  onReviewSubmitted: () => void;
}

export const TaskReviews = ({
  taskId,
  reviews,
  canReview,
  onReviewSubmitted,
}: TaskReviewsProps) => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [touched, setTouched] = useState(false);

  const contentLength = reviewContent.trim().length;
  const charsRemaining = MIN_REVIEW_LENGTH - contentLength;
  const isContentValid = contentLength >= MIN_REVIEW_LENGTH;
  const showError = touched && !isContentValid && contentLength > 0;

  const handleSubmitReview = async () => {
    if (!canReview?.can_review) return;
    
    // Mark as touched to show validation
    setTouched(true);
    
    if (!isContentValid) {
      toast.error(t('reviews.contentRequired'));
      return;
    }

    try {
      setReviewLoading(true);
      await apiClient.post(`/api/reviews/task/${taskId}`, {
        rating: reviewRating,
        content: reviewContent.trim()
      });
      toast.success(t('reviews.submitSuccess'));
      setShowReviewForm(false);
      setReviewContent('');
      setReviewRating(5);
      setTouched(false);
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || t('reviews.submitError'));
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    const displayRating = interactive ? (hoverRating || reviewRating) : rating;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
        {!interactive && rating && <span className="text-sm text-gray-500 ml-2">({rating.toFixed(1)})</span>}
      </div>
    );
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-md p-6">
      <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
        ⭐ {t('reviews.title')}
        {reviews.length > 0 && (
          <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
        )}
      </h2>

      {canReview?.can_review && (
        <div className="mb-4">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors"
            >
              <span className="font-medium text-yellow-700">
                ⭐ {t('reviews.leaveReviewFor', { name: canReview.reviewee?.username })}
              </span>
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                {t('reviews.reviewFor', { name: canReview.reviewee?.username })}
              </h3>
              
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">{t('reviews.rating')}</label>
                {renderStars(reviewRating, true)}
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">
                  {t('reviews.commentRequired')}
                </label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder={t('reviews.placeholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[100px] ${
                    showError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {showError ? (
                      <p className="text-red-500 text-sm">
                        {t('reviews.charsRemaining', { count: charsRemaining })}
                      </p>
                    ) : contentLength === 0 && touched ? (
                      <p className="text-red-500 text-sm">
                        {t('reviews.contentRequired')}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        {t('reviews.helpOthers')}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isContentValid 
                      ? 'text-green-600' 
                      : contentLength > 0 
                        ? 'text-yellow-600' 
                        : 'text-gray-400'
                  }`}>
                    {contentLength}/{MIN_REVIEW_LENGTH}
                    {isContentValid && ' ✓'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading || !isContentValid}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {reviewLoading ? t('reviews.submitting') : t('reviews.submit')}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewContent('');
                    setReviewRating(5);
                    setTouched(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {canReview && !canReview.can_review && canReview.existing_review && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 flex items-center gap-2 text-sm">
            <span>✅</span> {t('reviews.alreadyReviewed')}
          </p>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-2 block">💬</span>
          <p className="text-gray-500">{t('reviews.noReviews')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {review.reviewer?.profile_picture_url ? (
                    <img
                      src={review.reviewer.profile_picture_url}
                      alt={review.reviewer.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {review.reviewer?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/users/${review.reviewer_id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {review.reviewer?.username || 'Unknown'}
                    </Link>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {review.content && (
                    <p className="text-gray-700 mt-2">{review.content}</p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
