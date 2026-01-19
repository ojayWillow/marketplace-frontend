import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { useListings } from '../../hooks/useListings'
import { getImageUrl } from '../../api/uploads'
import { CATEGORIES } from './constants'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import FavoriteButton from '../../components/ui/FavoriteButton'

// Category icons mapping
const categoryIcons: Record<string, string> = {
  electronics: '📱',
  vehicles: '🚗',
  property: '🏠',
  furniture: '🪑',
  clothing: '👕',
  sports: '⚽',
  books: '📚',
  toys: '🧸',
  tools: '🔧',
  garden: '🌱',
  pets: '🐾',
  music: '🎵',
  art: '🎨',
  jewelry: '💍',
  health: '💊',
  food: '🍔',
  services: '🛠️',
  other: '📦',
}

type SortOption = 'newest' | 'price-low' | 'price-high'

export default function Listings() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const category = searchParams.get('category')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Fetch listings when category is selected
  const { data: listingsData, isLoading, isError } = useListings(
    category ? { category } : undefined
  )

  // Safely extract listings array - handle both array and object responses
  const listings = useMemo(() => {
    if (!listingsData) return []
    // If it's already an array, use it directly
    if (Array.isArray(listingsData)) return listingsData
    // If it's an object with a listings property, extract it
    if (listingsData && typeof listingsData === 'object' && 'listings' in listingsData) {
      return Array.isArray((listingsData as any).listings) ? (listingsData as any).listings : []
    }
    return []
  }, [listingsData])

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    if (!listings || !Array.isArray(listings)) return []
    
    let result = [...listings]
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(listing =>
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'newest':
      default:
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
    
    return result
  }, [listings, searchQuery, sortBy])

  // Clear category filter
  const clearCategory = () => {
    setSearchParams({})
    setSearchQuery('')
  }

  // If no category selected, show category grid
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('listings.browseCategories', 'Browse Categories')}</h1>
            <p className="text-gray-600 mt-2">{t('listings.selectCategory', 'Select a category to view listings')}</p>
          </div>
          {isAuthenticated && (
            <Link
              to="/listings/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('listings.createListing', 'Create Listing')}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/listings?category=${cat}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center text-center group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {categoryIcons[cat] || '📦'}
              </div>
              <h3 className="text-lg font-semibold capitalize text-gray-800 group-hover:text-blue-600">
                {t(`listings.categories.${cat}`, cat)}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Category is selected - show listings
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={clearCategory}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('listings.allCategories', 'All Categories')}
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{categoryIcons[category] || '📦'}</span>
            <h1 className="text-3xl font-bold capitalize">
              {t(`listings.categories.${category}`, category)}
            </h1>
          </div>
          {isAuthenticated && (
            <Link
              to="/listings/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              {t('listings.createListing', 'Create Listing')}
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t('listings.searchPlaceholder', 'Search listings...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="newest">{t('listings.sortNewest', 'Newest First')}</option>
              <option value="price-low">{t('listings.sortPriceLow', 'Price: Low to High')}</option>
              <option value="price-high">{t('listings.sortPriceHigh', 'Price: High to Low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner className="py-16" size="lg" />}

      {/* Error State */}
      {isError && (
        <ErrorMessage message={t('listings.loadError', 'Failed to load listings. Please try again.')} />
      )}

      {/* Listings Grid */}
      {!isLoading && !isError && (
        <>
          {/* Results count */}
          <p className="text-gray-600 mb-4">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('listings.noListings', 'No listings found')}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? t('listings.tryDifferentSearch', 'Try a different search term')
                  : t('listings.beFirstToPost', 'Be the first to post in this category!')}
              </p>
              {isAuthenticated && (
                <Link
                  to="/listings/create"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('listings.createListing', 'Create Listing')}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => {
                // Get first image from comma-separated string
                const images = listing.images ? listing.images.split(',').filter(Boolean) : []
                const firstImage = images[0]
                
                return (
                  <div
                    key={listing.id}
                    className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
                  >
                    {/* Favorite Button - positioned top right */}
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton
                        itemType="listing"
                        itemId={listing.id}
                        size="sm"
                      />
                    </div>
                    
                    <Link to={`/listings/${listing.id}`}>
                      {/* Image */}
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {firstImage ? (
                          <img
                            src={getImageUrl(firstImage)}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-2 left-2 bg-white/95 px-3 py-1 rounded-full font-bold text-blue-600">
                          €{Number(listing.price).toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600">
                          {listing.title}
                        </h3>
                        
                        {listing.location && (
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {listing.description}
                        </p>
                        
                        <div className="text-xs text-gray-400 mt-3">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
