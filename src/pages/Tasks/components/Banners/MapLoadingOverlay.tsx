import { useTranslation } from 'react-i18next';

interface MapLoadingOverlayProps {
  isLoading: boolean;
  searchRadius?: number;
}

export const MapLoadingOverlay = ({ isLoading, searchRadius }: MapLoadingOverlayProps) => {
  const { t } = useTranslation();
  
  if (!isLoading) return null;

  // Contextual message based on radius
  const getMessage = () => {
    if (searchRadius === 0) {
      return t('map.searchingAllLatvia', 'Searching all of Latvia...');
    }
    if (searchRadius) {
      return t('map.searchingWithin', 'Searching within {{radius}}km...', { radius: searchRadius });
    }
    return t('map.updating', 'Updating map...');
  };
  
  return (
    <div 
      className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none"
      style={{ 
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl px-6 py-5 flex flex-col items-center gap-3">
        {/* Radar Animation */}
        <div className="relative w-16 h-16">
          {/* Outer pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-20 animate-ping" />
          <div 
            className="absolute inset-2 rounded-full border-2 border-blue-400 opacity-40"
            style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.3s' }}
          />
          <div 
            className="absolute inset-4 rounded-full border-2 border-blue-400 opacity-60"
            style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.6s' }}
          />
          
          {/* Center pin icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">📍</div>
          </div>
        </div>
        
        {/* Message */}
        <div className="text-center">
          <p className="font-semibold text-gray-800 text-lg">
            🔍 {getMessage()}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {t('map.findingJobs', 'Finding jobs near you')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;
