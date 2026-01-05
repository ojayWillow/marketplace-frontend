import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPublicUser, getUserReviews, PublicUser, UserReview } from '../api/users'
import { getImageUrl } from '../api/uploads'
import { startConversation } from '../api/messages'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import apiClient from '../api/client'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

export default function UserProfile() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const toast = useToastStore()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, content: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [startingConversation, setStartingConversation] = useState(false)

  const isOwnProfile = currentUser && user && currentUser.id === user.id

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const [userData, reviewsData] = await Promise.all([
          getPublicUser(Number(id)),
          getUserReviews(Number(id))
        ])
        
        setUser(userData)
        setReviews(reviewsData.reviews)
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  const handleStartConversation = async () => {
    if (!currentUser) {
      toast.error('Please login to send messages')
      navigate('/login')
      return
    }

    if (!id) return

    try {
      setStartingConversation(true)
      const { conversation } = await startConversation(Number(id))
      navigate(`/messages/${conversation.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to start conversation')
    } finally {
      setStartingConversation(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Please login to leave a review')
      return
    }

    if (!reviewData.content.trim()) {
      toast.error('Please write a review comment')
      return
    }

    try {
      setSubmittingReview(true)
      const response = await apiClient.post('/api/reviews', {
        reviewed_user_id: Number(id),
        rating: reviewData.rating,
        content: reviewData.content
      })

      // Add new review to list
      const newReview: UserReview = {
        id: response.data.id,
        rating: reviewData.rating,
        content: reviewData.content,
        reviewer_id: currentUser.id,
        reviewer_name: currentUser.username,
        reviewer_avatar: currentUser.avatar_url || currentUser.profile_picture_url,
        created_at: new Date().toISOString()
      }
      
      setReviews(prev => [newReview, ...prev])
      setShowReviewModal(false)
      setReviewData({ rating: 5, content: '' })
      toast.success('Review submitted successfully!')
      
      // Refresh user data to update rating
      if (id) {
        const userData = await getPublicUser(Number(id))
        setUser(userData)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

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
    )
  }

  if (loading) {
    return <LoadingSpinner className="py-16" size="lg" />
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorMessage message={error || 'User not found'} />
        <Link to="/" className="btn-secondary mt-4 inline-block">
          ← Go Home
        </Link>
      </div>
    )
  }

  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.username

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  const avatarUrl = user.profile_picture_url || user.avatar_url

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={getImageUrl(avatarUrl)}
                  alt={displayName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {displayName}
                </h1>
                {user.is_verified && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <p className="text-gray-500 mb-4">@{user.username}</p>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Location */}
              {(user.city || user.country) && (
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {user.average_rating > 0 ? (
                  <span className="flex items-center justify-center gap-1">
                    {user.average_rating.toFixed(1)} ★
                  </span>
                ) : (
                  'N/A'
                )}
              </div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {user.reviews_count}
              </div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.completion_rate}%
              </div>
              <div className="text-sm text-gray-500">Completion</div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && currentUser && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleStartConversation}
                disabled={startingConversation}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                💬 {startingConversation ? 'Loading...' : 'Message'}
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ✍️ Leave a Review
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. {!isOwnProfile && currentUser && 'Be the first to leave a review!'}
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    {/* Reviewer avatar */}
                    {review.reviewer_avatar ? (
                      <img
                        src={getImageUrl(review.reviewer_avatar)}
                        alt={review.reviewer_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          to={`/users/${review.reviewer_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {review.reviewer_name}
                        </Link>
                        <span className="text-yellow-500">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {/* Rating */}
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

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this user..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false)
                    setReviewData({ rating: 5, content: '' })
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
  )
}
