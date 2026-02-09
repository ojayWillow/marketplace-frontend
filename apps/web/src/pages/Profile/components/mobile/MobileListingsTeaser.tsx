import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MobileListingsTeaser = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 border-dashed overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl opacity-60">📦</span>
          <div>
            <span className="text-sm font-medium text-gray-500">
              {t('profile.listings.comingSoonTitle', 'Listings')}
            </span>
            <span className="ml-2 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">
              {t('profile.listings.comingSoonBadge', 'Coming Soon')}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('profile.listings.comingSoonDescription', 'Soon you\'ll be able to list your products and items for sale right from your profile. Whether it\'s handmade goods, second-hand items, or anything else — your listings will appear here.')}
          </p>
        </div>
      )}
    </div>
  );
};
