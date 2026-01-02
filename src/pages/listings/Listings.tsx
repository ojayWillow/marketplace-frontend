import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListings } from '../../hooks/useListings'
import { useAuthStore } from '../../stores/authStore'
import ListingCard from './components/ListingCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { CATEGORIES } from './constants'

export default function Listings() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data: listings, isLoading, isError } = useListings({
    search: search || undefined,
    category: category || undefined,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('listings.title')}
        </h1>
        {isAuthenticated && (
          <Link to="/listings/create" className="btn-primary">
            + {t('listings.createNew')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('listings.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">{t('listings.categoryLabel')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`listings.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message={t('common.error')} />
      ) : listings && listings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-gray-500 text-lg">{t('common.noResults')}</p>
          {isAuthenticated && (
            <Link
              to="/listings/create"
              className="btn-primary mt-4 inline-block"
            >
              {t('listings.createNew')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
