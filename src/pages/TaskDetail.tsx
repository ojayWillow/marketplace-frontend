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
  
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  
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
            className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
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
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 text-center">
          <div className="animate-spin h-6 w-6 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Finding helpers nearby...</p>
        </div>
      );
    }
    
    if (recommendedHelpers.length === 0) return null;

    return (
      <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="text-lg font-bold">Recommended Helpers</h2>
              <p className="text-amber-100 text-sm">
                {recommendedHelpers.length} people offering {getCategoryLabel(task.category)} services nearby
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedHelpers.map(helper => (
              <div key={helper.id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  {helper.creator_avatar ? (
                    <img 
                      src={helper.creator_avatar} 
                      alt={helper.creator_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
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
                    {helper.creator_rating !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">
                          {'★'.repeat(Math.floor(helper.creator_rating))}
                          {'☆'.repeat(5 - Math.floor(helper.creator_rating))}
                        </span>
                        <span className="text-xs text-gray-500">({helper.creator_review_count || 0})</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link 
                  to={`/offerings/${helper.id}`}
                  className="font-medium text-gray-800 hover:text-amber-600 line-clamp-1 block mb-2 text-sm"
                >
                  {helper.title}
                </Link>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-green-600 font-semibold">
                    €{helper.price || 0}
                    {helper.price_type === 'hourly' && '/hr'}
                  </span>
                  {helper.distance && (
                    <span className="text-gray-500 text-xs">
                      📍 {helper.distance.toFixed(1)}km
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleContactHelper(helper)}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  💬 Contact
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link 
              to={`/tasks?tab=offerings&category=${task.category}`}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              Browse all {getCategoryLabel(task.category)} offerings →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewSection = () => {
    if (task?.status !== 'completed') return null;

    return (
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
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
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors"
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
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Rating</label>
                  {renderStars(reviewRating, true)}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Comment (optional)</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 font-medium"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewContent('');
                      setReviewRating(5);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <span className="text-4xl mb-2 block">💬</span>
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
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

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-sm">
                        <Link
                          to={`/users/${review.reviewer_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {review.reviewer?.username || 'Unknown'}
                        </Link>
                        <span className="text-gray-400 mx-2">→</span>
                        <Link
                          to={`/users/${review.reviewed_user_id}`}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          {review.reviewed_user?.username || 'Unknown'}
                        </Link>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-lg ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">This job may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
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
    <div className="min-h-screen bg-gray-50 py-8">
      {/* SEO Meta Tags */}
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <span className="mr-2">←</span> Back to Jobs
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header - Blue Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{categoryIcon}</span>
                <div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {categoryLabel}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold mt-2">{task.title}</h1>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-3xl font-bold">
                  €{task.budget || 0}
                </div>
                <span className="text-blue-100 text-sm">Budget</span>
                {task.is_urgent && (
                  <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">
                    ⚡ Urgent
                  </span>
                )}
                {/* Share Button */}
                <ShareButton
                  url={`/tasks/${task.id}`}
                  title={task.title}
                  description={`${categoryLabel} job - €${task.budget || 0}${task.location ? ` in ${task.location}` : ''}`}
                  size="sm"
                  className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/users/${task.creator_id}`} className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                  {task.creator_name || 'Unknown'}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={0} />
                  <span className="text-gray-500">0.0 (0 reviews)</span>
                </div>
              </div>
              {!isCreator && task.status === 'open' && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  ✓ Apply Now
                </button>
              )}
              {isCreator && (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  This is your job posting
                </span>
              )}
            </div>

            {/* Details Grid - 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm text-gray-500">Budget</div>
                <div className="font-semibold">€{task.budget || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm text-gray-500">Difficulty</div>
                <div className="font-semibold">{getDifficultyLabel(task.priority || 'normal')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-semibold">
                  {task.deadline 
                    ? new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'Flexible'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-semibold">{getStatusLabel(task.status)}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this job</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>

            {/* Assigned Worker Info */}
            {task.assigned_to_name && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛠️</span>
                  <div>
                    <p className="text-sm text-blue-600">Assigned to</p>
                    <Link to={`/users/${task.assigned_to_id}`} className="font-semibold text-blue-800 hover:underline">
                      {task.assigned_to_name}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Applications Section */}
            {showApplications && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📩 Applications
                  <span className="text-sm font-normal text-gray-500">({applications.length})</span>
                </h2>

                {applicationsLoading ? (
                  <div className="text-center py-6 text-gray-500">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p className="text-gray-500">No applications yet</p>
                    <p className="text-sm text-gray-400 mt-1">Share your job to get more applicants!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(application => (
                      <div 
                        key={application.id} 
                        className={`border rounded-lg p-4 ${
                          application.status === 'pending' ? 'border-blue-200 bg-blue-50' 
                          : application.status === 'accepted' ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {application.applicant_avatar ? (
                                <img src={application.applicant_avatar} alt="" className="w-full h-full object-cover"/>
                              ) : (
                                <span className="text-gray-500 font-medium">{application.applicant_name?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link to={`/users/${application.applicant_id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                  {application.applicant_name}
                                </Link>
                                {application.status === 'pending' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                                )}
                                {application.status === 'accepted' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✓ Accepted</span>
                                )}
                              </div>
                              {application.message && (
                                <p className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-lg border">{application.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {application.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleAcceptApplication(application.id)} 
                                  disabled={acceptingId === application.id} 
                                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium"
                                >
                                  {acceptingId === application.id ? '...' : 'Accept'}
                                </button>
                                <button 
                                  onClick={() => handleRejectApplication(application.id)} 
                                  disabled={rejectingId === application.id} 
                                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleMessageApplicant(application.applicant_id)} 
                                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                >
                                  💬
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Application Form */}
            {showApplicationForm && canApply && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Apply for this job</h3>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a good fit for this job..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleApplyTask}
                    disabled={applyMutation.isPending}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
                  >
                    {applyMutation.isPending ? 'Submitting...' : '✓ Submit Application'}
                  </button>
                  <button
                    onClick={() => { setShowApplicationForm(false); setApplicationMessage(''); }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Location Map */}
            {task.latitude && task.longitude && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <span>📍</span>
                  <span>{task.location || 'Location not specified'}</span>
                </div>
                <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
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
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-gray-500">Job location</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-2 text-center">
                  <a 
                    href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {canApply && !showApplicationForm && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
                >
                  ✓ Apply for This Job
                </button>
              )}
              
              {canMarkDone && (
                <button
                  onClick={handleMarkDone}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-lg"
                >
                  {actionLoading ? 'Processing...' : '✓ Mark as Done'}
                </button>
              )}

              {canConfirm && (
                <button
                  onClick={handleConfirmDone}
                  disabled={actionLoading}
                  className="flex-1 bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold text-lg"
                >
                  {actionLoading ? 'Processing...' : '✓ Confirm Completed'}
                </button>
              )}

              {canDispute && (
                <button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  className="px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-medium"
                >
                  ⚠️ Dispute
                </button>
              )}

              {canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  ✏️ Edit Task
                </Link>
              )}

              {!isCreator && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  👤 View Profile
                </Link>
              )}
            </div>

            {/* Cancel Task */}
            {canCancel && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Task
                </button>
              </div>
            )}

            {/* Status Messages */}
            {isCreator && task.status === 'assigned' && (
              <div className="mt-4 text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg text-center">
                ⏳ Waiting for worker to complete the task
              </div>
            )}
            {isAssigned && task.status === 'pending_confirmation' && (
              <div className="mt-4 text-purple-700 bg-purple-50 border border-purple-200 px-4 py-3 rounded-lg text-center">
                ⏳ Waiting for task owner to confirm completion
              </div>
            )}
            {task.status === 'completed' && (
              <div className="mt-4 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-center">
                ✅ This task has been completed
              </div>
            )}
            {task.status === 'cancelled' && (
              <div className="mt-4 text-gray-600 bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg text-center">
                ❌ This task has been cancelled
              </div>
            )}

            {!isAuthenticated && task.status === 'open' && (
              <div className="mt-4">
                <Link 
                  to="/login" 
                  className="block w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 font-semibold text-lg text-center"
                >
                  Login to Apply
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Helpers */}
        {renderRecommendedHelpers()}

        {/* Reviews */}
        {renderReviewSection()}

        {/* How it works */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">💡 How it works</h3>
          <ul className="text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Apply for the job with a brief introduction</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Task owner reviews applications and accepts the best fit</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Complete the task and mark it as done</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Get paid after the task owner confirms completion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
