import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MobileListingsTeaser = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-100/80 px-4 py-3.5 transition-all hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">📦</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {t('profile.listings.comingSoonTitle', 'Listings')}
              </span>
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] rounded-full font-bold uppercase tracking-wider">
                {t('profile.listings.comingSoonBadge', 'Soon')}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('profile.listings.comingSoonTagline', 'Buy & sell locally')}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-purple-100/60">
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('profile.listings.comingSoonDescription', 'Soon you\'ll be able to list products and items for sale right from your profile. Handmade goods, second-hand items, and more.')}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['🏷️', '🛍️', '🎨', '📱', '🪑', '👕'].map((emoji, i) => (
              <span key={i} className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-sm shadow-sm">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};
