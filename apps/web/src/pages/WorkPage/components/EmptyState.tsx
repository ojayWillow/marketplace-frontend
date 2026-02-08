import { useTranslation } from 'react-i18next';
import { MainTab } from '../types';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">\u26A0\uFE0F</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('work.failedToLoad', 'Failed to load')}
      </h3>
      <p className="text-sm text-gray-500 mb-1 max-w-xs mx-auto">{error}</p>
      <p className="text-xs text-gray-400 mb-4">
        {t('work.checkConnection', 'Make sure you have internet and try again.')}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
      >
        \uD83D\uDD04 {t('work.retry', 'Try again')}
      </button>
    </div>
  );
};

interface EmptyStateProps {
  mainTab: MainTab;
  hasFilters: boolean;
}

export const EmptyState = ({ mainTab, hasFilters }: EmptyStateProps) => {
  const { t } = useTranslation();

  const icon = mainTab === 'jobs' ? '\uD83D\uDCBC' : mainTab === 'services' ? '\uD83D\uDEE0\uFE0F' : '\uD83D\uDCED';
  const title = mainTab === 'jobs'
    ? t('work.noJobs', 'No jobs found')
    : mainTab === 'services'
      ? t('work.noServices', 'No services found')
      : t('work.noItems', 'No jobs or services found');
  const subtitle = hasFilters
    ? t('work.tryClearingFilters', 'Try clearing your category filters or check back later.')
    : t('work.tryDifferentFilters', 'Try different filters or check back later.');

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
};

interface InlineErrorProps {
  error: string;
  onRetry: () => void;
}

export const InlineError = ({ error, onRetry }: InlineErrorProps) => (
  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
    <p className="text-xs text-amber-700 flex-1">\u26A0\uFE0F {error}</p>
    <button
      onClick={onRetry}
      className="ml-2 text-xs font-semibold text-amber-700 underline"
    >
      Retry
    </button>
  </div>
);
