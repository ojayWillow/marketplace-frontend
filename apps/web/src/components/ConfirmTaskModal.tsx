import { useState } from 'react';
import apiClient from '../api/client';
import { confirmTaskCompletion } from '../api/tasks';
import { useToastStore } from '../stores/toastStore';

interface ConfirmTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  taskId: number;
  taskTitle: string;
  workerName: string;
  workerId: number;
  budget?: number;
}

type ModalStep = 'confirm' | 'review' | 'success';

export const ConfirmTaskModal = ({
  isOpen,
  onClose,
  onConfirmed,
  taskId,
  taskTitle,
  workerName,
  workerId,
  budget,
}: ConfirmTaskModalProps) => {
  const toast = useToastStore();
  const [step, setStep] = useState<ModalStep>('confirm');
  const [loading, setLoading] = useState(false);
  
  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmTaskCompletion(taskId);
      toast.success('Task marked as completed!');
      setStep('review');
    } catch (error: any) {
      console.error('Error confirming task:', error);
      toast.error(error?.response?.data?.error || 'Failed to confirm task');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setLoading(true);
      await apiClient.post(`/api/reviews/task/${taskId}`, {
        rating: reviewRating,
        content: reviewContent
      });
      toast.success('Review submitted! Thank you for your feedback.');
      setStep('success');
      // Auto close after showing success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipReview = () => {
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setStep('confirm');
    setReviewRating(5);
    setReviewContent('');
    setHoverRating(0);
    onConfirmed();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Confirm Step */}
        {step === 'confirm' && (
          <>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-white">Confirm Completion</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure <strong>{workerName}</strong> has completed this task?
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="font-medium text-gray-900 mb-1">{taskTitle}</p>
                  {budget && (
                    <p className="text-green-600 font-semibold">€{budget}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {loading ? 'Confirming...' : '✓ Yes, Confirm'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-xl font-bold text-white">Rate {workerName}</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-center mb-4">
                How was your experience with {workerName}?
              </p>
              
              <div className="mb-4">
                {renderStars()}
                <p className="text-center text-sm text-gray-500 mt-2">
                  {reviewRating === 1 && 'Poor'}
                  {reviewRating === 2 && 'Fair'}
                  {reviewRating === 3 && 'Good'}
                  {reviewRating === 4 && 'Very Good'}
                  {reviewRating === 5 && 'Excellent!'}
                </p>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[100px] resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSkipReview}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {loading ? 'Submitting...' : '⭐ Submit Review'}
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

export default ConfirmTaskModal;
