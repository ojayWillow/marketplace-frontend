import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListing, useDeleteListing } from '../../hooks/useListings'
import { useAuthStore } from '../../stores/authStore'
import { getImageUrl } from '../../api/uploads'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function ListingDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: listing, isLoading, isError } = useListing(Number(id))
  const deleteListing = useDeleteListing()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const isOwner = user && listing && user.id === listing.user_id

  // Parse images from comma-separated string
  const images = listing?.images ? listing.images.split(',').filter(Boolean) : []

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing.mutateAsync(Number(id))
      navigate('/listings')
    }
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner className="py-16" size="lg" />
  }

  if (isError || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorMessage message="Listing not found" />
        <Link to="/listings" className="btn-secondary mt-4 inline-block">
          ← {t('listings.allListings')}
        </Link>
      </div>
    )
  }

  const sellerInfo = listing.seller_info
  const sellerDisplayName = sellerInfo?.first_name && sellerInfo?.last_name
    ? `${sellerInfo.first_name} ${sellerInfo.last_name}`
    : sellerInfo?.username || listing.seller
  const memberSince = sellerInfo?.created_at
    ? new Date(sellerInfo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/listings"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('listings.allListings', 'All Listings')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Image Gallery */}
            {images.length > 0 ? (
              <div className="bg-gray-100">
                {/* Main Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={getImageUrl(images[selectedImageIndex])}
                    alt={listing.title}
                    className="w-full h-full object-contain bg-gray-900"
                  />
                  
                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Placeholder when no images */
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                    {t(`listings.categories.${listing.category}`, listing.category)}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {listing.title}
                  </h1>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  €{Number(listing.price).toLocaleString()}
                </div>
              </div>

              {/* Location */}
              {listing.location && (
                <div className="flex items-center text-gray-600 mb-6">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {listing.location}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('common.description', 'Description')}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Contact info */}
              {listing.contact_info && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('common.contact', 'Contact')}
                  </h2>
                  <p className="text-gray-700">{listing.contact_info}</p>
                </div>
              )}

              {/* Posted date & views */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span>Posted: {new Date(listing.created_at).toLocaleDateString()}</span>
                <span>{listing.views_count} views</span>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Link
                    to={`/listings/${listing.id}/edit`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('common.edit', 'Edit')}
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteListing.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    {deleteListing.isPending ? t('common.loading', 'Loading...') : t('common.delete', 'Delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller Info - Right Side */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller</h2>
            
            {/* Seller Profile */}
            <Link 
              to={sellerInfo ? `/users/${sellerInfo.id}` : '#'}
              className="flex items-center gap-4 group mb-4"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {sellerInfo?.avatar_url ? (
                  <img
                    src={getImageUrl(sellerInfo.avatar_url)}
                    alt={sellerDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">
                    {sellerDisplayName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Name & Badge */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {sellerDisplayName}
                  </span>
                  {sellerInfo?.is_verified && (
                    <span className="bg-blue-100 text-blue-600 p-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Location */}
                {(sellerInfo?.city || sellerInfo?.country) && (
                  <p className="text-sm text-gray-500">
                    {[sellerInfo.city, sellerInfo.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </Link>
            
            {/* Rating & Stats */}
            {sellerInfo && (
              <div className="border-t border-b py-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {renderStars(sellerInfo.average_rating || 0)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {sellerInfo.average_rating?.toFixed(1) || '0.0'} ({sellerInfo.reviews_count || 0})
                    </p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {sellerInfo.completion_rate || 100}%
                    </div>
                    <p className="text-sm text-gray-500">Completion</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Member Since */}
            {memberSince && (
              <p className="text-sm text-gray-500 mb-4">
                Member since {memberSince}
              </p>
            )}
            
            {/* Contact Button */}
            {!isOwner && (
              <div className="space-y-3">
                {listing.contact_info ? (
                  <a
                    href={`tel:${listing.contact_info}`}
                    className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    📞 Contact Seller
                  </a>
                ) : (
                  <button
                    className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => alert('Messaging feature coming soon!')}
                  >
                    💬 Message Seller
                  </button>
                )}
                
                <Link
                  to={sellerInfo ? `/users/${sellerInfo.id}` : '#'}
                  className="block w-full bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            )}
            
            {/* Safety Tips */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">🚨 Safety Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Meet in public places</li>
                <li>• Inspect items before paying</li>
                <li>• Don't send money in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
