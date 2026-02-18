import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useToastStore, apiClient } from '@marketplace/shared';
import { useStartConversation } from '../api/hooks';
import { usePublicProfileData } from './Profile/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';

import ProfileHeader from './UserProfile/ProfileHeader';
import WorkCard from './UserProfile/WorkCard';
import ReviewCard from './UserProfile/ReviewCard';
import ReviewModal from './UserProfile/ReviewModal';

interface ReviewableTransaction {
  type: string;
  id: number;
  title: string;
  completed_at: string | null;
  your_role: string;
  review_type: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  const {
    profile,
    reviews,
    setReviews,
    listings,
    offerings,
    tasks,
    loading,
    error,
    currentUser,
  } = usePublicProfileData(id ? Number(id) : undefined);

  const startConversationMutation = useStartConversation();

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewableTransactions, setReviewableTransactions] = useState<ReviewableTransaction[]>([]);
  const [canReview, setCanReview] = useState(false);

  // Check if current user can review
  useEffect(() => {
    const checkCanReview = async () => {
      if (!currentUser || !id || currentUser.id === Number(id)) {
        setCanReview(false);
        setReviewableTransactions([]);
        return;
      }
      try {
        const response = await apiClient.get(`/api/reviews/can-review-user/${id}`);
        setCanReview(response.data.can_review);
        setReviewableTransactions(response.data.reviewable_transactions || []);
      } catch {
        setCanReview(false);
        setReviewableTransactions([]);
      }
    };
    checkCanReview();
  }, [currentUser, id]);

  /* ── Handlers ── */
  const handleMessage = async () => {
    if (!currentUser) {
      toast.error(t('common.loginRequired', 'Please login to send messages'));
      navigate('/login');
      return;
    }
    if (!id) return;
    startConversationMutation.mutate(Number(id), {
      onSuccess: (data) => navigate(`/messages/${data.conversation.id}`),
      onError: (err: any) => toast.error(err?.response?.data?.error || t('userProfile.failedToStartConversation', 'Failed to start conversation')),
    });
  };

  const handleSubmitReview = async (data: { rating: number; content: string; taskId: number }) => {
    if (!currentUser) { toast.error(t('common.loginRequired', 'Please login to leave a review')); return; }
    if (!data.content.trim()) { toast.error(t('userProfile.pleaseWriteReview', 'Please write a review comment')); return; }
    if (!data.taskId) { toast.error(t('userProfile.pleaseSelectTransaction', 'Please select a transaction to review')); return; }

    await apiClient.post(`/api/reviews/task/${data.taskId}`, {
      rating: data.rating,
      content: data.content,
    });
    queryClient.invalidateQueries({ queryKey: ['user-reviews', Number(id)] });
    queryClient.invalidateQueries({ queryKey: ['user-profile', Number(id)] });
    setReviewableTransactions(prev => prev.filter(t => t.id !== data.taskId));
    if (reviewableTransactions.length <= 1) setCanReview(false);
    setShowReviewModal(false);
    toast.success(t('userProfile.reviewSubmitted', 'Review submitted successfully!'));
  };

  /* ── Derived data ── */
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.username || '';

  const avatarUrl = profile?.avatar_url || profile?.profile_picture_url;
  const initials = profile
    ? (profile.first_name?.[0] || profile.username?.[0] || '?').toUpperCase()
    : '?';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '';

  const skills = [...new Set(offerings.map(o => (o as any).category).filter(Boolean))];
  const workCount = offerings.length + tasks.length + listings.length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-800 dark:border-t-gray-200 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('userProfile.loadingProfile', 'Loading profile…')}</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('userProfile.notFound', 'User not found')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || t('userProfile.notFoundMessage', "This profile doesn't exist or has been removed.")}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {t('common.goBack', 'Go back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('common.goBack', 'Go back')}</span>
          </button>

          <ProfileHeader
            displayName={displayName}
            avatarUrl={avatarUrl}
            initials={initials}
            bio={profile.bio}
            isVerified={profile.is_verified}
            memberSince={memberSince}
            averageRating={profile.average_rating}
            reviewsCount={profile.reviews_count}
          />

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleMessage}
              disabled={startConversationMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {startConversationMutation.isPending ? t('userProfile.opening', 'Opening…') : t('userProfile.message', 'Message')}
            </button>

            {workCount > 0 && (
              <button
                onClick={() => {
                  const el = document.getElementById('user-work');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('userProfile.viewWork', 'View Work')}
              </button>
            )}
          </div>

          {/* Leave a Review */}
          {canReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-8 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40 rounded-xl font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              ✍️ {t('userProfile.leaveReview', 'Leave a Review')}
            </button>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('userProfile.skills', 'Skills')}</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    <span>{getCategoryIcon(skill)}</span>
                    <span>{t(`tasks.categories.${skill}`, getCategoryLabel(skill))}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work */}
          {workCount > 0 && (
            <div className="mb-8" id="user-work">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('userProfile.work', 'Work')}</h2>
              <div className="space-y-3">
                {offerings.map(offering => (
                  <WorkCard
                    key={`offering-${offering.id}`}
                    id={offering.id}
                    type="offering"
                    title={offering.title}
                    description={offering.description}
                    price={(offering as any).price}
                    category={(offering as any).category}
                  />
                ))}
                {tasks.map(task => (
                  <WorkCard
                    key={`task-${task.id}`}
                    id={task.id}
                    type="task"
                    title={task.title}
                    description={task.description}
                    price={task.budget}
                    category={(task as any).category}
                  />
                ))}
                {listings.map(listing => (
                  <WorkCard
                    key={`listing-${listing.id}`}
                    id={listing.id}
                    type="listing"
                    title={listing.title}
                    price={(listing as any).price}
                    image={(listing as any).images?.[0]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {t('userProfile.reviewsCount', 'Reviews ({{count}})', { count: reviews.length })}
              </h2>
              <div className="space-y-3">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {workCount === 0 && reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('userProfile.newToKolab', '{{name}} is new to Kolab. Stay tuned!', { name: displayName })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          displayName={displayName}
          reviewableTransactions={reviewableTransactions}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
