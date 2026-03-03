import { useTranslation } from 'react-i18next';
import type { ActiveTab } from '@marketplace/shared';

interface ProfileTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    tasks: number;
    offerings: number;
    listings: number;
    reviews: number;
    pendingNotifications: number;
  };
  hasContent: {
    tasks: boolean;
    offerings: boolean;
    listings: boolean;
    reviews: boolean;
  };
  viewOnly?: boolean;
}

export const ProfileTabs = ({
  activeTab,
  onTabChange,
  counts,
  hasContent,
  viewOnly = false,
}: ProfileTabsProps) => {
  const { t } = useTranslation();

  const tabClass = (tab: ActiveTab) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-all ${
      activeTab === tab
        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`;

  return (
    <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit">
      <button onClick={() => onTabChange('about')} className={tabClass('about')}>
        {t('profile.tabs.about')}
      </button>
      
      <button
        onClick={() => onTabChange('tasks')}
        className={`${tabClass('tasks')} relative`}
      >
        {t('profile.tabs.jobs')} {hasContent.tasks && <span className="text-gray-400 dark:text-gray-500">({counts.tasks})</span>}
        {!viewOnly && counts.pendingNotifications > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
            {counts.pendingNotifications}
          </span>
        )}
      </button>
      
      <button onClick={() => onTabChange('offerings')} className={tabClass('offerings')}>
        {t('profile.tabs.services')} {hasContent.offerings && <span className="text-gray-400 dark:text-gray-500">({counts.offerings})</span>}
      </button>
      
      {(hasContent.reviews || !viewOnly) && (
        <button onClick={() => onTabChange('reviews')} className={tabClass('reviews')}>
          {t('profile.tabs.reviews')} ({counts.reviews})
        </button>
      )}
    </div>
  );
};
