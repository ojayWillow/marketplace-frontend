import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="bg-gray-900 text-gray-400"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl text-white group-hover:text-primary-400 transition-colors">
                {t('common.appName')}
              </span>
            </Link>
            <p className="text-sm">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation - Listings">
            <h3 className="text-white font-semibold mb-4">
              {t('common.listings')}
            </h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link 
                  to="/listings" 
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  {t('listings.allListings')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/listings/create" 
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  {t('listings.createNew')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/tasks" 
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  {t('common.quickHelp')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t('common.contact')}
            </h3>
            <address className="not-italic">
              <ul className="space-y-2 text-sm" role="list">
                <li>
                  <a 
                    href="mailto:info@marketplace.lv" 
                    className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                    aria-label="Send email to info@marketplace.lv"
                  >
                    info@marketplace.lv
                  </a>
                </li>
                <li>Riga, Latvia</li>
              </ul>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {currentYear} {t('common.appName')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
