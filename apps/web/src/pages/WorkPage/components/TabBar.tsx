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

  const tabs: { key: MainTab; label: string }[] = [
    { key: 'all', label: t('tasks.tabAll', 'All') },
    { key: 'jobs', label: t('tasks.tabJobs', 'Jobs') },
    { key: 'services', label: t('tasks.tabServices', 'Services') },
    { key: 'mine', label: t('tasks.tabMine', 'Mine') },
  ];

  return (
    <div className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/50 z-50">
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        {/* Tab buttons — fill available space evenly */}
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative flex-1 py-2 rounded-full text-[13px] font-semibold transition-all text-center ${
              mainTab === tab.key
                ? tab.key === 'mine'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.key === 'mine' && pendingNotifications > 0 && (
              <span className="absolute -top-1 -right-0.5 px-1 py-0.5 text-[9px] rounded-full bg-red-500 text-white font-bold min-w-[16px] text-center leading-none">
                {pendingNotifications}
              </span>
            )}
          </button>
        ))}

        {/* Filter button — inline, same height as tabs, hidden on Mine tab */}
        {!isMineTab && (
          <button
            onClick={onFilterClick}
            className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full transition-colors active:bg-gray-200 dark:active:bg-gray-700"
            aria-label={t('tasks.filters', 'Filter')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600 dark:text-gray-300">
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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
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
            <span className="inline-block animate-spin text-blue-500 text-xs">↻</span>
          )}
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {itemCount} {itemCount === 1 ? t('tasks.result') : t('tasks.results')}
            {hasUserLocation && (
              <>
                <span className="mx-1">·</span>
                <span>{t('tasks.sortedByDistance')}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TabBar;
