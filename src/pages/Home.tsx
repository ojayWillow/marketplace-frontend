import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Users, ArrowRight, Image } from 'lucide-react'
import { useListings } from '../hooks/useListings'
import { useIsMobile } from '../hooks/useIsMobile'
import ListingCard from './listings/components/ListingCard'

export default function Home() {
  const { t } = useTranslation()
  const { data: listings, isLoading } = useListings({ per_page: 6 })
  const isMobile = useIsMobile()

  // Redirect mobile users to Quick Help (Tasks) page
  if (isMobile) {
    return <Navigate to="/tasks" replace />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 via-blue-700 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {t('home.hero')}
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition-colors text-lg"
              >
                {t('home.buysell')}
              </Link>
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white hover:bg-green-600 font-semibold rounded-xl transition-colors text-lg"
              >
                {t('home.quickHelpTitle')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buy/Sell Card */}
            <Link
              to="/listings"
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 hover:border-gray-600 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('home.buysell')}
              </h2>
              <p className="text-gray-400">
                {t('home.buysellDesc')}
              </p>
            </Link>

            {/* Quick Help Card */}
            <Link
              to="/tasks"
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 hover:border-gray-600 transition-all group"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('home.quickHelpTitle')}
              </h2>
              <p className="text-gray-400">
                {t('home.quickHelpDesc')}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Listings Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              {t('home.latestListings')}
            </h2>
            <Link
              to="/listings"
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">{t('common.noResults')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
