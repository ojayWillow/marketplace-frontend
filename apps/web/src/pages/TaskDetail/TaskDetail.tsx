import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { formatTimeAgoLong } from '../Tasks/utils/taskHelpers';

// Local components
import {
  TaskLocationMap,
  TaskApplications,
  TaskActionButtons,
  TaskReviews,
  RecommendedHelpers,
  ApplicationSheet,
  ReviewSheet,
  DisputeSheet,
  DisputeSection,
} from './components';
import { useTaskActions } from './hooks';
import { Review, CanReviewResponse } from './types';

// StarRating: only shows filled stars (+ optional half), no empty stars
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25;
  const totalIcons = fullStars + (hasHalfStar ? 1 : 0);

  if (totalIcons === 0) return null;

  return (
    <span className="inline-flex items-center gap-px">
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg key={`full-${i}`} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg key="half" className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
    </span>
  );
};

const TaskDetail = () => {
  const { t } = useTranslation();
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
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showDisputeSheet, setShowDisputeSheet] = useState(false);
  const [disputeKey, setDisputeKey] = useState(0); // Force re-fetch disputes

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

  // Task actions hook — with review and dispute callbacks
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
    onTaskCompleted: () => {
      // Open the review sheet right after confirming completion
      setShowReviewSheet(true);
    },
    onOpenDispute: () => {
      setShowDisputeSheet(true);
    },
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
      toast.warning(t('taskDetail.toastLoginToApply'));
      navigate('/welcome');
      return;
    }
    applyMutation.mutate(
      { taskId: Number(id), message: applicationMessage },
      {
        onSuccess: () => {
          toast.success(t('taskDetail.toastApplicationSubmitted'));
          setShowApplicationSheet(false);
          setTimeout(() => { navigate('/tasks'); }, 2000);
        },
        onError: (error: any) => {
          console.error('Error applying to task:', error);
          toast.error(error?.response?.data?.error || t('taskDetail.toastApplicationFailed'));
        }
      }
    );
  };

  // Handle message creator
  const handleMessageCreator = () => {
    if (!isAuthenticated) {
      toast.warning(t('taskDetail.toastLoginToMessage'));
      navigate('/welcome');
      return;
    }
    navigate(`/messages?userId=${task?.creator_id}`);
  };

  // Figure out who to review
  const getRevieweeName = (): string => {
    if (!task) return '';
    const isCreator = user?.id === task.creator_id;
    // Creator reviews the worker, worker reviews the creator
    if (isCreator) return task.assigned_to_name || t('taskDetail.theWorker');
    return task.creator_name || t('taskDetail.theJobOwner');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('taskDetail.loading')}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('taskDetail.notFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('taskDetail.notFoundDescription')}</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
            {t('taskDetail.browseAll')}
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
  const categoryLabelRaw = getCategoryLabel(task.category);
  const categoryLabel = t(`tasks.categories.${task.category}`, categoryLabelRaw);
  const categoryIcon = getCategoryIcon(task.category);
  const applicantCount = task.pending_applications_count || 0;
  const budget = task.budget || task.reward || 0;
  const isUrgent = FEATURES.URGENT && task.is_urgent;
  const seoDescription = `${categoryLabel} ${t('taskDetail.jobSuffix')}${task.budget ? ` - ${task.budget} EUR` : ''}${task.location ? ` ${t('taskDetail.seoIn', { location: task.location })}` : ''}. ${task.description?.substring(0, 100)}...`;
  // Relative time for share messages ("3 days ago")
  const postedDateRelative = task.created_at ? formatTimeAgoLong(task.created_at) : '';
  // Absolute date for the info bar on the detail page ("Feb 4")
  const postedDateAbsolute = task.created_at
    ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const applicantLabel = applicantCount > 0 ? t('taskDetail.applied', { count: applicantCount }) : t('taskDetail.new');
  const shortLocation = task.location?.split(',').slice(0, 2).join(',').trim() || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-36 md:pb-8">
      <SEOHead
        title={task.title}
        description={seoDescription}
        url={`/tasks/${task.id}`}
        type="article"
        price={task.budget}
        publishedDate={task.created_at || undefined}
      />

      {/* Top bar */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-50 md:static md:border-b-0">
        <div className="flex items-center justify-between px-4 py-2.5 md:max-w-2xl md:mx-auto md:py-4">
          <Link to="/tasks" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">{t('taskDetail.backToQuickHelp')}</span>
            <span className="md:hidden">{t('taskDetail.back')}</span>
          </Link>
          <ShareButton
            url={`/tasks/${task.id}`}
            title={task.title}
            description={t('taskDetail.shareBudget', { category: categoryLabel, price: budget })}
            categoryIcon={categoryIcon}
            categoryEmoji={categoryIcon}
            price={t('taskDetail.sharePrice', { price: budget })}
            location={shortLocation}
            postedDate={postedDateRelative}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3 md:max-w-2xl md:mx-auto md:pt-0">
        {/* Main card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* ===== DESKTOP HEADER: gradient banner ===== */}
          <div className="hidden md:block bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryIcon}</span>
                <span className="px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isUrgent && (
                  <span className="px-2.5 py-1 bg-red-500/80 rounded-full text-xs font-bold">⚡ {t('taskDetail.urgent')}</span>
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
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                {isUrgent && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-bold">{t('taskDetail.urgent')}</span>
                )}
              </div>
              <span className="text-xl font-black text-green-600 dark:text-green-400">€{budget}</span>
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">{task.title}</h1>
          </div>

          {/* Profile row */}
          <div className="px-4 pb-3 md:px-6 md:pt-5 md:pb-5 md:border-b md:border-gray-200 md:dark:border-gray-700">
            <div className="flex items-center gap-2.5 md:gap-4">
              <Link to={`/users/${task.creator_id}`} className="flex-shrink-0">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm md:text-lg font-bold">
                  {task.creator_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm md:flex-col md:items-start md:gap-0.5">
                <Link to={`/users/${task.creator_id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate md:text-base">
                  {task.creator_name || t('taskDetail.unknown')}
                </Link>
                <span className="text-gray-300 dark:text-gray-600 md:hidden">·</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={task.creator_rating || 0} />
                  <span className="text-gray-400 dark:text-gray-500 text-xs">({task.creator_review_count || 0})</span>
                </div>
              </div>
              {!isCreator && (
                <button
                  onClick={handleMessageCreator}
                  className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  title={t('taskDetail.sendMessage')}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
              {!isCreator && (
                <Link
                  to={`/users/${task.creator_id}`}
                  className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex-shrink-0"
                >
                  {t('taskDetail.profile')}
                </Link>
              )}
              {isCreator && canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex-shrink-0"
                >
                  {t('taskDetail.edit')}
                </Link>
              )}
            </div>
          </div>

          {/* Thin divider mobile only */}
          <div className="border-t border-gray-100 dark:border-gray-800 mx-4 md:hidden" />

          {/* Description */}
          <div className="px-4 py-3 md:px-6 md:py-5">
            <h2 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('taskDetail.aboutThisJob')}</h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Info bar 3 columns */}
          <div className="mx-4 mb-3 md:mx-6 md:mb-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{t('taskDetail.applicants')}</div>
                <div className={`text-sm md:text-base font-bold ${applicantCount > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                  {applicantLabel}
                </div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{t('taskDetail.difficulty')}</div>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200">{task.difficulty || t('taskDetail.normal')}</div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{t('taskDetail.posted')}</div>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200">{postedDateAbsolute || t('taskDetail.na')}</div>
              </div>
            </div>
          </div>

          {/* Location map */}
          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <TaskLocationMap task={task} />
          </div>

          {/* Assigned Worker Info */}
          {task.assigned_to_name && (
            <div className="mx-4 mb-4 md:mx-6 md:mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-bold">
                  {task.assigned_to_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{t('taskDetail.assignedTo')}</p>
                  <Link to={`/users/${task.assigned_to_id}`} className="font-semibold text-sm md:text-base text-blue-800 dark:text-blue-300 hover:underline">
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

          {/* Desktop inline application form */}
          {showApplicationSheet && canApply && (
            <div className="hidden md:block mx-6 mb-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-3">{t('taskDetail.applyForJob')}</h3>
              <textarea
                id="desktop-apply-textarea"
                placeholder={t('taskDetail.applyPlaceholder')}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
                  {applyMutation.isPending ? t('taskDetail.submitting') : t('taskDetail.submitApplication')}
                </button>
                <button
                  onClick={() => setShowApplicationSheet(false)}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm"
                >
                  {t('taskDetail.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {isCreator && task.status === 'assigned' && (
            <div className="mx-4 mb-4 md:mx-6 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusWaitingWorker')}
            </div>
          )}
          {isAssigned && task.status === 'assigned' && (
            <div className="mx-4 mb-4 md:mx-6 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusAssignedToYou')}
            </div>
          )}
          {isCreator && task.status === 'pending_confirmation' && (
            <div className="mx-4 mb-4 md:mx-6 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusWorkerDone')}
            </div>
          )}
          {isAssigned && task.status === 'pending_confirmation' && (
            <div className="mx-4 mb-4 md:mx-6 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusWaitingConfirmation')}
            </div>
          )}
          {task.status === 'completed' && (
            <div className="mx-4 mb-4 md:mx-6 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusCompleted')}
            </div>
          )}
          {task.status === 'cancelled' && (
            <div className="mx-4 mb-4 md:mx-6 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusCancelled')}
            </div>
          )}

          {/* Dispute details section (replaces the old simple banner) */}
          {task.status === 'disputed' && (isCreator || isAssigned) && (
            <DisputeSection
              key={disputeKey}
              taskId={Number(id)}
              currentUserId={user?.id}
              onDisputeUpdated={() => {
                refetchTask();
                setDisputeKey(prev => prev + 1);
              }}
            />
          )}

          {/* Disputed status banner for non-involved users */}
          {task.status === 'disputed' && !isCreator && !isAssigned && (
            <div className="mx-4 mb-4 md:mx-6 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-3 py-2.5 rounded-lg text-center text-sm">
              {t('taskDetail.statusDisputed')}
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

        {/* Reviews (the ONLY place with a "Leave a review" button now) */}
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

      {/* Review bottom sheet (mobile + desktop) */}
      <ReviewSheet
        isOpen={showReviewSheet}
        onClose={() => {
          setShowReviewSheet(false);
          navigate('/profile');
        }}
        onSubmitted={() => {
          setShowReviewSheet(false);
          fetchReviews();
          checkCanReview();
          setTimeout(() => navigate('/profile'), 1000);
        }}
        taskId={Number(id)}
        revieweeName={getRevieweeName()}
      />

      {/* Dispute bottom sheet (mobile + desktop) */}
      <DisputeSheet
        isOpen={showDisputeSheet}
        onClose={() => setShowDisputeSheet(false)}
        onSubmitted={() => {
          setShowDisputeSheet(false);
          toast.warning(t('taskDetail.toastDisputeFiled'));
          refetchTask();
          setDisputeKey(prev => prev + 1);
        }}
        taskId={Number(id)}
        taskTitle={task.title}
      />

      {/* Sticky bottom action bar MOBILE ONLY */}
      {!showApplicationSheet && !showReviewSheet && !showDisputeSheet && (
        <div
          className="fixed left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 shadow-lg dark:shadow-gray-950/50 md:hidden"
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
