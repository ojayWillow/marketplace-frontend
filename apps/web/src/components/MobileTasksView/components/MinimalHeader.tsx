import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MinimalHeaderProps {
  onSearchOpen: () => void;
  onFilterOpen: () => void;
}

export const MinimalHeader = ({ onSearchOpen, onFilterOpen }: MinimalHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-sm flex-shrink-0 relative" style={{ zIndex: 10000 }}>
      <div className="p-4">
        <div className="flex justify-between items-center">
          {/* Search Button - Left Corner */}
          <button
            onClick={onSearchOpen}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              backgroundColor: 'transparent',
              color: '#9CA3AF',
            }}
            aria-label={t('search.open', 'Open search')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Filter Button - Right Corner */}
          <button
            onClick={onFilterOpen}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              backgroundColor: 'transparent',
              color: '#9CA3AF',
            }}
            aria-label={t('filter.open', 'Open filters')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="4" y2="6.01" />
              <line x1="4" y1="12" x2="4" y2="12.01" />
              <line x1="4" y1="18" x2="4" y2="18.01" />
              <line x1="8" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="8" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
