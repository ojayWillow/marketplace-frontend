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
