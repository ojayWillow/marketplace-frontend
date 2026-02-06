import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentSearches?: string[];
}

export const SearchOverlay = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  recentSearches = [],
}: SearchOverlayProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when overlay opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white z-[20000] flex flex-col"
      style={{ animation: 'slideDown 0.2s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors"
          aria-label={t('common.close', 'Close')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('tasks.searchPlaceholder', 'Search jobs or categories...')}
            className="w-full bg-gray-100 rounded-full px-4 py-3 pl-11 text-base text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches / Suggestions */}
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery && recentSearches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              {t('search.recent', 'Recent searches')}
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearchChange(search)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-left transition-colors"
                >
                  <span className="text-gray-400">🕒</span>
                  <span className="flex-1 text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && recentSearches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">
              {t('search.startTyping', 'Start typing to search...')}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
