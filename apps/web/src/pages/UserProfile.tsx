import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { useStartConversation } from '../api/hooks';
import { apiClient } from '@marketplace/shared';
import { useQueryClient } from '@tanstack/react-query';

// Import shared Profile components
import {
  ProfileHeader,
  ProfileTabs,
  LoadingState,
  ErrorState,
} from './Profile/components';
import {
  AboutTab,
  ListingsTab,
  OfferingsTab,
  TasksTab,
  ReviewsTab,
} from './Profile/components/tabs';
import { usePublicProfileData, useProfileTabs } from './Profile/hooks';
import type { ActiveTab } from './Profile/types';

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
  const toast = useToastStore();
  const queryClient = useQueryClient();
  
  // Public profile data
  const {
    profile,
    reviews,
    setReviews,
    listings,
    offerings,
    tasks,
    loading,
    listingsLoading,
    offeringsLoading,
    tasksLoading,
    error,
    currentUser,
  } = usePublicProfileData(id ? Number(id) : undefined);
  
  // Tab state
  const { activeTab, setActiveTab } = useProfileTabs();
  
  // Messaging
  const startConversationMutation = useStartConversation();
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, content: '', taskId: 0 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewableTransactions, setReviewableTransactions] = useState<ReviewableTransaction[]>([]);
  const [canReview, setCanReview] = useState(false);

  // Check if current user can review this user
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
          setReviewData(prev => ({ 
            ...prev, 
            taskId: response.data.reviewable_transactions[0].id 
          }));
        }
      } catch (err) {
        setCanReview(false);
        setReviewableTransactions([]);
      }
    };

    checkCanReview();
  }, [currentUser, id]);

  const handleStartConversation = async () => {
    if (!currentUser) {
      toast.error('Please login to send messages');
      navigate('/login');
      return;
    }

    if (!id) return;

    startConversationMutation.mutate(Number(id), {
      onSuccess: (data) => {
        navigate(`/messages/${data.conversation.id}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to start conversation');
      }
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!reviewData.content.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    if (!reviewData.taskId) {
      toast.error('Please select a transaction to review');
      return;
    }

    try {
      setSubmittingReview(true);
      
      await apiClient.post(`/api/reviews/task/${reviewData.taskId}`, {
        rating: reviewData.rating,
        content: reviewData.content
      });

      queryClient.invalidateQueries({ queryKey: ['user-reviews', Number(id)] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', Number(id)] });
      
      setReviewableTransactions(prev => prev.filter(t => t.id !== reviewData.taskId));
      if (reviewableTransactions.length <= 1) {
        setCanReview(false);
      }
      
      setShowReviewModal(false);
      setReviewData({ rating: 5, content: '', taskId: 0 });
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          interactive && onChange ? (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`text-3xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ) : (
            <span 
              key={star} 
              className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          )
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error || !profile) {
    return <ErrorState message={error || 'User not found'} />;
  }

  // Calculate counts for tabs
  const hasListings = listings.length > 0;
  const hasOfferings = offerings.length > 0;
  const hasTasks = tasks.length > 0;
  const hasReviews = reviews.length > 0;

  // Empty form data for ProfileHeader (not editing in viewOnly mode)
  const emptyFormData = {
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    city: '',
    country: '',
    avatar_url: '',
  };

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header with viewOnly mode */}
          <ProfileHeader
            profile={profile}
            formData={emptyFormData}
            editing={false}
            saving={false}
            totalTasksCompleted={profile.tasks_completed || 0}
            viewOnly={true}
            onEdit={() => {}}
            onCancel={() => {}}
            onSave={() => {}}
            onChangeAvatar={() => {}}
            onMessage={currentUser ? handleStartConversation : undefined}
            messageLoading={startConversationMutation.isPending}
          />

          {/* Review button for users who can review */}
          {canReview && (
            <div className="mb-6">
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                ✍️ Leave a Review for {displayName}
              </button>
            </div>
          )}

          {/* Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              tasks: tasks.length,
              offerings: offerings.length,
              listings: listings.length,
              reviews: reviews.length,
              pendingNotifications: 0,
            }}
            hasContent={{
              tasks: hasTasks,
              offerings: hasOfferings,
              listings: hasListings,
              reviews: hasReviews,
            }}
            viewOnly={true}
          />

          {/* Tab Content */}
          {activeTab === 'about' && (
            <AboutTab
              profile={profile}
              editing={false}
              formData={emptyFormData}
              onChange={() => {}}
              viewOnly={true}
            />
          )}

          {activeTab === 'listings' && (
            <ListingsTab
              listings={listings}
              loading={listingsLoading}
              viewOnly={true}
            />
          )}

          {activeTab === 'offerings' && (
            <OfferingsTab
              offerings={offerings}
              loading={offeringsLoading}
              viewOnly={true}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              createdTasks={tasks}
              myApplications={[]}
              taskMatchCounts={{}}
              tasksLoading={tasksLoading}
              applicationsLoading={false}
              taskViewMode="my-tasks"
              taskStatusFilter="all"
              onViewModeChange={() => {}}
              onStatusFilterChange={() => {}}
              viewOnly={true}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              currentUserId={currentUser?.id}
              onDeleteReview={() => {}}
              setReviews={setReviews}
            />
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Leave a Review for {displayName}
            </h3>
            
            <form onSubmit={handleSubmitReview}>
              {reviewableTransactions.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Transaction
                  </label>
                  <select
                    value={reviewData.taskId}
                    onChange={(e) => setReviewData(prev => ({ ...prev, taskId: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Reviewing for: <span className="font-medium">{reviewableTransactions[0].title}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Your role: {reviewableTransactions[0].your_role}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex justify-center">
                  {renderStars(reviewData.rating, true, (rating) => 
                    setReviewData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience working with this user..."
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
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
