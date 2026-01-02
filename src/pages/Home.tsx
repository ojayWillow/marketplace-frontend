import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useListings } from '../api/hooks/useListings'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Home() {
  const { t } = useTranslation()
  const { data: listings, isLoading } = useListings({ limit: 6 })

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/listings"
                className="btn bg-white text-primary-600 hover:bg-primary-50 text-center"
              >
                {t('home.browseListings')}
              </Link>
              <Link
                to="/listings/new"
                className="btn bg-primary-500 text-white hover:bg-primary-400 text-center"
              >
                {t('home.postListing')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white border-b">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'electronics', icon: '📱' },
              { key: 'vehicles', icon: '🚗' },
              { key: 'property', icon: '🏠' },
              { key: 'services', icon: '🔧' },
            ].map((category) => (
              <Link
                key={category.key}
                to={`/listings?category=${category.key}`}
                className="card p-6 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-medium text-secondary-700">
                  {t(`categories.${category.key}`)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="container-page py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">
            {t('home.featuredListings')}
          </h2>
          <Link
            to="/listings"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('common.all')} →
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-secondary-100 flex items-center justify-center text-4xl">
                  📷
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-secondary-900 mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      €{listing.price}
                    </span>
                    <span className="text-sm text-secondary-500">
                      {listing.location}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-secondary-50 py-12">
        <div className="container-page">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
              <p className="text-secondary-600">
                Post your listing in minutes with our simple interface
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Secure</h3>
              <p className="text-secondary-600">
                Your data is protected with industry-standard security
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-lg mb-2">Fast</h3>
              <p className="text-secondary-600">
                Connect with buyers and sellers in your area instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
