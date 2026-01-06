import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTask, Task, TaskApplication, applyToTask, getTaskApplications, acceptApplication, rejectApplication, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask } from '../api/tasks';
import { getOfferings, Offering } from '../api/offerings';
import { startConversation } from '../api/messages';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import apiClient from '../api/client';

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
  const [task, setTask] = useState<Task | null>(null);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

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

  const fetchTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTask(Number(id));
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

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

    try {
      setActionLoading(true);
      await applyToTask(Number(id), applicationMessage);
      toast.success('✅ Application submitted! The task owner will review your application.');
      setShowApplicationForm(false);
      setApplicationMessage('');
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
    } catch (error: any) {
      console.error('Error applying to task:', error);
      toast.error(error?.response?.data?.error || 'Failed to apply. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      setAcceptingId(applicationId);
      await acceptApplication(Number(id), applicationId);
      toast.success('🎉 Application accepted! The task has been assigned.');
      fetchTask();
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
      fetchTask();
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
      fetchTask();
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
      fetchTask();
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
      fetchTask();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error?.response?.data?.error || 'Failed to cancel task');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-green-500 text-white',
      'assigned': 'bg-yellow-500 text-white',
      'in_progress': 'bg-blue-400 text-white',
      'pending_confirmation': 'bg-purple-500 text-white',
      'completed': 'bg-gray-500 text-white',
      'cancelled': 'bg-red-500 text-white',
      'disputed': 'bg-orange-500 text-white',
    };
    const labels: Record<string, string> = {
      'open': 'Open',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending_confirmation': 'Pending Confirmation',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Difficulty badge - matches "How hard is this task?" from create form
  // Maps: easy, medium, hard (stored as priority: low, normal, high in DB)
  const getDifficultyBadge = (priority: string) => {
    // Map old priority values to new difficulty labels
    const difficultyMap: Record<string, { label: string; icon: string; style: string }> = {
      'low': { label: 'Easy', icon: '🟢', style: 'bg-green-500/20 text-white' },
      'easy': { label: 'Easy', icon: '🟢', style: 'bg-green-500/20 text-white' },
      'normal': { label: 'Medium', icon: '🟡', style: 'bg-yellow-500/20 text-white' },
      'medium': { label: 'Medium', icon: '🟡', style: 'bg-yellow-500/20 text-white' },
      'high': { label: 'Hard', icon: '🔴', style: 'bg-red-500/20 text-white' },
      'hard': { label: 'Hard', icon: '🔴', style: 'bg-red-500/20 text-white' },
    };
    
    const difficulty = difficultyMap[priority?.toLowerCase()] || difficultyMap['normal'];
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficulty.style}`}>
        {difficulty.icon} {difficulty.label}
      </span>
    );
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

    return (
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="text-lg font-bold">Recommended Helpers</h2>
              <p className="text-amber-100 text-sm">
                People offering <strong>{getCategoryLabel(task.category)}</strong> services near your job location
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>💡 How matching works:</strong> We found helpers who offer <strong>{getCategoryLabel(task.category)}</strong> services within 50km of your job. 
              Contact them directly or wait for applications!
            </p>
          </div>

          {helpersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Finding helpers...</p>
            </div>
          ) : recommendedHelpers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-gray-600 font-medium">No helpers found yet</p>
              <p className="text-sm text-gray-500 mt-1">
                No one is offering {getCategoryLabel(task.category)} services in this area yet.
                <br />Don't worry — people can still apply to your job!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedHelpers.map(helper => (
                <div key={helper.id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {helper.creator_avatar ? (
                      <img 
                        src={helper.creator_avatar} 
                        alt={helper.creator_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-bold">
                        {helper.creator_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/users/${helper.creator_id}`}
                        className="font-medium text-gray-900 hover:text-amber-600 truncate block"
                      >
                        {helper.creator_name}
                      </Link>
                      {helper.creator_rating !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-sm">
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
                    className="font-medium text-gray-800 hover:text-amber-600 line-clamp-1 block mb-2"
                  >
                    {helper.title}
                  </Link>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-green-600 font-semibold">
                      €{helper.price || 0}
                      {helper.price_type === 'hourly' && '/hr'}
                    </span>
                    {helper.distance && (
                      <span className="text-gray-500">
                        📍 {helper.distance.toFixed(1)}km away
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
          )}

          {recommendedHelpers.length > 0 && (
            <div className="mt-4 text-center">
              <Link 
                to={`/tasks?tab=offerings&category=${task.category}`}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Browse all {getCategoryLabel(task.category)} offerings →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReviewSection = () => {
    if (task?.status !== 'completed') return null;

    const isCreator = user?.id === task.creator_id;
    const isWorker = user?.id === task.assigned_to_id;
    const isInvolved = isCreator || isWorker;

    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          ⭐ Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
          )}
        </h2>

        {canReview?.can_review && (
          <div className="mb-6">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-yellow-50 border-2 border-yellow-200 border-dashed rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors"
              >
                <span className="text-2xl mb-2 block">⭐</span>
                <span className="font-medium text-yellow-700">
                  Leave a review for {canReview.reviewee?.username}
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
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 flex items-center gap-2">
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
                      <span className="text-gray-500 text-sm">
                        {review.reviewer?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
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
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <p className="text-gray-600 mb-4">This task may have been removed or doesn't exist.</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Browse Tasks
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
  const canMessageCreator = isAuthenticated && !isCreator && task.creator_id;
  const showApplications = isCreator && task.status === 'open';
  const pendingApplications = applications.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Back link - outside header box */}
        <Link to="/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* HEADER BOX - Rounded like Offering page */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Category icon + badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                <span className="bg-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                  {getCategoryLabel(task.category)}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-xl font-bold leading-tight mb-2">{task.title}</h1>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {getStatusBadge(task.status)}
                {getDifficultyBadge(task.priority || 'normal')}
                {task.is_urgent && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500">⚡ Urgent</span>
                )}
                {showApplications && pendingApplications.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white text-blue-600">
                    📩 {pendingApplications.length}
                  </span>
                )}
              </div>
            </div>

            {/* Budget */}
            {task.budget && (
              <div className="text-right flex-shrink-0">
                <p className="text-blue-200 text-[10px] uppercase tracking-wider">Budget</p>
                <p className="text-2xl font-bold">€{task.budget}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* User row */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <Link to={`/users/${task.creator_id}`} className="font-medium text-gray-900 hover:text-blue-600">
                  {task.creator_name || 'Unknown'}
                </Link>
                <p className="text-sm text-gray-500">☆☆☆☆☆ 0.0 (0 reviews)</p>
              </div>
            </div>
            {canMessageCreator && (
              <button
                onClick={handleMessageCreator}
                disabled={messageLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium flex items-center gap-2"
              >
                💬 Contact
              </button>
            )}
          </div>

          {/* Description */}
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-2">About this job</h2>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Deadline / Assigned */}
          {(task.deadline || task.assigned_to_name) && (
            <div className="px-4 pb-4 space-y-2">
              {task.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <span>📅</span>
                  <span className="text-gray-600">
                    Deadline: {new Date(task.deadline).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {task.assigned_to_name && (
                <div className="flex items-center gap-2 text-sm">
                  <span>🛠️</span>
                  <span className="text-gray-600">Assigned to: </span>
                  <Link to={`/users/${task.assigned_to_id}`} className="text-blue-600 hover:underline">
                    {task.assigned_to_name}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Applications Section */}
          {showApplications && (
            <div className="border-t p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📩 Applications
                {pendingApplications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {pendingApplications.length} pending
                  </span>
                )}
              </h2>

              {applicationsLoading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">📭</div>
                  <p className="text-gray-500 text-sm">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(application => (
                    <div 
                      key={application.id} 
                      className={`border rounded-lg p-3 ${
                        application.status === 'pending' ? 'border-blue-200 bg-blue-50' 
                        : application.status === 'accepted' ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {application.applicant_avatar ? (
                              <img src={application.applicant_avatar} alt="" className="w-full h-full rounded-full object-cover"/>
                            ) : (
                              <span className="text-gray-400 text-sm">{application.applicant_name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={`/users/${application.applicant_id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                                {application.applicant_name}
                              </Link>
                              {application.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">⏳ Pending</span>
                              )}
                              {application.status === 'accepted' && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✅ Accepted</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span>☆☆☆☆☆ {application.applicant_rating || 0}</span>
                              <span>•</span>
                              <span>{application.applicant_completed_tasks || 0} tasks completed</span>
                            </div>
                            {application.message && (
                              <p className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">{application.message}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Applied {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {application.status === 'pending' && (
                            <>
                              <button onClick={() => handleAcceptApplication(application.id)} disabled={acceptingId === application.id} className="px-2.5 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 font-medium">
                                {acceptingId === application.id ? '...' : '✓ Accept'}
                              </button>
                              <button onClick={() => handleRejectApplication(application.id)} disabled={rejectingId === application.id} className="px-2.5 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                                Reject
                              </button>
                              <button onClick={() => handleMessageApplicant(application.applicant_id)} className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                💬 Message
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

          {/* Actions */}
          <div className="border-t p-4 space-y-2">
            {canApply && (
              !showApplicationForm ? (
                <button onClick={() => setShowApplicationForm(true)} className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 font-medium">
                  📝 Apply for This Job
                </button>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <textarea value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} placeholder="Introduce yourself..." className="w-full px-3 py-2 border rounded-lg mb-2 text-sm min-h-[80px]" />
                  <div className="flex gap-2">
                    <button onClick={handleApplyTask} disabled={actionLoading} className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium text-sm">
                      {actionLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button onClick={() => { setShowApplicationForm(false); setApplicationMessage(''); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )
            )}

            {canMarkDone && (
              <button onClick={handleMarkDone} disabled={actionLoading} className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium">
                {actionLoading ? 'Processing...' : '✓ Mark as Done'}
              </button>
            )}

            {canConfirm && (
              <button onClick={handleConfirmDone} disabled={actionLoading} className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium">
                {actionLoading ? 'Processing...' : '✓ Confirm Completed'}
              </button>
            )}

            {canDispute && (
              <button onClick={handleDispute} disabled={actionLoading} className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-medium">
                {actionLoading ? 'Processing...' : '⚠️ Dispute'}
              </button>
            )}

            {canEdit && (
              <Link to={`/tasks/${task.id}/edit`} className="block w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium text-center">
                ✏️ Edit Task
              </Link>
            )}

            {canCancel && (
              <button onClick={handleCancel} disabled={actionLoading} className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg hover:bg-red-200 font-medium">
                Cancel Task
              </button>
            )}

            {!isAuthenticated && task.status === 'open' && (
              <Link to="/login" className="block w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 font-medium text-center">
                Login to Apply
              </Link>
            )}

            {/* Status messages */}
            {isCreator && task.status === 'assigned' && (
              <div className="text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg text-sm">⏳ Waiting for worker to complete</div>
            )}
            {isAssigned && task.status === 'pending_confirmation' && (
              <div className="text-purple-700 bg-purple-50 px-3 py-2 rounded-lg text-sm">⏳ Waiting for confirmation</div>
            )}
            {task.status === 'completed' && (
              <div className="text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm">✅ Task completed</div>
            )}
            {task.status === 'cancelled' && (
              <div className="text-gray-600 bg-gray-100 px-3 py-2 rounded-lg text-sm">❌ Task cancelled</div>
            )}
          </div>
        </div>

        {/* Recommended Helpers */}
        {renderRecommendedHelpers()}

        {/* Reviews */}
        {renderReviewSection()}

        {/* Location */}
        {task.latitude && task.longitude && (
          <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 pb-2">
              <h2 className="font-semibold text-gray-900 mb-1">🗺️ Location</h2>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <span className="text-red-500">📍</span>
                {task.location}
              </p>
            </div>
            <div className="h-48">
              <MapContainer center={[task.latitude, task.longitude]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[task.latitude, task.longitude]}>
                  <Popup><p className="font-medium text-sm">{task.title}</p></Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="p-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">Lat: {task.latitude.toFixed(4)}, Lng: {task.longitude.toFixed(4)}</p>
              <a href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                Open in Google Maps →
              </a>
            </div>
          </div>
        )}

        {/* Stats Bar - Only 3 items for Jobs (no Range) */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg">💰</div>
              <p className="text-[10px] text-gray-500">Budget</p>
              <p className="font-bold text-sm text-gray-900">€{task.budget || 0}</p>
            </div>
            <div>
              <div className="text-lg">📁</div>
              <p className="text-[10px] text-gray-500">Category</p>
              <p className="font-bold text-sm text-gray-900">{getCategoryLabel(task.category)}</p>
            </div>
            <div>
              <div className="text-lg">📅</div>
              <p className="text-[10px] text-gray-500">Posted</p>
              <p className="font-bold text-sm text-gray-900">{task.created_at && new Date(task.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="mt-4 flex gap-3">
          {canMessageCreator && (
            <button onClick={handleMessageCreator} disabled={messageLoading} className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2">
              💬 Contact {task.creator_name}
            </button>
          )}
          <Link to={`/users/${task.creator_id}`} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2">
            👤 View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
