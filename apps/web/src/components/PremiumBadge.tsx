/**
 * Small badge to show on task/offering cards when they have an active premium feature.
 *
 * Usage:
 *   <PremiumBadge type="promoted" />
 *   <PremiumBadge type="urgent" />
 *   <PremiumBadge type="boosted" />
 */
import { useTranslation } from 'react-i18next';

type BadgeType = 'promoted' | 'urgent' | 'boosted';

interface PremiumBadgeProps {
  type: BadgeType;
  className?: string;
}

const BADGE_CONFIG: Record<BadgeType, { icon: string; colorClass: string; labelKey: string; defaultLabel: string }> = {
  promoted: {
    icon: '\u2B50',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    labelKey: 'premium.badge.promoted',
    defaultLabel: 'Promoted',
  },
  urgent: {
    icon: '\u26A1',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-200',
    labelKey: 'premium.badge.urgent',
    defaultLabel: 'Urgent',
  },
  boosted: {
    icon: '\u{1F680}',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-200',
    labelKey: 'premium.badge.boosted',
    defaultLabel: 'Boosted',
  },
};

export default function PremiumBadge({ type, className = '' }: PremiumBadgeProps) {
  const { t } = useTranslation();
  const config = BADGE_CONFIG[type];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.colorClass} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{t(config.labelKey, config.defaultLabel)}</span>
    </span>
  );
}
