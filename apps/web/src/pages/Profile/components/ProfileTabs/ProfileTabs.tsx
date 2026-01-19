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
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
      <button onClick={() => onTabChange('about')} className={tabClass('about')}>
        {t('profile.tabs.about')}
      </button>
      
      <button
        onClick={() => onTabChange('tasks')}
        className={`${tabClass('tasks')} relative`}
      >
        {t('profile.tabs.jobs')} {hasContent.tasks && <span className="text-gray-400">({counts.tasks})</span>}
        {/* Only show notifications badge for own profile */}
        {!viewOnly && counts.pendingNotifications > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
            {counts.pendingNotifications}
          </span>
        )}
      </button>
      
      <button onClick={() => onTabChange('offerings')} className={tabClass('offerings')}>
        {t('profile.tabs.services')} {hasContent.offerings && <span className="text-gray-400">({counts.offerings})</span>}
      </button>
      
      <button onClick={() => onTabChange('listings')} className={tabClass('listings')}>
        {t('profile.tabs.listings')} {hasContent.listings && <span className="text-gray-400">({counts.listings})</span>}
      </button>
      
      {/* Always show reviews tab if there are reviews, or if viewing own profile */}
      {(hasContent.reviews || !viewOnly) && (
        <button onClick={() => onTabChange('reviews')} className={tabClass('reviews')}>
          {t('profile.tabs.reviews')} ({counts.reviews})
        </button>
      )}
    </div>
  );
};
