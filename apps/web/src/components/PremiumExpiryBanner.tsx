/**
 * Countdown banner showing time remaining on active premium features.
 * Renders a compact bar with icon, label, and live-updating time left.
 * Shows nothing if no features are active.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumExpiry {
  type: 'urgent' | 'boost' | 'promote';
  icon: string;
  labelKey: string;
  defaultLabel: string;
  expiresAt: string;
  colorClass: string;
  bgClass: string;
}

interface PremiumExpiryBannerProps {
  items: Array<{
    type: 'urgent' | 'boost' | 'promote';
    isActive: boolean;
    expiresAt?: string | null;
  }>;
}

const TYPE_CONFIG: Record<string, Omit<PremiumExpiry, 'type' | 'expiresAt'>> = {
  urgent: {
    icon: '⚡',
    labelKey: 'premium.expiry.urgent',
    defaultLabel: 'Urgent',
    colorClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  },
  boost: {
    icon: '🚀',
    labelKey: 'premium.expiry.boost',
    defaultLabel: 'Boost',
    colorClass: 'text-purple-700 dark:text-purple-300',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  },
  promote: {
    icon: '⭐',
    labelKey: 'premium.expiry.promote',
    defaultLabel: 'Promoted',
    colorClass: 'text-yellow-700 dark:text-yellow-300',
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  },
};

function formatTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function PremiumExpiryBanner({ items }: PremiumExpiryBannerProps) {
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  // Update every 30s for live countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const activeItems = items.filter(
    (item) => item.isActive && item.expiresAt && new Date(item.expiresAt).getTime() > Date.now()
  );

  if (activeItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mb-3">
      {activeItems.map((item) => {
        const config = TYPE_CONFIG[item.type];
        const timeLeft = formatTimeLeft(item.expiresAt!);
        if (!timeLeft) return null;

        return (
          <div
            key={item.type}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${config.bgClass}`}
          >
            <span>{config.icon}</span>
            <span className={config.colorClass}>
              {t(config.labelKey, config.defaultLabel)} {t('premium.expiry.activeFor', 'active')} — {timeLeft} {t('premium.expiry.left', 'left')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
