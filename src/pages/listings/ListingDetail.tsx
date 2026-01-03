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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/listings"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('listings.allListings')}
      </Link>

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
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-3">
                {t(`listings.categories.${listing.category}`)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {listing.title}
              </h1>
            </div>
            <div className="text-3xl font-bold text-primary-600">
              €{listing.price.toLocaleString()}
            </div>
          </div>

          {/* Location */}
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

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('common.description')}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Contact info */}
          {listing.contact_info && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('common.contact')}
              </h2>
              <p className="text-gray-700">{listing.contact_info}</p>
            </div>
          )}

          {/* Posted date */}
          <div className="text-sm text-gray-500 border-t pt-4">
            Posted: {new Date(listing.created_at).toLocaleDateString()}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Link
                to={`/listings/${listing.id}/edit`}
                className="btn-secondary"
              >
                {t('common.edit')}
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteListing.isPending}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                {deleteListing.isPending ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
