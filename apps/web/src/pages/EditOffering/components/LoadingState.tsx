import { useTranslation } from 'react-i18next';

interface LoadingStateProps {
  onBack: () => void;
}

export const LoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">{t('common.loading', 'Loading...')}</p>
      </div>
    </div>
  );
};

export const NotFoundState = ({ onBack }: LoadingStateProps) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('editOffering.notFound', 'Offering not found')}
        </h2>
        <button
          onClick={onBack}
          className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
        >
          {t('editOffering.backToServices', 'Back to My Services')}
        </button>
      </div>
    </div>
  );
};
