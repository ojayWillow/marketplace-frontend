import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <div className="text-5xl mb-4">⚠️</div>
        <div className="text-2xl font-bold text-red-600 mb-2">
          {t('tasks.errorTitle', 'Oops!')}
        </div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button 
          onClick={onRetry} 
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('tasks.tryAgain', 'Try Again')}
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
