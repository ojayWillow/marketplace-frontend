import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useToastStore, apiClient } from '@marketplace/shared';
import { useStartConversation } from '../api/hooks';
import { usePublicProfileData } from './Profile/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';

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

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, content: '', taskId: 0 });
  const [submittingReview, setSubmittingReview] = useState(false);
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
        if (response.data.reviewable_transactions?.length > 0) {
          setReviewData(prev => ({ ...prev, taskId: response.data.reviewable_transactions[0].id }));
        }
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
      onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to start conversation'),
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast.error('Please login to leave a review'); return; }
    if (!reviewData.content.trim()) { toast.error('Please write a review comment'); return; }
    if (!reviewData.taskId) { toast.error('Please select a transaction to review'); return; }

    try {
      setSubmittingReview(true);
      await apiClient.post(`/api/reviews/task/${reviewData.taskId}`, {
        rating: reviewData.rating,
        content: reviewData.content,
      });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', Number(id)] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', Number(id)] });
      setReviewableTransactions(prev => prev.filter(t => t.id !== reviewData.taskId));
      if (reviewableTransactions.length <= 1) setCanReview(false);
      setShowReviewModal(false);
      setReviewData({ rating: 5, content: '', taskId: 0 });
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading profile…</p>
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">User not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'This profile doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* ── Back button ── */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* ═══ IDENTITY SECTION ═══ */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 ring-4 ring-white dark:ring-gray-800 shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{displayName}</h1>

            {profile.bio && (
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-3">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm">
              {profile.is_verified && (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              {memberSince && (
                <span className="text-gray-400 dark:text-gray-500">
                  Member since {memberSince}
                </span>
              )}
            </div>

            {(profile.average_rating != null && profile.reviews_count != null && profile.reviews_count > 0) && (
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(profile.average_rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-200 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {profile.average_rating?.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ({profile.reviews_count} {profile.reviews_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {/* ═══ ACTION BUTTONS ═══ */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleMessage}
              disabled={startConversationMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {startConversationMutation.isPending ? 'Opening…' : 'Message'}
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
                View Work
              </button>
            )}
          </div>

          {/* ═══ REVIEW BUTTON ═══ */}
          {canReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-8 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40 rounded-xl font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              ✍️ Leave a Review
            </button>
          )}

          {/* ═══ SKILLS ═══ */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    <span>{getCategoryIcon(skill)}</span>
                    <span>{getCategoryLabel(skill)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ═══ WORK ═══ */}
          {workCount > 0 && (
            <div className="mb-8" id="user-work">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Work</h2>
              <div className="space-y-3">
                {offerings.map(offering => (
                  <Link
                    key={`offering-${offering.id}`}
                    to={`/offerings/${offering.id}`}
                    className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {getCategoryIcon((offering as any).category || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{offering.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{offering.description}</p>
                        {(offering as any).price && (
                          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">€{(offering as any).price}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        Offering
                      </span>
                    </div>
                  </Link>
                ))}

                {tasks.map(task => (
                  <Link
                    key={`task-${task.id}`}
                    to={`/tasks/${task.id}`}
                    className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {getCategoryIcon((task as any).category || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                        {task.budget && (
                          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">€{task.budget}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        Task
                      </span>
                    </div>
                  </Link>
                ))}

                {listings.map(listing => (
                  <Link
                    key={`listing-${listing.id}`}
                    to={`/listings/${listing.id}`}
                    className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {(listing as any).images?.[0] ? (
                          <img src={(listing as any).images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📋</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{listing.title}</p>
                        {(listing as any).price && (
                          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">€{(listing as any).price}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        Listing
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══ REVIEWS ═══ */}
          {reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-3">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {review.reviewer_avatar ? (
                          <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-white text-sm font-bold">
                            {(review.reviewer_name?.[0] || '?').toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {review.reviewer_name}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {review.content && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {review.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {workCount === 0 && reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {displayName} is new to Kolab. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ REVIEW MODAL ═══ */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Review {displayName}
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewData({ rating: 5, content: '', taskId: reviewableTransactions[0]?.id || 0 });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              {reviewableTransactions.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction</label>
                  <select
                    value={reviewData.taskId}
                    onChange={(e) => setReviewData(prev => ({ ...prev, taskId: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent text-sm"
                  >
                    {reviewableTransactions.map(tx => (
                      <option key={tx.id} value={tx.id}>
                        {tx.title} ({tx.your_role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {reviewableTransactions.length === 1 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For: <span className="font-medium text-gray-900 dark:text-gray-200">{reviewableTransactions[0].title}</span>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      className={`text-4xl transition-all hover:scale-110 ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your review</label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent text-sm resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Share your experience…"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewData({ rating: 5, content: '', taskId: reviewableTransactions[0]?.id || 0 });
                  }}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
