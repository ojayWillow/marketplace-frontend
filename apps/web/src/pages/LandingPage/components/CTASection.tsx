import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t border-gray-200 dark:border-[#1a1a24]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
          {t('landing.cta.subtitle')}
        </p>
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          {t('landing.cta.button')} <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
};

export default CTASection;
