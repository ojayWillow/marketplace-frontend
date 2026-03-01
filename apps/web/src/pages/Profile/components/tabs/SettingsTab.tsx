import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeSettings } from './settings/ThemeSettings';
import { LanguageSettings } from './settings/LanguageSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { LogoutSection } from './settings/LogoutSection';

interface SettingsTabProps {
  onHowItWorks?: () => void;
}

const MarketplaceTeaser = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100/80 dark:border-purple-800/40 px-4 py-3.5 transition-all hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-lg">📦</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t('profile.listings.comingSoonTitle', 'Marketplace')}
                  </span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] rounded-full font-bold uppercase tracking-wider">
                    {t('profile.listings.comingSoonBadge', 'Soon')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('profile.listings.comingSoonTagline', 'Buy & sell locally')}
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-purple-100/60 dark:border-purple-800/30">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('profile.listings.comingSoonDescription', 'Soon you\'ll be able to list products and items for sale right from your profile. Handmade goods, second-hand items, and more.')}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['🏷️', '🛍️', '🎨', '📱', '🪑', '👕'].map((emoji, i) => (
                  <span key={i} className="w-7 h-7 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-sm shadow-sm">
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export const SettingsTab = ({ onHowItWorks }: SettingsTabProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* How It Works */}
      {onHowItWorks && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4">
            <button
              onClick={onHowItWorks}
              className="w-full flex items-center justify-between p-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="text-lg">\u2753</span>
                </div>
                <div className="text-left">
                  <span className="text-base font-medium">
                    {t('settings.howItWorks.title', 'How it works')}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.howItWorks.description', 'Learn how Kolab works')}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <MarketplaceTeaser />

      <ThemeSettings />
      <LanguageSettings />
      <NotificationSettings />
      <LogoutSection />
    </div>
  );
};
