import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useListings } from '../hooks/useListings'
import ListingCard from './listings/components/ListingCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Home() {
  const { t } = useTranslation()
  const { data: listings, isLoading } = useListings({ per_page: 6 })
  const [showTermsModal, setShowTermsModal] = useState(false)

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
              to="/listings"
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

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📋 {t('quickHelp.howItWorks', 'How It Works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.howItWorksSubtitle', 'Get started in minutes - buy, sell, or find quick help in your community')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4">
                🔍
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('quickHelp.browse', 'Browse')}
              </h3>
              <p className="text-gray-600">
                {t('home.browseDesc', 'Find listings or jobs on the map near you')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-4">
                📝
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('quickHelp.apply', 'Apply')}
              </h3>
              <p className="text-gray-600">
                {t('home.applyDesc', 'Contact sellers or apply for jobs')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-4xl mb-4">
                🤝
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('home.connect', 'Connect')}
              </h3>
              <p className="text-gray-600">
                {t('home.connectDesc', 'Meet up or coordinate the work')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-4xl mb-4">
                ✅
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('home.complete', 'Complete')}
              </h3>
              <p className="text-gray-600">
                {t('home.completeDesc', 'Finish the transaction and leave reviews')}
              </p>
            </div>
          </div>

          {/* Legal Footer with Terms & Privacy */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {t('home.byUsing', 'By using our platform, you agree to our')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                {t('footer.terms', 'Terms of Service')}
              </button>
              <span className="hidden sm:inline text-gray-400">•</span>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                {t('footer.privacy', 'Privacy Policy')}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {t('home.respectfulUse', 'We promote respectful interactions, fair transactions, and community trust. Report any issues to our support team.')}
              </p>
            </div>
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

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {t('footer.terms', 'Terms of Service')} & {t('footer.privacy', 'Privacy Policy')}
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h4>
                <p className="text-gray-700 mb-4">
                  By using Quick Help, you agree to use the platform responsibly and in good faith. 
                  You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                  <li>Provide accurate information in your job postings or service offerings</li>
                  <li>Complete jobs you commit to as a helper</li>
                  <li>Pay helpers fairly and promptly for completed work</li>
                  <li>Treat all users with respect and professionalism</li>
                  <li>Not post illegal, harmful, or fraudulent content</li>
                  <li>Report any issues or disputes through proper channels</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">Privacy Policy</h4>
                <p className="text-gray-700 mb-4">
                  We respect your privacy and are committed to protecting your personal data.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                  <li><strong>Information we collect:</strong> Profile information, location data (for showing nearby jobs), job/offering details, messages between users</li>
                  <li><strong>How we use it:</strong> To connect job posters with helpers, show relevant opportunities, facilitate communication, and improve the service</li>
                  <li><strong>Data sharing:</strong> We do not sell your personal data. Location and profile info is shared with other users only as needed for the service (e.g., showing your job on the map)</li>
                  <li><strong>Your rights:</strong> You can view, edit, or delete your data at any time through your profile settings</li>
                  <li><strong>Security:</strong> We use industry-standard security measures to protect your data</li>
                </ul>

                <p className="text-sm text-gray-600">
                  For full details, visit our{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                  {' '}pages.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
