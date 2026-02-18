import { useTranslation } from 'react-i18next';

interface FloatingSearchBarProps {
  searchExpanded: boolean;
  onToggleSearch: (expanded: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

/**
 * Floating search and filter bar at the top of the map.
 * Collapses to icon buttons, expands to a full search input.
 */
const FloatingSearchBar = ({
  searchExpanded,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  onOpenFilters,
  activeFilterCount,
}: FloatingSearchBarProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="absolute left-4 right-4 z-[1000] flex items-center gap-2"
      style={{ top: 'calc(16px + env(safe-area-inset-top, 0px))' }}
    >
      {!searchExpanded ? (
        <>
          <button
            onClick={() => onToggleSearch(true)}
            className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-gray-900/50 active:bg-gray-100 dark:active:bg-gray-700"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-gray-700 dark:text-gray-300"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <div className="flex-1" />
        </>
      ) : (
        <>
          <button
            onClick={() => {
              onToggleSearch(false);
              onSearchChange('');
            }}
            className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-gray-900/50 active:bg-gray-100 dark:active:bg-gray-700"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-gray-700 dark:text-gray-300"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('tasks.searchPlaceholder', 'Search jobs...')}
            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-4 py-3 text-base shadow-lg dark:shadow-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
            autoFocus
          />
        </>
      )}

      {/* Filter Button — always visible with badge */}
      <button
        onClick={onOpenFilters}
        className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-gray-900/50 active:bg-gray-100 dark:active:bg-gray-700 relative"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-gray-700 dark:text-gray-300"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingSearchBar;
