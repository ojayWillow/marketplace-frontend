import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListings } from '../hooks/useListings'
import ListingCard from './listings/components/ListingCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Home() {
  const { t } = useTranslation()
  const { data: listings, isLoading } = useListings({ per_page: 6 })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.hero')}
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                              to="/listings"
                              className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-lg font-semibold"
            >
                {t('home.buysell')}
              </Link>
              <Link
                to="/tasks"
                className="btn bg-primary-500 text-white hover:bg-primary-400 border-2 border-white px-8 py-3 text-lg font-semibold"
              >
                {t('home.quickHelpTitle')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Buy/Sell Card */}
            <Link
              to="//listings"
              className="card p-8 hover:shadow-lg transition-shadow group"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('home.buysell')}
              </h2>
              <p className="text-gray-600">
                {t('home.buysellDesc')}
              </p>
            </Link>

            {/* Quick Help Card */}
            <Link
              to="/tasks"
              className="card p-8 hover:shadow-lg transition-shadow group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('home.quickHelpTitle')}
              </h2>
              <p className="text-gray-600">
                {t('home.quickHelpDesc')}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Listings Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('home.latestListings')}
            </h2>
            <Link
              to="/listings"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('common.viewAll')} →
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : listings && listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {t('common.noResults')}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
