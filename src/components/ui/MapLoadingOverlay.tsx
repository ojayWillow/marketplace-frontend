/**
 * MapLoadingOverlay - Shows loading state on the map when filters change
 * This provides instant feedback when users change radius or other filters
 */

import { useTranslation } from 'react-i18next';

interface MapLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const MapLoadingOverlay = ({ isLoading, message }: MapLoadingOverlayProps) => {
  const { t } = useTranslation();
  
  if (!isLoading) return null;
  
  return (
    <div 
      className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none"
      style={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
        <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full" />
        <span className="font-medium text-gray-700">
          {message || t('map.loading', 'Loading...')}
        </span>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;
