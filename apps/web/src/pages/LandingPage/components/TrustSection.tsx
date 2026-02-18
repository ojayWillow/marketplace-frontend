import { Phone, Star, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
};

const TrustSection = () => {
  const { t } = useTranslation();

  const trustItems = [
    {
      icon: Phone,
      color: 'blue',
      title: t('landing.trust.phoneVerified'),
      desc: t('landing.trust.phoneVerifiedDesc'),
    },
    {
      icon: Star,
      color: 'yellow',
      title: t('landing.trust.ratingsReviews'),
      desc: t('landing.trust.ratingsReviewsDesc'),
    },
    {
      icon: MessageCircle,
      color: 'green',
      title: t('landing.trust.inAppChat'),
      desc: t('landing.trust.inAppChatDesc'),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t border-gray-200 dark:border-[#1a1a24]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('landing.trust.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">{t('landing.trust.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {trustItems.map((item) => {
            const colors = colorMap[item.color];
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} />
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
