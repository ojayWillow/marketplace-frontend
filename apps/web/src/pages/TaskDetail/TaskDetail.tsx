import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

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

import { TaskApplication, getTaskApplications } from '@marketplace/shared';
import { getOfferings, Offering } from '@marketplace/shared';
import { useTask, useApplyToTask } from '../../api/hooks';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { getCategoryLabel, getCategoryIcon } from '../../constants/categories';
import { apiClient } from '@marketplace/shared';
import SEOHead from '../../components/ui/SEOHead';
import ShareButton from '../../components/ui/ShareButton';

// Local components
import {
  TaskLocationMap,
  TaskApplications,
  TaskActionButtons,
  TaskReviews,
  RecommendedHelpers,
} from './components';
import { useTaskActions } from './hooks';
import { Review, CanReviewResponse } from './types';

// StarRating helper component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <span className="text-yellow-500 text-sm">
      {'\u2605'.repeat(fullStars)}
      {hasHalfStar && '\u00bd'}
      {'\u2606'.repeat(emptyStars)}
    </span>
  );
};

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  
  // React Query for task data
  const { data: task, isLoading: loading, refetch: refetchTask } = useTask(Number(id));
  const applyMutation = useApplyToTask();
  
  // Local state
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  
  // Recommended helpers state
  const [recommendedHelpers, setRecommendedHelpers] = useState<Offering[]>([]);
  const [helpersLoading, setHelpersLoading] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState<CanReviewResponse | null>(null);

  // Fetch applications
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

  // Task actions hook
  const {
    actionLoading,
    acceptingId,
    rejectingId,
    handleMarkDone,
    handleConfirmDone,
    handleDispute,
    handleCancel,
    handleAcceptApplication,
    handleRejectApplication,
    handleMessageApplicant,
    handleContactHelper,
  } = useTaskActions({
    taskId: Number(id),
    task,
    refetchTask,
    fetchApplications,
    isAuthenticated,
  });

  // Fetch recommended helpers
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

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/task/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Check if user can review
  const checkCanReview = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/task/${id}/can-review`);
      setCanReview(response.data);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  // Effects
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

  // Handle apply to task
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
          toast.success('\u2705 Application submitted! The task owner will review your application.');
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading job...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">\ud83d\ude15</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">This job may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Computed values
  const isCreator = user?.id === task.creator_id;
  const isAssigned = user?.id === task.assigned_to_id;
  const canApply = isAuthenticated && !isCreator && task.status === 'open';
  const canEdit = isCreator && task.status === 'open';
  const showApplications = isCreator && task.status === 'open';
  const categoryLabel = getCategoryLabel(task.category);
  const categoryIcon = getCategoryIcon(task.category);
  const applicantCount = task.pending_applications_count || 0;
  const seoDescription = `${categoryLabel} job${task.budget ? ` - \u20ac${task.budget}` : ''}${task.location ? ` in ${task.location}` : ''}. ${task.description?.substring(0, 100)}...`;
  const postedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
      />

      {/* Slim top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link to="/tasks" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <ShareButton
            url={`/tasks/${task.id}`}
            title={task.title}
            description={`${categoryLabel} job - \u20ac${task.budget || 0}`}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Compact header */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcon}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {task.is_urgent && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    \ud83d\udd25 Urgent
                  </span>
                )}
              </div>
              <span className="text-xl font-black text-blue-600">\u20ac{task.budget || task.reward || 0}</span>
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h1>
          </div>

          {/* Compact profile row */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2.5">
              <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm">
                <Link to={`/users/${task.creator_id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                  {task.creator_name || 'Unknown'}
                </Link>
                <span className="text-gray-300">\u00b7</span>
                <StarRating rating={task.creator_rating || 0} />
                <span className="text-gray-400 text-xs">({task.creator_review_count || 0})</span>
              </div>
              {!isCreator && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 flex-shrink-0"
                >
                  View Profile
                </Link>
              )}
              {isCreator && canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 flex-shrink-0"
                >
                  \u270f\ufe0f Edit
                </Link>
              )}
            </div>
          </div>

          {/* Thin divider */}
          <div className="border-t border-gray-100 mx-4" />

          {/* Description */}
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Meta chips row — no duplicate location or budget */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {applicantCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  \ud83d\udc65 {applicantCount} applied
                </span>
              )}
              {applicantCount === 0 && task.status === 'open' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  \u2728 Be the first to apply
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                \u26a1 {task.difficulty || 'Normal'}
              </span>
              {postedDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  \ud83d\udcc5 {postedDate}
                </span>
              )}
            </div>
          </div>

          {/* Location map (single location display) */}
          <div className="px-4 pb-4">
            <TaskLocationMap task={task} />
          </div>

          {/* Assigned Worker Info */}
          {task.assigned_to_name && (
            <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">\ud83d\udee0\ufe0f</span>
                <div>
                  <p className="text-xs text-blue-600">Assigned to</p>
                  <Link to={`/users/${task.assigned_to_id}`} className="font-semibold text-sm text-blue-800 hover:underline">
                    {task.assigned_to_name}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Applications (Owner View) */}
          {showApplications && (
            <div className="px-4 pb-4">
              <TaskApplications
                applications={applications}
                applicationsLoading={applicationsLoading}
                acceptingId={acceptingId}
                rejectingId={rejectingId}
                onAccept={handleAcceptApplication}
                onReject={handleRejectApplication}
                onMessage={handleMessageApplicant}
              />
            </div>
          )}

          {/* Application Form */}
          {showApplicationForm && canApply && (
            <div className="mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Apply for this job</h3>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you're a good fit..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleApplyTask}
                  disabled={applyMutation.isPending}
                  className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-sm"
                >
                  {applyMutation.isPending ? 'Submitting...' : '\u2713 Submit Application'}
                </button>
                <button
                  onClick={() => { setShowApplicationForm(false); setApplicationMessage(''); }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {isCreator && task.status === 'assigned' && (
            <div className="mx-4 mb-4 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2.5 rounded-lg text-center text-sm">
              \u23f3 Waiting for worker to complete the task
            </div>
          )}
          {isAssigned && task.status === 'pending_confirmation' && (
            <div className="mx-4 mb-4 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2.5 rounded-lg text-center text-sm">
              \u23f3 Waiting for task owner to confirm completion
            </div>
          )}
          {task.status === 'completed' && (
            <div className="mx-4 mb-4 text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg text-center text-sm">
              \u2705 This task has been completed
            </div>
          )}
          {task.status === 'cancelled' && (
            <div className="mx-4 mb-4 text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2.5 rounded-lg text-center text-sm">
              \u274c This task has been cancelled
            </div>
          )}
        </div>

        {/* Recommended Helpers */}
        {task.status === 'open' && user?.id === task.creator_id && (
          <RecommendedHelpers
            task={task}
            helpers={recommendedHelpers}
            loading={helpersLoading}
            onContactHelper={handleContactHelper}
          />
        )}

        {/* Reviews */}
        {task.status === 'completed' && (
          <TaskReviews
            taskId={Number(id)}
            reviews={reviews}
            canReview={canReview}
            onReviewSubmitted={() => {
              fetchReviews();
              checkCanReview();
            }}
          />
        )}

        {/* How it works — collapsible */}
        <div className="mt-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
              \ud83d\udca1 How it works
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${howItWorksOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {howItWorksOpen && (
            <div className="px-4 pb-4">
              <ol className="text-gray-600 space-y-1.5 list-decimal list-inside text-sm">
                <li>Apply for the job with a brief introduction</li>
                <li>Task owner reviews applications and accepts the best fit</li>
                <li>Complete the task and mark it as done</li>
                <li>Get paid after the task owner confirms completion</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-3xl mx-auto">
          <TaskActionButtons
            task={task}
            isCreator={isCreator}
            isAssigned={isAssigned}
            isAuthenticated={isAuthenticated}
            actionLoading={actionLoading}
            showApplicationForm={showApplicationForm}
            onShowApplicationForm={() => setShowApplicationForm(true)}
            onMarkDone={handleMarkDone}
            onConfirmDone={handleConfirmDone}
            onDispute={handleDispute}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
