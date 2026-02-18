import { useTranslation } from 'react-i18next';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const helpSteps = [
    { num: '1', title: t('landing.howItWorks.step1Title_help'), desc: t('landing.howItWorks.step1Desc_help') },
    { num: '2', title: t('landing.howItWorks.step2Title_help'), desc: t('landing.howItWorks.step2Desc_help') },
    { num: '3', title: t('landing.howItWorks.step3Title_help'), desc: t('landing.howItWorks.step3Desc_help') },
  ];

  const earnSteps = [
    { num: '1', title: t('landing.howItWorks.step1Title_earn'), desc: t('landing.howItWorks.step1Desc_earn') },
    { num: '2', title: t('landing.howItWorks.step2Title_earn'), desc: t('landing.howItWorks.step2Desc_earn') },
    { num: '3', title: t('landing.howItWorks.step3Title_earn'), desc: t('landing.howItWorks.step3Desc_earn') },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t border-gray-200 dark:border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('landing.howItWorks.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-16">
          {/* Need help? */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-5 sm:mb-6">
              {t('landing.howItWorks.needHelp')}
            </div>
            <div className="space-y-5 sm:space-y-6">
              {helpSteps.map((item) => (
                <div key={item.num} className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">{item.num}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Want to earn? */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-5 sm:mb-6">
              {t('landing.howItWorks.wantToEarn')}
            </div>
            <div className="space-y-5 sm:space-y-6">
              {earnSteps.map((item) => (
                <div key={item.num} className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm sm:text-base">{item.num}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
