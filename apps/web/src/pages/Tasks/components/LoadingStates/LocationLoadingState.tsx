import { useTranslation } from 'react-i18next';

interface LocationLoadingStateProps {
  onSkip: () => void;
}

const LocationLoadingState = ({ onSkip }: LocationLoadingStateProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg dark:shadow-gray-950/50 max-w-md border border-transparent dark:border-gray-800">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">📍</div>
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tasks.findingLocation', 'Finding your location...')}
        </div>
        <div className="text-gray-600 dark:text-gray-400 mb-4">
          {t('tasks.locationHelp', 'This helps show nearby jobs and services')}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <button 
          onClick={onSkip}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline"
        >
          {t('tasks.skipLocation', 'Skip → Use Riga as default')}
        </button>
      </div>
    </div>
  );
};

export default LocationLoadingState;
