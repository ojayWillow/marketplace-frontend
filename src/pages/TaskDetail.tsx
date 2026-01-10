import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useQueryClient } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import { Task, TaskApplication, getTaskApplications, acceptApplication, rejectApplication, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask } from '../api/tasks';
import { getOfferings, Offering } from '../api/offerings';
import { startConversation } from '../api/messages';
import { useTask, useApplyToTask, taskKeys } from '../api/hooks';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import apiClient from '../api/client';
import ShareButton from '../components/ui/ShareButton';
import SEOHead from '../components/ui/SEOHead';

// Fix Leaflet default icon issue
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Helper function to render star rating
const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClass = size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  
  return (
    <span className={`text-yellow-500 ${sizeClass}`}>
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

interface Review {
  id: number;
  rating: number;
  content: string;
  reviewer_id: number;
  reviewed_user_id: number;
  review_type: string;
  created_at: string;
  reviewer?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  reviewed_user?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
}

interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  review_type?: string;
  reviewee?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  existing_review?: Review;
}

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();
  
  // React Query for task data
  const { data: task, isLoading: loading, refetch: refetchTask } = useTask(Number(id));
  const applyMutation = useApplyToTask();
  
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Recommended helpers state
  const [recommendedHelpers, setRecommendedHelpers] = useState<Offering[]>([]);
  const [helpersLoading, setHelpersLoading] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState<CanReviewResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Custom marker icon for map
  const taskIcon = divIcon({
    className: 'custom-task-icon',
    html: '<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  useEffect(() => {
    if (task && user?.id === task.creator_id && task.status === 'open') {
      fetchApplications();
      fetchRecommendedHelpers();
    }
    if (task && task.status === 'completed') {
      fetchReviews();
      if (isAuthenticated) {
        checkCanReview();
      }
    }
  }, [task, user, isAuthenticated]);

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await getTaskApplications(Number(id));
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchRecommendedHelpers = async () => {
    if (!task || !task.latitude || !task.longitude) return;
    
    try {
      setHelpersLoading(true);
      const response = await getOfferings({
        category: task.category,
        latitude: task.latitude,
        longitude: task.longitude,
        radius: 50,
        status: 'active',
        per_page: 6
      });
      const filtered = (response.offerings || []).filter(o => o.creator_id !== task.creator_id);
      setRecommendedHelpers(filtered);
    } catch (error) {
      console.error('Error fetching recommended helpers:', error);
    } finally {
      setHelpersLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/task/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/task/${id}/can-review`);
      setCanReview(response.data);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!canReview?.can_review) return;

    try {
      setReviewLoading(true);
      await apiClient.post(`/api/reviews/task/${id}`, {
        rating: reviewRating,
        content: reviewContent
      });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewContent('');
      setReviewRating(5);
      fetchReviews();
      checkCanReview();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMessageCreator = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to send messages');
      navigate('/login');
      return;
    }
    if (!task?.creator_id) return;

    try {
      setMessageLoading(true);
      const { conversation } = await startConversation(task.creator_id, undefined, task.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleMessageApplicant = async (applicantId: number) => {
    if (!isAuthenticated) return;

    try {
      const { conversation } = await startConversation(applicantId, undefined, task?.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    }
  };

  const handleContactHelper = async (helper: Offering) => {
    if (!isAuthenticated) {
      toast.warning('Please login to contact helpers');
      navigate('/login');
      return;
    }

    try {
      const { conversation } = await startConversation(
        helper.creator_id, 
        `Hi! I saw your "${helper.title}" offering and I have a job that might interest you: "${task?.title}"`,
        task?.id
      );
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error contacting helper:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    }
  };

  const handleApplyTask = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.warning('Please login to apply');
      navigate('/login');
      return;
    }

    applyMutation.mutate(
      { taskId: Number(id), message: applicationMessage },
      {
        onSuccess: () => {
          toast.success('✅ Application submitted! The task owner will review your application.');
          setShowApplicationForm(false);
          setApplicationMessage('');
          setTimeout(() => {
            navigate('/tasks');
          }, 2000);
        },
        onError: (error: any) => {
          console.error('Error applying to task:', error);
          toast.error(error?.response?.data?.error || 'Failed to apply. Please try again.');
        }
      }
    );
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      setAcceptingId(applicationId);
      await acceptApplication(Number(id), applicationId);
      toast.success('🎉 Application accepted! The task has been assigned.');
      refetchTask();
      fetchApplications();
    } catch (error: any) {
      console.error('Error accepting application:', error);
      toast.error(error?.response?.data?.error || 'Failed to accept application');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;

    try {
      setRejectingId(applicationId);
      await rejectApplication(Number(id), applicationId);
      toast.success('Application rejected');
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error?.response?.data?.error || 'Failed to reject application');
    } finally {
      setRejectingId(null);
    }
  };

  const handleMarkDone = async () => {
    try {
      setActionLoading(true);
      await markTaskDone(Number(id));
      toast.success('Task marked as done! Waiting for creator confirmation.');
      refetchTask();
    } catch (error: any) {
      console.error('Error marking task done:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark task as done');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDone = async () => {
    try {
      setActionLoading(true);
      await confirmTaskCompletion(Number(id));
      toast.success('Task completed! You can now leave a review.');
      refetchTask();
    } catch (error: any) {
      console.error('Error confirming task:', error);
      toast.error(error?.response?.data?.error || 'Failed to confirm task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt('Please provide a reason for the dispute:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await disputeTask(Number(id), reason);
      toast.warning('Task has been disputed. Please resolve with the worker.');
      refetchTask();
    } catch (error: any) {
      console.error('Error disputing task:', error);
      toast.error(error?.response?.data?.error || 'Failed to dispute task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;

    try {
      setActionLoading(true);
      await cancelTask(Number(id));
      toast.success('Task cancelled.');
      refetchTask();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error?.response?.data?.error || 'Failed to cancel task');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'open': 'Open',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending_confirmation': 'Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed',
    };
    return labels[status] || status;
  };

  const getDifficultyLabel = (priority: string) => {
    const map: Record<string, string> = {
      'low': 'Easy',
      'easy': 'Easy',
      'normal': 'Medium',
      'medium': 'Medium',
      'high': 'Hard',
      'hard': 'Hard',
    };
    return map[priority?.toLowerCase()] || 'Medium';
  };

  const renderStars = (rating: number | undefined, interactive = false) => {
    if (rating === undefined && !interactive) return null;
    const displayRating = interactive ? (hoverRating || reviewRating) : (rating || 0);
    
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

  // Render Recommended Helpers Section
  const renderRecommendedHelpers = () => {
    if (!task || task.status !== 'open' || user?.id !== task.creator_id) return null;
    
    if (helpersLoading) {
      return (
        <div className="mt-4 bg-white rounded-xl shadow p-4 text-center">
          <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Finding helpers nearby...</p>
        </div>
      );
    }
    
    if (recommendedHelpers.length === 0) return null;

    return (
      <div className="mt-4 bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="font-bold">Recommended Helpers</h2>
              <p className="text-amber-100 text-xs">
                {recommendedHelpers.length} offering {getCategoryLabel(task.category)} nearby
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedHelpers.slice(0, 4).map(helper => (
              <div key={helper.id} className="border border-gray-200 rounded-lg p-3 hover:border-amber-300 hover:shadow transition-all">
                <div className="flex items-center gap-2 mb-2">
                  {helper.creator_avatar ? (
                    <img 
                      src={helper.creator_avatar} 
                      alt={helper.creator_name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-amber-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {helper.creator_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/users/${helper.creator_id}`}
                      className="font-medium text-gray-900 hover:text-amber-600 truncate block text-sm"
                    >
                      {helper.creator_name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-xs">
                        {'★'.repeat(Math.floor(helper.creator_rating || 0))}
                        {'☆'.repeat(5 - Math.floor(helper.creator_rating || 0))}
                      </span>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold text-sm">
                    €{helper.price || 0}
                  </span>
                </div>

                <button
                  onClick={() => handleContactHelper(helper)}
                  className="w-full bg-amber-500 text-white py-1.5 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  💬 Contact
                </button>
              </div>
            ))}
          </div>

          {recommendedHelpers.length > 4 && (
            <div className="mt-3 text-center">
              <Link 
                to={`/tasks?tab=offerings&category=${task.category}`}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                View all {recommendedHelpers.length} helpers →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReviewSection = () => {
    if (task?.status !== 'completed') return null;

    return (
      <div className="mt-4 bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          ⭐ Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
          )}
        </h2>

        {canReview?.can_review && (
          <div className="mb-4">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center hover:bg-yellow-100 transition-colors"
              >
                <span className="font-medium text-yellow-700">
                  ⭐ Leave a review for {canReview.reviewee?.username}
                </span>
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Review for {canReview.reviewee?.username}
                </h3>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Rating</label>
                  {renderStars(reviewRating, true)}
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Comment (optional)</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[80px] text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 font-medium text-sm"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewContent('');
                      setReviewRating(5);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {canReview && !canReview.can_review && canReview.existing_review && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 flex items-center gap-2 text-sm">
              <span>✅</span> You've already reviewed this task
            </p>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <span className="text-3xl mb-2 block">💬</span>
            <p className="text-gray-500 text-sm">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {review.reviewer?.profile_picture_url ? (
                      <img
                        src={review.reviewer.profile_picture_url}
                        alt={review.reviewer.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-medium text-sm">
                        {review.reviewer?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/users/${review.reviewer_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 text-sm"
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
                      <p className="text-gray-700 mt-1 text-sm">{review.content}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">This job may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === task.creator_id;
  const isAssigned = user?.id === task.assigned_to_id;
  const canApply = isAuthenticated && !isCreator && task.status === 'open';
  const canMarkDone = isAssigned && (task.status === 'assigned' || task.status === 'in_progress');
  const canConfirm = isCreator && task.status === 'pending_confirmation';
  const canDispute = isCreator && task.status === 'pending_confirmation';
  const canCancel = isCreator && task.status === 'open';
  const canEdit = isCreator && task.status === 'open';
  const showApplications = isCreator && task.status === 'open';

  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);

  // Build SEO description
  const seoDescription = `${categoryLabel} job${task.budget ? ` - €${task.budget}` : ''}${task.location ? ` in ${task.location}` : ''}. ${task.description?.substring(0, 100)}...`;

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-6">
      {/* SEO Meta Tags */}
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
      />

      {/* Constrained width container - max 672px */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/tasks" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4 text-sm">
          <span className="mr-1">←</span> Back to Jobs
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Header - Blue Gradient - Compact */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-5 text-white relative">
            {/* Share Button - Top Right */}
            <div className="absolute top-3 right-3">
              <ShareButton
                url={`/tasks/${task.id}`}
                title={task.title}
                description={`${categoryLabel} job - €${task.budget || 0}`}
                size="sm"
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
              />
            </div>

            <div className="flex justify-between items-start gap-4 pr-10">
              {/* Left side - Category and Title */}
              <div className="flex-1 min-w-0">
                {/* Category Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium mb-2">
                  <span>{categoryIcon}</span>
                  {categoryLabel}
                </span>
                
                {/* Title */}
                <h1 className="text-xl md:text-2xl font-bold leading-tight">
                  {task.title}
                </h1>
                
                {/* Status indicators row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full">
                    {getDifficultyLabel(task.priority || 'normal')}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="px-2 py-0.5 bg-green-500/80 rounded-full">
                    {getStatusLabel(task.status)}
                  </span>
                  {task.is_urgent && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="px-2 py-0.5 bg-indigo-600 rounded-full">
                        ⚡ Urgent
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right side - Price */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl md:text-3xl font-bold">
                  €{task.budget || 0}
                </div>
                <span className="text-blue-100 text-xs">Budget</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Profile Card */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${task.creator_id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm">
                  {task.creator_name || 'Unknown'}
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={0} size="sm" />
                  <span className="text-gray-400 text-xs">0.0 (0)</span>
                </div>
              </div>
              
              {/* Action button in profile */}
              {!isCreator && task.status === 'open' && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Apply Now
                </button>
              )}
              {isCreator && canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="px-3 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  ✏️ Edit
                </Link>
              )}
            </div>

            {/* Info Grid - Compact */}
            <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-xl mb-0.5">💰</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Budget</div>
                <div className="font-bold text-sm text-gray-900">€{task.budget || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-0.5">📊</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Difficulty</div>
                <div className="font-bold text-sm text-gray-900">{getDifficultyLabel(task.priority || 'normal')}</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-0.5">📅</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Deadline</div>
                <div className="font-bold text-sm text-gray-900">
                  {task.deadline 
                    ? new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'Flexible'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-0.5">⚡</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Status</div>
                <div className="font-bold text-sm text-gray-900">{getStatusLabel(task.status)}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 mb-2">About this job</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>

            {/* Assigned Worker Info */}
            {task.assigned_to_name && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛠️</span>
                  <div>
                    <p className="text-xs text-blue-600">Assigned to</p>
                    <Link to={`/users/${task.assigned_to_id}`} className="font-semibold text-blue-800 hover:underline text-sm">
                      {task.assigned_to_name}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Applications Section */}
            {showApplications && (
              <div className="mb-4">
                <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  📩 Applications
                  <span className="text-sm font-normal text-gray-500">({applications.length})</span>
                </h2>

                {applicationsLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <span className="text-3xl mb-2 block">📭</span>
                    <p className="text-gray-500 text-sm">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications.map(application => (
                      <div 
                        key={application.id} 
                        className={`border rounded-lg p-3 ${
                          application.status === 'pending' ? 'border-blue-200 bg-blue-50' 
                          : application.status === 'accepted' ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {application.applicant_avatar ? (
                                <img src={application.applicant_avatar} alt="" className="w-full h-full object-cover"/>
                              ) : (
                                <span className="text-gray-500 font-medium text-xs">{application.applicant_name?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Link to={`/users/${application.applicant_id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                                  {application.applicant_name}
                                </Link>
                                {application.status === 'pending' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">Pending</span>
                                )}
                                {application.status === 'accepted' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">✓ Accepted</span>
                                )}
                              </div>
                              {application.message && (
                                <p className="mt-1.5 text-xs text-gray-600 bg-white p-2 rounded border">{application.message}</p>
                              )}
                            </div>
                          </div>
                          {application.status === 'pending' && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button 
                                onClick={() => handleAcceptApplication(application.id)} 
                                disabled={acceptingId === application.id} 
                                className="px-2.5 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-400 font-medium"
                              >
                                {acceptingId === application.id ? '...' : 'Accept'}
                              </button>
                              <button 
                                onClick={() => handleRejectApplication(application.id)} 
                                disabled={rejectingId === application.id} 
                                className="px-2.5 py-1.5 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300"
                              >
                                ✕
                              </button>
                              <button 
                                onClick={() => handleMessageApplicant(application.applicant_id)} 
                                className="px-2 py-1.5 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                              >
                                💬
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Application Form */}
            {showApplicationForm && canApply && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Apply for this job</h3>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Introduce yourself briefly..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyTask}
                    disabled={applyMutation.isPending}
                    className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-sm"
                  >
                    {applyMutation.isPending ? 'Submitting...' : '✓ Submit Application'}
                  </button>
                  <button
                    onClick={() => { setShowApplicationForm(false); setApplicationMessage(''); }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Location Map */}
            {task.latitude && task.longitude && (
              <div className="mb-4">
                <h2 className="font-bold text-gray-900 mb-2">Location</h2>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                  <span>📍</span>
                  {task.location || 'Location not specified'}
                </p>
                <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[task.latitude, task.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[task.latitude, task.longitude]} icon={taskIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{task.title}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <a 
                  href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2">
              {canApply && !showApplicationForm && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  ✓ Apply for This Job
                </button>
              )}
              
              {canMarkDone && (
                <button
                  onClick={handleMarkDone}
                  disabled={actionLoading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
                >
                  {actionLoading ? 'Processing...' : '✓ Mark as Done'}
                </button>
              )}

              {canConfirm && (
                <button
                  onClick={handleConfirmDone}
                  disabled={actionLoading}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold"
                >
                  {actionLoading ? 'Processing...' : '✓ Confirm Completed'}
                </button>
              )}

              {canDispute && (
                <button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold"
                >
                  ⚠️ Dispute
                </button>
              )}

              {!isCreator && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="block w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center text-sm"
                >
                  👤 View Profile
                </Link>
              )}

              {!isAuthenticated && task.status === 'open' && (
                <Link 
                  to="/login" 
                  className="block w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold text-center"
                >
                  Login to Apply
                </Link>
              )}
            </div>

            {/* Cancel Task */}
            {canCancel && (
              <div className="mt-3 text-center">
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Cancel Task
                </button>
              </div>
            )}

            {/* Status Messages */}
            {isCreator && task.status === 'assigned' && (
              <div className="mt-4 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-center text-sm">
                ⏳ Waiting for worker to complete
              </div>
            )}
            {isAssigned && task.status === 'pending_confirmation' && (
              <div className="mt-4 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg text-center text-sm">
                ⏳ Waiting for confirmation
              </div>
            )}
            {task.status === 'completed' && (
              <div className="mt-4 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-center text-sm">
                ✅ Task completed
              </div>
            )}
            {task.status === 'cancelled' && (
              <div className="mt-4 text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-center text-sm">
                ❌ Task cancelled
              </div>
            )}
          </div>
        </div>

        {/* Recommended Helpers */}
        {renderRecommendedHelpers()}

        {/* Reviews */}
        {renderReviewSection()}

        {/* How it works - Compact */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">💡 How it works</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-500">1.</span>
              <span>Apply with a brief introduction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-500">2.</span>
              <span>Owner reviews and accepts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-500">3.</span>
              <span>Complete and mark done</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-500">4.</span>
              <span>Get paid after confirmation</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
