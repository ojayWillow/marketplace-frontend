import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

const MIN_REVIEW_LENGTH = 10;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
  taskId: number;
  taskTitle: string;
  revieweeName: string;
  revieweeId: number;
  reviewType: 'worker' | 'creator'; // Who is being reviewed
}

type ModalStep = 'review' | 'success';

export const ReviewModal = ({
  isOpen,
  onClose,
  onReviewSubmitted,
  taskId,
  taskTitle,
  revieweeName,
  revieweeId,
  reviewType,
}: ReviewModalProps) => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [step, setStep] = useState<ModalStep>('review');
  const [loading, setLoading] = useState(false);
  
  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [touched, setTouched] = useState(false);

  const contentLength = reviewContent.trim().length;
  const charsRemaining = MIN_REVIEW_LENGTH - contentLength;
  const isContentValid = contentLength >= MIN_REVIEW_LENGTH;
  const showError = touched && !isContentValid;

  const handleSubmitReview = async () => {
    // Mark as touched to show validation
    setTouched(true);
    
    if (!isContentValid) {
      // Don't close modal, just show error
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/api/reviews/task/${taskId}`, {
        rating: reviewRating,
        content: reviewContent.trim()
      });
      toast.success(t('reviews.submitSuccess'));
      setStep('success');
      // Auto close after showing success
      setTimeout(() => {
        handleClose(true);
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || t('reviews.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (submitted = false) => {
    // Reset state
    setStep('review');
    setReviewRating(5);
    setReviewContent('');
    setHoverRating(0);
    setTouched(false);
    if (submitted) {
      onReviewSubmitted();
    }
    onClose();
  };

  const renderStars = () => {
    const displayRating = hoverRating || reviewRating;
    
    return (
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`text-3xl cursor-pointer hover:scale-110 transition-transform ${
              star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent!'
    };
    return labels[rating as keyof typeof labels] || '';
  };

  const getHeaderInfo = () => {
    if (reviewType === 'creator') {
      return {
        emoji: '⭐',
        title: t('reviews.leaveReviewFor', { name: revieweeName }),
        subtitle: 'How was your experience with this job poster?',
        gradient: 'from-yellow-400 to-orange-500'
      };
    }
    return {
      emoji: '⭐',
      title: t('reviews.leaveReviewFor', { name: revieweeName }),
      subtitle: 'How was your experience with this helper?',
      gradient: 'from-yellow-400 to-yellow-500'
    };
  };

  if (!isOpen) return null;

  const headerInfo = getHeaderInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Review Step */}
        {step === 'review' && (
          <>
            <div className={`bg-gradient-to-r ${headerInfo.gradient} p-6 text-center`}>
              <div className="text-5xl mb-3">{headerInfo.emoji}</div>
              <h2 className="text-xl font-bold text-white">{headerInfo.title}</h2>
              <p className="text-white/80 text-sm mt-1">{headerInfo.subtitle}</p>
            </div>
            
            <div className="p-6">
              {/* Task info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                <p className="text-sm text-gray-500">For task:</p>
                <p className="font-medium text-gray-900">{taskTitle}</p>
              </div>
              
              <div className="mb-4">
                {renderStars()}
                <p className="text-center text-sm text-gray-500 mt-2">
                  {getRatingLabel(hoverRating || reviewRating)}
                </p>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder={t('reviews.placeholder')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[100px] resize-none ${
                    showError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {showError && contentLength === 0 ? (
                      <p className="text-red-500 text-sm">
                        {t('reviews.contentRequired')}
                      </p>
                    ) : showError ? (
                      <p className="text-red-500 text-sm">
                        {t('reviews.charsRemaining', { count: charsRemaining })}
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
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleClose(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading || !isContentValid}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? t('reviews.submitting') : `⭐ ${t('reviews.submit')}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your review has been submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
