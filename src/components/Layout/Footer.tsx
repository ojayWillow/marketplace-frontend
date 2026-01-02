import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl text-white">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-sm">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t('common.listings')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/listings" className="hover:text-white transition-colors">
                  {t('listings.allListings')}
                </a>
              </li>
              <li>
                <a href="/listings/create" className="hover:text-white transition-colors">
                  {t('listings.createNew')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t('common.contact')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>info@marketplace.lv</li>
              <li>Riga, Latvia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {currentYear} {t('common.appName')}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
