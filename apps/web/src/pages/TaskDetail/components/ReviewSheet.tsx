import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

const MIN_REVIEW_LENGTH = 10;

interface ReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  taskId: number;
  revieweeName: string;
}

export const ReviewSheet = ({
  isOpen,
  onClose,
  onSubmitted,
  taskId,
  revieweeName,
}: ReviewSheetProps) => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const contentLength = content.trim().length;
  const charsRemaining = MIN_REVIEW_LENGTH - contentLength;
  const isValid = contentLength >= MIN_REVIEW_LENGTH;
  const showError = touched && !isValid && contentLength > 0;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setContent('');
      setTouched(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;

    try {
      setSubmitting(true);
      await apiClient.post(`/api/reviews/task/${taskId}`, {
        rating,
        content: content.trim(),
      });
      toast.success(t('reviews.submitSuccess', 'Review submitted! Thanks for your feedback.'));
      onSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || t('reviews.submitError', 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleSkip}
      />

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[101] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t('reviews.howWas', 'How was your experience?')}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-[44px]">
            {t('reviews.ratePrompt', 'Leave a review for {{name}}', { name: revieweeName })}
          </p>
        </div>

        {/* Star Rating */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <span
                  className={`text-4xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                  } transition-colors`}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {rating === 1 && t('reviews.rating1', 'Poor')}
            {rating === 2 && t('reviews.rating2', 'Below average')}
            {rating === 3 && t('reviews.rating3', 'Average')}
            {rating === 4 && t('reviews.rating4', 'Good')}
            {rating === 5 && t('reviews.rating5', 'Excellent!')}
          </p>
        </div>

        {/* Comment */}
        <div className="px-5 pb-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={t('reviews.placeholder', 'How was working with them? What went well?')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm leading-relaxed resize-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              showError ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
            rows={3}
          />
          <div className="flex justify-between items-center mt-1 px-1">
            <div>
              {showError ? (
                <p className="text-red-500 dark:text-red-400 text-xs">
                  {t('reviews.charsRemaining', '{{count}} more characters needed', { count: charsRemaining })}
                </p>
              ) : contentLength === 0 && touched ? (
                <p className="text-red-500 dark:text-red-400 text-xs">
                  {t('reviews.contentRequired', 'Please write a short review')}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  {t('reviews.minChars', 'At least {{count}} characters', { count: MIN_REVIEW_LENGTH })}
                </p>
              )}
            </div>
            <span className={`text-xs font-medium ${
              isValid ? 'text-green-600 dark:text-green-400' : contentLength > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {contentLength}/{MIN_REVIEW_LENGTH}
              {isValid && ' ✓'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 pt-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 font-bold text-sm shadow-lg active:scale-[0.98] transition-all mb-2"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('reviews.submitting', 'Submitting...')}
              </span>
            ) : (
              t('reviews.submit', 'Submit Review')
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="w-full py-2.5 text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('reviews.skipForNow', 'Skip for now')}
          </button>
        </div>
      </div>
    </>
  );
};
