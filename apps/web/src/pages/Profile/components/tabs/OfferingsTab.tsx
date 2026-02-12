import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type Offering } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';
import { getStatusBadgeClass } from '../../utils/statusHelpers';
import { TabLoadingSpinner } from '../LoadingState';

interface OfferingsTabProps {
  offerings: Offering[];
  loading: boolean;
  onDelete?: (id: number) => void;
  viewOnly?: boolean;
  compact?: boolean; // Mobile compact mode
}

export const OfferingsTab = ({ offerings, loading, onDelete, viewOnly = false, compact = false }: OfferingsTabProps) => {
  const { t } = useTranslation();
  const [showMapTipDismissed, setShowMapTipDismissed] = useState(() => {
    return localStorage.getItem('mapTipDismissed') === 'true';
  });

  const handleDismissMapTip = () => {
    setShowMapTipDismissed(true);
    localStorage.setItem('mapTipDismissed', 'true');
  };

  const displayOfferings = viewOnly 
    ? offerings.filter(o => o.status === 'active')
    : offerings;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${compact ? 'p-3' : 'p-4 md:p-6'}`}>
      {/* Header */}
      {!compact && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">
            {viewOnly ? t('profile.servicesTab.titleViewOnly') : t('profile.servicesTab.title')}
          </h2>
          {!viewOnly && (
            <Link
              to="/offerings/create"
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
            >
              {t('profile.servicesTab.newService')}
            </Link>
          )}
        </div>
      )}

      {/* Map Visibility Tip */}
      {!viewOnly && offerings.length > 0 && !showMapTipDismissed && (
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">💡</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-blue-800">
                <span className="font-medium">{t('profile.servicesTab.proTip')}</span> {t('profile.servicesTab.proTipText')}
              </p>
            </div>
            <button 
              onClick={handleDismissMapTip}
              className="text-blue-400 hover:text-blue-600 text-xs flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <TabLoadingSpinner color="amber" />
      ) : displayOfferings.length === 0 ? (
        <div className={`text-center ${compact ? 'py-6' : 'py-10'}`}>
          <div className={`${compact ? 'text-3xl' : 'text-4xl'} mb-2`}>👋</div>
          <p className="text-gray-500 mb-3 text-sm">
            {viewOnly ? t('profile.servicesTab.noServicesViewOnly') : t('profile.servicesTab.noServices')}
          </p>
          {!viewOnly && (
            <Link
              to="/offerings/create"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              {t('profile.servicesTab.createFirst')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayOfferings.map(offering => (
            <div key={offering.id} className={`${compact ? 'p-3' : 'p-3 md:p-4'} border border-gray-100 rounded-lg hover:bg-amber-50/50 transition-colors`}>
              <div>
                {/* Title + status row */}
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-sm">{getCategoryIcon(offering.category)}</span>
                  <Link to={`/offerings/${offering.id}`} className="font-medium text-sm text-gray-900 hover:text-amber-600 line-clamp-1">
                    {offering.title}
                  </Link>
                  {!viewOnly && (
                    <span className={`px-1.5 py-0.5 text-[10px] md:text-xs rounded-full font-medium ${getStatusBadgeClass(offering.status)}`}>
                      {offering.status}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-xs line-clamp-1 mb-1.5">{offering.description}</p>
                
                {/* Price + category */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600 font-semibold">
                    €{offering.price || 0}{offering.price_type === 'hourly' && '/hr'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">{getCategoryLabel(offering.category)}</span>
                </div>

                {/* Action buttons row */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                  <Link to={`/offerings/${offering.id}`} className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 font-medium">
                    {t('profile.servicesTab.view')}
                  </Link>
                  {!viewOnly && (
                    <>
                      <Link to={`/offerings/${offering.id}/edit`} className="px-2.5 py-1 text-xs text-gray-500 bg-gray-50 rounded-md hover:bg-gray-100 font-medium">
                        {t('profile.servicesTab.edit')}
                      </Link>
                      {onDelete && (
                        <button onClick={() => onDelete(offering.id)} className="px-2.5 py-1 text-xs text-red-500 bg-red-50 rounded-md hover:bg-red-100 font-medium ml-auto">
                          {t('profile.servicesTab.delete')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
