import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 border-t-2 border-slate-700"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-5 group">
              <img 
                src="/android-chrome-192x192.png" 
                alt="Kolab logo" 
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <span className="font-bold text-2xl text-white group-hover:text-blue-400 transition-colors">
                Kolab
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Kolab Links */}
          <nav aria-label="Footer navigation - Kolab">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Kolab
            </h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link 
                  to="/tasks" 
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex transition-all duration-200"
                >
                  {t('tasks.browseTasks', 'Browse Tasks')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/tasks/create" 
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex transition-all duration-200"
                >
                  {t('tasks.createTask', 'Post a Job')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              {t('common.contact')}
            </h3>
            <address className="not-italic">
              <ul className="space-y-3" role="list">
                <li>
                  <a 
                    href="mailto:info@kolab.lv" 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="Send email to info@kolab.lv"
                  >
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@kolab.lv
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Riga, Latvia
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} Kolab. {t('footer.allRightsReserved', 'All rights reserved.')}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                to="/terms" 
                className="text-slate-500 hover:text-white transition-colors"
              >
                {t('legal.terms.title')}
              </Link>
              <Link 
                to="/privacy" 
                className="text-slate-500 hover:text-white transition-colors"
              >
                {t('legal.privacy.title')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
