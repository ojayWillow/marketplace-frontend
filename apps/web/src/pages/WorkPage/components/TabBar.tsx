import { useTranslation } from 'react-i18next';
import { MainTab } from '../types';

interface TabBarProps {
  mainTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onFilterClick: () => void;
  selectedCategoryCount: number;
  itemCount: number;
  refreshing: boolean;
  initialLoading: boolean;
  hasError: boolean;
  hasUserLocation: boolean;
  pendingNotifications?: number;
}

const TabBar = ({
  mainTab,
  onTabChange,
  onFilterClick,
  selectedCategoryCount,
  itemCount,
  refreshing,
  initialLoading,
  hasError,
  hasUserLocation,
  pendingNotifications = 0,
}: TabBarProps) => {
  const { t } = useTranslation();

  const isMineTab = mainTab === 'mine';

  return (
    <div className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/50 z-50">
      <div className="relative flex items-center justify-center px-4 py-3">
        <div className="flex gap-2">
          {(['all', 'jobs', 'services', 'mine'] as MainTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mainTab === tab
                  ? tab === 'mine'
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tab === 'mine'
                ? t('work.tabMine', 'Mans')
                : t(`tasks.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              {tab === 'mine' && pendingNotifications > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold min-w-[18px] text-center">
                  {pendingNotifications}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter button — hidden when in Mine tab (Mine has its own sub-filters) */}
        {!isMineTab && (
          <button
            onClick={onFilterClick}
            className="absolute right-4 flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full"
            aria-label={t('tasks.filters', 'Filter')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-700 dark:text-gray-300">
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
            {selectedCategoryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {selectedCategoryCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Result count — only for marketplace tabs */}
      {!isMineTab && !initialLoading && !hasError && itemCount > 0 && (
        <div className="px-4 pb-2 flex items-center justify-center gap-1">
          {refreshing && (
            <span className="inline-block animate-spin text-blue-500 text-sm">↻</span>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {itemCount} {itemCount === 1 ? t('tasks.result') : t('tasks.results')}
            {hasUserLocation && (
              <>
                <span className="mx-1.5">·</span>
                <span className="text-gray-400 dark:text-gray-500">{t('tasks.sortedByDistance')}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TabBar;
