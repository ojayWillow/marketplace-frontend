import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MobileListingsTeaser = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 px-4 py-3 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📦</span>
          <span className="text-sm font-medium text-gray-700">
            {t('profile.listings.comingSoonTitle', 'Listings')}
          </span>
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded-full font-semibold uppercase tracking-wide">
            {t('profile.listings.comingSoonBadge', 'Soon')}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {t('profile.listings.comingSoonDescription', 'Soon you\'ll be able to list products and items for sale right from your profile. Handmade goods, second-hand items, and more.')}
        </p>
      )}
    </button>
  );
};
