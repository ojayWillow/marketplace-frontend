import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Terms() {
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
            {t('legal.terms.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('legal.terms.lastUpdated')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">👋</span>
              {t('legal.terms.introTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.introText')}
            </p>
          </section>

          {/* Platform Role */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              {t('legal.terms.platformRoleTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.terms.platformRoleText')}
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">💡 </span>
                {t('legal.terms.platformRoleNote')}
              </p>
            </div>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              {t('legal.terms.userResponsibilityTitle')}
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.terms.userResponsibility1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.terms.userResponsibility2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.terms.userResponsibility3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {t('legal.terms.userResponsibility4')}
              </li>
            </ul>
          </section>

          {/* Age Requirement */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎂</span>
              {t('legal.terms.ageTitle')}
            </h2>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-amber-800">
                <span className="font-semibold">{t('legal.terms.ageRequirement')}</span>
                {' '}{t('legal.terms.ageText')}
              </p>
            </div>
          </section>

          {/* No Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              {t('legal.terms.liabilityTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.terms.liabilityText')}
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                {t('legal.terms.liability1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                {t('legal.terms.liability2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                {t('legal.terms.liability3')}
              </li>
            </ul>
          </section>

          {/* Fees */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              {t('legal.terms.feesTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.feesText')}
            </p>
          </section>

          {/* Prohibited */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🚫</span>
              {t('legal.terms.prohibitedTitle')}
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {t('legal.terms.prohibited1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {t('legal.terms.prohibited2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {t('legal.terms.prohibited3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {t('legal.terms.prohibited4')}
              </li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              {t('legal.terms.changesTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.changesText')}
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              {t('legal.terms.contactTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.contactText')}{' '}
              <a href="mailto:info@marketplace.lv" className="text-blue-600 hover:underline">
                info@marketplace.lv
              </a>
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t('legal.privacy.title')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
