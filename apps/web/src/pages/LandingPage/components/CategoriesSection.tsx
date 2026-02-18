import { useTranslation } from 'react-i18next';

const CategoriesSection = () => {
  const { t } = useTranslation();

  const categories = [
    { icon: '🐕', label: t('landing.categories.petCare'), desc: t('landing.categories.petCareDesc') },
    { icon: '📦', label: t('landing.categories.moving'), desc: t('landing.categories.movingDesc') },
    { icon: '🧹', label: t('landing.categories.cleaning'), desc: t('landing.categories.cleaningDesc') },
    { icon: '🚗', label: t('landing.categories.delivery'), desc: t('landing.categories.deliveryDesc') },
    { icon: '🔧', label: t('landing.categories.repairs'), desc: t('landing.categories.repairsDesc') },
    { icon: '💻', label: t('landing.categories.techHelp'), desc: t('landing.categories.techHelpDesc') },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t border-gray-200 dark:border-[#1a1a24]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('landing.categories.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">{t('landing.categories.subtitle')}</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-gray-50 hover:bg-gray-100 dark:bg-[#1a1a24]/50 dark:hover:bg-[#1a1a24] border border-gray-200 hover:border-gray-300 dark:border-[#2a2a3a] dark:hover:border-[#3a3a4a] rounded-xl p-3 sm:p-4 text-center transition-all group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cat.icon}</div>
              <div className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cat.label}</div>
              <div className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">{cat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
