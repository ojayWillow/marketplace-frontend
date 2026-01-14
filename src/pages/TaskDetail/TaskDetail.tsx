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

import { TaskApplication, getTaskApplications } from '../../api/tasks';
import { getOfferings, Offering } from '../../api/offerings';
import { useTask, useApplyToTask } from '../../api/hooks';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { getCategoryLabel } from '../../constants/categories';
import apiClient from '../../api/client';
import SEOHead from '../../components/ui/SEOHead';

// Local components
import {
  TaskHeader,
  TaskLocationMap,
  TaskInfoGrid,
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
    <span className="text-yellow-500 text-base">
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
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
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

  // Loading state
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

  // Not found state
  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
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

  // Computed values
  const isCreator = user?.id === task.creator_id;
  const isAssigned = user?.id === task.assigned_to_id;
  const canApply = isAuthenticated && !isCreator && task.status === 'open';
  const canEdit = isCreator && task.status === 'open';
  const showApplications = isCreator && task.status === 'open';
  const categoryLabel = getCategoryLabel(task.category);
  const seoDescription = `${categoryLabel} job${task.budget ? ` - €${task.budget}` : ''}${task.location ? ` in ${task.location}` : ''}. ${task.description?.substring(0, 100)}...`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
      />

      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <span className="mr-2">←</span> Back to Quick Help
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <TaskHeader task={task} />

          <div className="p-6">
            {/* Profile Section */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </Link>
                <div>
                  <Link to={`/users/${task.creator_id}`} className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                    {task.creator_name || 'Unknown'}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={0} />
                    <span className="text-gray-500 text-sm">0.0 (0 reviews)</span>
                  </div>
                </div>
              </div>
              
              {/* Header button: View Profile for visitors */}
              {!isCreator && task.status === 'open' && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  👤 View Profile
                </Link>
              )}
              {isCreator && canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="px-6 py-2.5 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  ✏️ Edit
                </Link>
              )}
            </div>

            {/* About this job */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this job</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>

            {/* Location Map */}
            <TaskLocationMap task={task} />

            {/* Info Grid */}
            <TaskInfoGrid task={task} />

            {/* Assigned Worker Info */}
            {task.assigned_to_name && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

            {/* Applications (Owner View) */}
            {showApplications && (
              <TaskApplications
                applications={applications}
                applicationsLoading={applicationsLoading}
                acceptingId={acceptingId}
                rejectingId={rejectingId}
                onAccept={handleAcceptApplication}
                onReject={handleRejectApplication}
                onMessage={handleMessageApplicant}
              />
            )}

            {/* Application Form */}
            {showApplicationForm && canApply && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Apply for this job</h3>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a good fit for this job..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] mb-4"
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
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
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

            {/* Status Messages */}
            {isCreator && task.status === 'assigned' && (
              <div className="mt-6 text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg text-center">
                ⏳ Waiting for worker to complete the task
              </div>
            )}
            {isAssigned && task.status === 'pending_confirmation' && (
              <div className="mt-6 text-purple-700 bg-purple-50 border border-purple-200 px-4 py-3 rounded-lg text-center">
                ⏳ Waiting for task owner to confirm completion
              </div>
            )}
            {task.status === 'completed' && (
              <div className="mt-6 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-center">
                ✅ This task has been completed
              </div>
            )}
            {task.status === 'cancelled' && (
              <div className="mt-6 text-gray-600 bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg text-center">
                ❌ This task has been cancelled
              </div>
            )}
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            💡 How it works
          </h3>
          <ol className="text-blue-700 space-y-2 list-decimal list-inside">
            <li>Apply for the job with a brief introduction</li>
            <li>Task owner reviews applications and accepts the best fit</li>
            <li>Complete the task and mark it as done</li>
            <li>Get paid after the task owner confirms completion</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
