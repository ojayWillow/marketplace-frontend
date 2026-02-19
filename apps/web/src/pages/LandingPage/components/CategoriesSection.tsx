import { useTranslation } from 'react-i18next';

const CategoriesSection = () => {
  const { t } = useTranslation();

  const categories = [
    { icon: '🐕', label: t('landing.categories.care'), desc: t('landing.categories.careDesc') },
    { icon: '📦', label: t('landing.categories.moving'), desc: t('landing.categories.movingDesc') },
    { icon: '🧹', label: t('landing.categories.cleaning'), desc: t('landing.categories.cleaningDesc') },
    { icon: '🚗', label: t('landing.categories.delivery'), desc: t('landing.categories.deliveryDesc') },
    { icon: '🔧', label: t('landing.categories.handyman'), desc: t('landing.categories.handymanDesc') },
    { icon: '💻', label: t('landing.categories.tech'), desc: t('landing.categories.techDesc') },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t border-gray-200 dark:border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('landing.categories.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{t('landing.categories.subtitle')}</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 border border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 rounded-xl p-3 sm:p-4 text-center transition-all group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cat.icon}</div>
              <div className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cat.label}</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs hidden sm:block">{cat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
