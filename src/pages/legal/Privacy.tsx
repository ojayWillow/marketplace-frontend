import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.backToHome')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('legal.privacy.lastUpdated')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              {t('legal.privacy.introTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.introText')}
            </p>
          </section>

          {/* What We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              {t('legal.privacy.collectTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.collectIntro')}
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t('legal.privacy.collect1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t('legal.privacy.collect2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t('legal.privacy.collect3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {t('legal.privacy.collect4')}
              </li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              {t('legal.privacy.useTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.useIntro')}
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.privacy.use1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.privacy.use2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.privacy.use3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.privacy.use4')}
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🚫</span>
              {t('legal.privacy.sharingTitle')}
            </h2>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">
                ✅ {t('legal.privacy.sharingHighlight')}
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sharingText')}
            </p>
          </section>

          {/* User Control */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              {t('legal.privacy.controlTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.controlIntro')}
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {t('legal.privacy.control1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {t('legal.privacy.control2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {t('legal.privacy.control3')}
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🍪</span>
              {t('legal.privacy.cookiesTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.cookiesText')}
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              {t('legal.privacy.securityTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.securityText')}
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              {t('legal.privacy.changesTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.changesText')}
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              {t('legal.privacy.contactTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.contactText')}{' '}
              <a href="mailto:info@marketplace.lv" className="text-blue-600 hover:underline">
                info@marketplace.lv
              </a>
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link to="/terms" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t('legal.terms.title')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
