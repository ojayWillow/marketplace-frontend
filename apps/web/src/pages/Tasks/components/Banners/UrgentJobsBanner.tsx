import { useTranslation } from 'react-i18next';

interface UrgentJobsBannerProps {
  urgentCount: number;
  onViewJobs: () => void;
}

export const UrgentJobsBanner = ({ urgentCount, onViewJobs }: UrgentJobsBannerProps) => {
  const { t } = useTranslation();
  
  if (urgentCount === 0) return null;
  
  return (
    <div className="mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-semibold">
              {t('tasks.urgentJobsAvailable', '{{count}} urgent job(s) need help ASAP!', { count: urgentCount })}
            </p>
            <p className="text-red-100 text-sm">
              {t('tasks.urgentJobsDesc', 'These jobs are time-sensitive and need immediate attention')}
            </p>
          </div>
        </div>
        <button 
          onClick={onViewJobs}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          {t('tasks.viewUrgentJobs', 'View Urgent Jobs')} →
        </button>
      </div>
    </div>
  );
};

export default UrgentJobsBanner;
