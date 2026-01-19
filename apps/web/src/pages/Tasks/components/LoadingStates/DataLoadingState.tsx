import { useTranslation } from 'react-i18next';

interface DataLoadingStateProps {
  searchRadius: number;
  locationName: string;
}

const DataLoadingState = ({ searchRadius, locationName }: DataLoadingStateProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <div className="text-xl font-bold text-gray-900 mb-2">
          💰 {t('tasks.findingOpportunities', 'Finding opportunities...')}
        </div>
        <div className="text-gray-600">
          {searchRadius === 0 
            ? t('tasks.searchingAllLatvia', 'Searching all of Latvia')
            : t('tasks.searchingWithin', 'Searching within {{radius}}km of {{location}}', { 
                radius: searchRadius, 
                location: locationName 
              })
          }
        </div>
      </div>
    </div>
  );
};

export default DataLoadingState;
