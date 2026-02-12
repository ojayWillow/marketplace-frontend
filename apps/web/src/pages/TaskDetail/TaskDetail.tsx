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
import { FEATURES } from '../../constants/featureFlags';

// Local components
import {
  TaskLocationMap,
  TaskApplications,
  TaskActionButtons,
  TaskReviews,
  RecommendedHelpers,
  ApplicationSheet,
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
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
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
  const [showApplicationSheet, setShowApplicationSheet] = useState(false);
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
  const handleApplyTask = (applicationMessage: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.warning('Please login to apply');
      navigate('/login');
      return;
    }
    applyMutation.mutate(
      { taskId: Number(id), message: applicationMessage },
      {
        onSuccess: () => {
          toast.success('Application submitted! The task owner will review your application.');
          setShowApplicationSheet(false);
          setTimeout(() => { navigate('/tasks'); }, 2000);
        },
        onError: (error: any) => {
          console.error('Error applying to task:', error);
          toast.error(error?.response?.data?.error || 'Failed to apply. Please try again.');
        }
      }
    );
  };

  // Handle message creator
  const handleMessageCreator = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to send a message');
      navigate('/login');
      return;
    }
    navigate(`/messages?userId=${task?.creator_id}`);
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
          <div className="text-5xl mb-3">😕</div>
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
  const budget = task.budget || task.reward || 0;
  const isUrgent = FEATURES.URGENT && task.is_urgent;
  const seoDescription = `${categoryLabel} job${task.budget ? ` - ${task.budget} EUR` : ''}${task.location ? ` in ${task.location}` : ''}. ${task.description?.substring(0, 100)}...`;
  const postedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const applicantLabel = applicantCount > 0 ? `${applicantCount} applied` : 'New';
  const shortLocation = task.location?.split(',').slice(0, 2).join(',').trim() || '';

  return (
    <div className="min-h-screen bg-gray-50 pb-36 md:pb-8">
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
      />

      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-50 md:static md:border-b-0">
        <div className="flex items-center justify-between px-4 py-2.5 md:max-w-2xl md:mx-auto md:py-4">
          <Link to="/tasks" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">← Back to Quick Help</span>
            <span className="md:hidden">Back</span>
          </Link>
          <ShareButton
            url={`/?task=${task.id}`}
            title={task.title}
            description={`${categoryLabel} job - ${budget} EUR`}
            categoryIcon={categoryIcon}
            categoryEmoji={categoryIcon}
            price={`€${budget}`}
            location={shortLocation}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3 md:max-w-2xl md:mx-auto md:pt-0">
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ===== DESKTOP HEADER: gradient banner ===== */}
          <div className="hidden md:block bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryIcon}</span>
                <span className="px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isUrgent && (
                  <span className="px-2.5 py-1 bg-red-500/80 rounded-full text-xs font-bold">⚡ Urgent</span>
                )}
              </div>
              <div className="text-2xl font-black">€{budget}</div>
            </div>
            <h1 className="text-xl font-bold leading-tight">{task.title}</h1>
          </div>

          {/* ===== MOBILE HEADER: compact inline ===== */}
          <div className="md:hidden p-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcon}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isUrgent && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Urgent</span>
                )}
              </div>
              <span className="text-xl font-black text-green-600">€{budget}</span>
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h1>
          </div>

          {/* Profile row */}
          <div className="px-4 pb-3 md:px-6 md:pt-5 md:pb-5 md:border-b md:border-gray-200">
            <div className="flex items-center gap-2.5 md:gap-4">
              <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm md:text-lg font-bold">
                  {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm md:flex-col md:items-start md:gap-0.5">
                <Link to={`/users/${task.creator_id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate md:text-base">
                  {task.creator_name || 'Unknown'}
                </Link>
                <span className="text-gray-300 md:hidden">·</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={task.creator_rating || 0} />
                  <span className="text-gray-400 text-xs">({task.creator_review_count || 0})</span>
                </div>
              </div>
              {!isCreator && (
                <button
                  onClick={handleMessageCreator}
                  className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Send message"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
              {!isCreator && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="text-xs md:text-sm text-blue-600 font-medium hover:text-blue-700 flex-shrink-0"
                >
                  Profile
                </Link>
              )}
              {isCreator && canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="text-xs md:text-sm text-blue-600 font-medium hover:text-blue-700 flex-shrink-0"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          {/* Thin divider mobile only */}
          <div className="border-t border-gray-100 mx-4 md:hidden" />

          {/* Description */}
          <div className="px-4 py-3 md:px-6 md:py-5">
            <h2 className="hidden md:block text-lg font-semibold text-gray-900 mb-3">About this job</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Info bar 3 columns */}
          <div className="mx-4 mb-3 md:mx-6 md:mb-5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Applicants</div>
                <div className={`text-sm md:text-base font-bold ${applicantCount > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                  {applicantLabel}
                </div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Difficulty</div>
                <div className="text-sm md:text-base font-bold text-gray-800">{task.difficulty || 'Normal'}</div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Posted</div>
                <div className="text-sm md:text-base font-bold text-gray-800">{postedDate || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Location map */}
          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <TaskLocationMap task={task} />
          </div>

          {/* Assigned Worker Info */}
          {task.assigned_to_name && (
            <div className="mx-4 mb-4 md:mx-6 md:mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold">
                  {task.assigned_to_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xs text-blue-600">Assigned to</p>
                  <Link to={`/users/${task.assigned_to_id}`} className="font-semibold text-sm md:text-base text-blue-800 hover:underline">
                    {task.assigned_to_name}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Applications (Owner View) */}
          {showApplications && (
            <div className="px-4 pb-4 md:px-6 md:pb-5">
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

          {/* Desktop-only inline application form (web keeps the old pattern) */}
          {showApplicationSheet && canApply && (
            <div className="hidden md:block mx-6 mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 text-base mb-3">Apply for this job</h3>
              <textarea
                id="desktop-apply-textarea"
                placeholder="Introduce yourself and explain why you're a good fit..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const textarea = document.getElementById('desktop-apply-textarea') as HTMLTextAreaElement;
                    handleApplyTask(textarea?.value || '');
                  }}
                  disabled={applyMutation.isPending}
                  className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-sm"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  onClick={() => setShowApplicationSheet(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status Messages — one clear message per state */}
          {isCreator && task.status === 'assigned' && (
            <div className="mx-4 mb-4 md:mx-6 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2.5 rounded-lg text-center text-sm">
              ⏳ Waiting for worker to complete the task
            </div>
          )}
          {isAssigned && task.status === 'assigned' && (
            <div className="mx-4 mb-4 md:mx-6 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2.5 rounded-lg text-center text-sm">
              💪 You're assigned — mark as done when finished
            </div>
          )}
          {isCreator && task.status === 'pending_confirmation' && (
            <div className="mx-4 mb-4 md:mx-6 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg text-center text-sm">
              📋 Worker marked this as done — please review and confirm
            </div>
          )}
          {isAssigned && task.status === 'pending_confirmation' && (
            <div className="mx-4 mb-4 md:mx-6 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2.5 rounded-lg text-center text-sm">
              ⏳ Waiting for task owner to confirm completion
            </div>
          )}
          {task.status === 'completed' && (
            <div className="mx-4 mb-4 md:mx-6 text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg text-center text-sm">
              ✅ This task has been completed
            </div>
          )}
          {task.status === 'disputed' && (
            <div className="mx-4 mb-4 md:mx-6 text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg text-center text-sm">
              ⚠️ This task is under dispute — our team is reviewing it
            </div>
          )}
          {task.status === 'cancelled' && (
            <div className="mx-4 mb-4 md:mx-6 text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2.5 rounded-lg text-center text-sm">
              This task has been cancelled
            </div>
          )}

          {/* Desktop inline action button */}
          <div className="hidden md:block px-6 pb-6">
            <TaskActionButtons
              task={task}
              isCreator={isCreator}
              isAssigned={isAssigned}
              isAuthenticated={isAuthenticated}
              actionLoading={actionLoading}
              showApplicationForm={showApplicationSheet}
              onShowApplicationForm={() => setShowApplicationSheet(true)}
              onMarkDone={handleMarkDone}
              onConfirmDone={handleConfirmDone}
              onDispute={handleDispute}
              onCancel={handleCancel}
            />
          </div>
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

        {/* How it works */}
        <div className="mt-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="w-full flex items-center justify-between px-4 py-3 md:px-6 text-left"
          >
            <span className="font-semibold text-sm md:text-base text-gray-700 flex items-center gap-1.5">
              How it works
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform md:hidden ${howItWorksOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`px-4 pb-4 md:px-6 md:pb-5 ${howItWorksOpen ? 'block' : 'hidden md:block'}`}>
            <ol className="text-gray-600 space-y-1.5 list-decimal list-inside text-sm md:text-base">
              <li>Apply for the job with a brief introduction</li>
              <li>Task owner reviews applications and accepts the best fit</li>
              <li>Complete the task and mark it as done</li>
              <li>Get paid after the task owner confirms completion</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet for applying */}
      <div className="md:hidden">
        <ApplicationSheet
          isOpen={showApplicationSheet}
          onClose={() => setShowApplicationSheet(false)}
          onSubmit={handleApplyTask}
          isSubmitting={applyMutation.isPending}
          taskTitle={task.title}
        />
      </div>

      {/* Sticky bottom action bar MOBILE ONLY */}
      {!showApplicationSheet && (
        <div
          className="fixed left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg md:hidden"
          style={{ bottom: 'var(--nav-total-height, 64px)' }}
        >
          <div className="max-w-3xl mx-auto">
            <TaskActionButtons
              task={task}
              isCreator={isCreator}
              isAssigned={isAssigned}
              isAuthenticated={isAuthenticated}
              actionLoading={actionLoading}
              showApplicationForm={showApplicationSheet}
              onShowApplicationForm={() => setShowApplicationSheet(true)}
              onMarkDone={handleMarkDone}
              onConfirmDone={handleConfirmDone}
              onDispute={handleDispute}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
