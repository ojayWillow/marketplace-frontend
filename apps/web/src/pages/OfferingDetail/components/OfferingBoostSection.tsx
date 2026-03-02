/**
 * Offering premium section — shows paid Boost and Promote buttons.
 * Includes expiry countdown banners for active features.
 * Only visible to the offering owner.
 */
import { useTranslation } from 'react-i18next';
import PaymentButton from '../../../components/PaymentButton';
import PremiumExpiryBanner from '../../../components/PremiumExpiryBanner';
import { Offering } from '@marketplace/shared';

interface OfferingPremiumSectionProps {
  offering: Offering & {
    is_promote_active?: boolean;
    promoted_expires_at?: string;
  };
}

const OfferingBoostSection = ({ offering }: OfferingPremiumSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="mx-4 mb-3 md:mx-6 md:mb-5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <h3 className="font-bold text-xs text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
        🚀 {t('offering.premium.title', 'Boost & Promote')}
      </h3>

      {/* Live countdown banners for active features */}
      <PremiumExpiryBanner
        items={[
          { type: 'boost', isActive: !!offering.is_boost_active, expiresAt: offering.boost_expires_at || null },
          { type: 'promote', isActive: !!offering.is_promote_active, expiresAt: offering.promoted_expires_at || null },
        ]}
      />

      <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
        {t('offering.premium.desc', 'Get more visibility for your offering')}
      </p>
      <div className="flex flex-wrap gap-2">
        <PaymentButton
          type="boost_offering"
          targetId={offering.id}
          isActive={!!offering.is_boost_active}
          expiresAt={offering.boost_expires_at || null}
          size="sm"
        />
        <PaymentButton
          type="promote_offering"
          targetId={offering.id}
          isActive={!!offering.is_promote_active}
          expiresAt={offering.promoted_expires_at || null}
          size="sm"
        />
      </div>
    </div>
  );
};

export default OfferingBoostSection;
