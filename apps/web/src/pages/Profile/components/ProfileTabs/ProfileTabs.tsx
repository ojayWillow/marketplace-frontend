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

      {/* Settings tab - only for own profile */}
      {!viewOnly && (
        <button 
          onClick={() => onTabChange('settings')} 
          className={`${tabClass('settings')} flex items-center gap-1.5`}
          aria-label={t('profile.tabs.settings', 'Settings')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('profile.tabs.settings', 'Settings')}
        </button>
      )}
    </div>
  );
};
