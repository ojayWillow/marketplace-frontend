import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Privacy() {
  const { t } = useTranslation();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
            {t('common.backToHome', 'Back to Home')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('legal.privacy.lastUpdated', { date: currentDate })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('legal.privacy.intro')}
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.collect.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.sections.collect.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4 mb-4">
              {(t('legal.privacy.sections.collect.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.sections.collect.automatic')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.privacy.sections.collect.automaticList', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.use.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.sections.use.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.privacy.sections.use.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Information Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.sharing.title')}
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">
                ✅ {t('legal.privacy.sections.sharing.content')}
              </p>
            </div>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.privacy.sections.sharing.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.security.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.security.content')}
            </p>
          </section>

          {/* 5. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.rights.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.privacy.sections.rights.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4 mb-4">
              {(t('legal.privacy.sections.rights.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.rights.howTo')}
            </p>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.cookies.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.cookies.content')}
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.retention.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.retention.content')}
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.children.title')}
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900">
                {t('legal.privacy.sections.children.content')}
              </p>
            </div>
          </section>

          {/* 9. Changes to This Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.changes.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.changes.content')}
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.privacy.sections.contact.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.sections.contact.content')}{' '}
              <a href={`mailto:${t('legal.privacy.sections.contact.email')}`} className="text-blue-600 hover:underline">
                {t('legal.privacy.sections.contact.email')}
              </a>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {t('legal.privacy.sections.contact.location')}
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
