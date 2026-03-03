import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ThemeSettings } from './settings/ThemeSettings';
import { LanguageSettings } from './settings/LanguageSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { LogoutSection } from './settings/LogoutSection';

const MarketplaceTeaser = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">📦</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('profile.listings.comingSoonTitle', 'Marketplace')}
              </span>
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[8px] rounded-full font-bold uppercase tracking-wider">
                {t('profile.listings.comingSoonBadge', 'Soon')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('profile.listings.comingSoonTagline', 'Buy & sell locally')}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`transition-all duration-200 overflow-hidden ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-12 py-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('profile.listings.comingSoonDescription', 'Soon you\'ll be able to list products and items for sale right from your profile. Handmade goods, second-hand items, and more.')}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['🏷️', '🛍️', '🎨', '📱', '🪑', '👕'].map((emoji, i) => (
              <span key={i} className="w-6 h-6 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-xs shadow-sm">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsTab = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Main settings card — compact rows */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-2 divide-y divide-gray-100 dark:divide-gray-700/50">
          <MarketplaceTeaser />
          <ThemeSettings />
          <LanguageSettings />
        </div>
      </div>

      {/* Push notifications — own card since it's more complex */}
      <NotificationSettings />

      {/* Logout */}
      <LogoutSection />
    </div>
  );
};
