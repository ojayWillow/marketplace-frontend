import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '../../../../constants/categories';

interface MatchingJobsBannerProps {
  matchingCount: number;
  categories: string[];
  onViewJobs: () => void;
}

export const MatchingJobsBanner = ({ matchingCount, categories, onViewJobs }: MatchingJobsBannerProps) => {
  const { t } = useTranslation();
  
  if (matchingCount === 0 || categories.length === 0) return null;
  
  return (
    <div className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="font-semibold">
              {t('tasks.matchingJobs', '{{count}} job(s) match your offerings!', { count: matchingCount })}
            </p>
            <p className="text-blue-100 text-sm">
              {t('tasks.basedOnServices', 'Based on your services')}: {categories.map(c => getCategoryLabel(c)).join(', ')}
            </p>
          </div>
        </div>
        <button 
          onClick={onViewJobs}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          {t('tasks.viewMatchingJobs', 'View Matching Jobs')} →
        </button>
      </div>
    </div>
  );
};

export default MatchingJobsBanner;
