import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Listing } from '../../../api/types'
import { getImageUrl } from '../../../api/uploads'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation()

  // Get the first image from the listing
  const getFirstImage = (): string | null => {
    if (listing.images) {
      const imageList = listing.images.split(',').filter(Boolean)
      if (imageList.length > 0) {
        return getImageUrl(imageList[0].trim())
      }
    }
    if (listing.image_urls && listing.image_urls.length > 0) {
      return getImageUrl(listing.image_urls[0])
    }
    return null
  }

  const imageUrl = getFirstImage()

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <Link to={`/listings/${listing.id}`} className="card group hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <svg
            className="w-12 h-12 text-gray-300 group-hover:text-gray-400 transition-colors"
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
        )}
      </div>

      <div className="p-4">
        {/* Category badge */}
        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded mb-2">
          {t(`listings.categories.${listing.category}`)}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* Price */}
        <div className="text-lg font-bold text-primary-600 mb-2">
          €{listing.price.toLocaleString()}
        </div>

        {/* Seller info with rating */}
        {listing.seller_info && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className="text-gray-600">{listing.seller_info.username}</span>
            {listing.seller_info.average_rating && listing.seller_info.average_rating > 0 && (
              <div className="flex items-center gap-1">
                {renderStars(listing.seller_info.average_rating)}
                <span className="text-xs text-gray-500">
                  ({listing.seller_info.average_rating.toFixed(1)})
                </span>
              </div>
            )}
            {listing.seller_info.is_verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {listing.location}
        </div>
      </div>
    </Link>
  )
}
