import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, ArrowRight, HelpCircle, Clock, Shield } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Home() {
  const { t } = useTranslation()
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
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white hover:bg-green-600 font-semibold rounded-xl transition-colors text-lg"
            >
              {t('home.quickHelpTitle')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Help Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('home.quickHelpTitle')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('home.quickHelpDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Find Help */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('home.findHelp', 'Find Help Nearby')}
              </h3>
              <p className="text-gray-400">
                {t('home.findHelpDesc', 'Connect with people in your area who can help with everyday tasks')}
              </p>
            </div>

            {/* Feature 2: Quick & Easy */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('home.quickEasy', 'Quick & Easy')}
              </h3>
              <p className="text-gray-400">
                {t('home.quickEasyDesc', 'Post a task in minutes and get offers from helpers right away')}
              </p>
            </div>

            {/* Feature 3: Trusted Community */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('home.trustedCommunity', 'Trusted Community')}
              </h3>
              <p className="text-gray-400">
                {t('home.trustedCommunityDesc', 'Verified users with ratings and reviews for peace of mind')}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white hover:bg-green-600 font-semibold rounded-xl transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              {t('home.browseTasksCTA', 'Browse Tasks')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
