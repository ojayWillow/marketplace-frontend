import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Terms() {
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
            {t('legal.terms.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('legal.terms.lastUpdated', { date: currentDate })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('legal.terms.intro')}
            </p>
          </section>

          {/* 1. What We Are */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.platform.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.sections.platform.content')}
            </p>
          </section>

          {/* 2. Our Role & Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.noLiability.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.terms.sections.noLiability.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.terms.sections.noLiability.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Your Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.userResponsibility.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.terms.sections.userResponsibility.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.terms.sections.userResponsibility.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Age Requirement */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.age.title')}
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900">
                {t('legal.terms.sections.age.content')}
              </p>
            </div>
          </section>

          {/* 5. Free Platform */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.noFees.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.sections.noFees.content')}
            </p>
          </section>

          {/* 6. User Content */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.content.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.terms.sections.content.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4 mb-4">
              {(t('legal.terms.sections.content.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.sections.content.removal')}
            </p>
          </section>

          {/* 7. Safety Guidelines */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.safety.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('legal.terms.sections.safety.content')}
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              {(t('legal.terms.sections.safety.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 8. Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.disclaimer.title')}
            </h2>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('legal.terms.sections.disclaimer.content')}
              </p>
            </div>
          </section>

          {/* 9. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.changes.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.sections.changes.content')}
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('legal.terms.sections.contact.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.sections.contact.content')}{' '}
              <a href={`mailto:${t('legal.terms.sections.contact.email')}`} className="text-blue-600 hover:underline">
                {t('legal.terms.sections.contact.email')}
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
