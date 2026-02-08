import { useTranslation } from 'react-i18next';
import { ActiveTab } from '../hooks';

interface TabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  jobsCount: number;
  offeringsCount: number;
  urgentJobsCount: number;
}

const TabBar = ({ activeTab, onTabChange, jobsCount, offeringsCount, urgentJobsCount }: TabBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex gap-2 flex-wrap relative" style={{ zIndex: 1 }}>
      <button
        onClick={() => onTabChange('all')}
        className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}
      >
        \uD83C\uDF10 {t('common.all', 'All')} ({jobsCount + offeringsCount})
      </button>
      <button
        onClick={() => onTabChange('jobs')}
        className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors relative ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}
      >
        \uD83D\uDCB0 {t('common.jobs', 'Jobs')} ({jobsCount})
        {urgentJobsCount > 0 && activeTab !== 'jobs' && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {urgentJobsCount} \u26A1
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('offerings')}
        className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'offerings' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}
      >
        \uD83D\uDC4B {t('common.offerings', 'Offerings')} ({offeringsCount})
      </button>
    </div>
  );
};

export default TabBar;
