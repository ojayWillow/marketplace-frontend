import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Offering } from '../../../../api/offerings';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';
import { getStatusBadgeClass } from '../../utils/statusHelpers';
import { TabLoadingSpinner } from '../LoadingState';

interface OfferingsTabProps {
  offerings: Offering[];
  loading: boolean;
  onDelete?: (id: number) => void;
  viewOnly?: boolean;
}

export const OfferingsTab = ({ offerings, loading, onDelete, viewOnly = false }: OfferingsTabProps) => {
  const [showMapTipDismissed, setShowMapTipDismissed] = useState(() => {
    return localStorage.getItem('mapTipDismissed') === 'true';
  });

  const handleDismissMapTip = () => {
    setShowMapTipDismissed(true);
    localStorage.setItem('mapTipDismissed', 'true');
  };

  // Filter to only show active offerings for public view
  const displayOfferings = viewOnly 
    ? offerings.filter(o => o.status === 'active')
    : offerings;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">
          {viewOnly ? 'Services' : 'My Services'}
        </h2>
        {!viewOnly && (
          <Link
            to="/offerings/create"
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            + New Service
          </Link>
        )}
      </div>

      {/* Soft Map Visibility Tip - Only for own profile */}
      {!viewOnly && offerings.length > 0 && !showMapTipDismissed && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Pro tip:</span> Your services can appear on the map for people searching nearby. 
                Map visibility is a premium feature coming soon!
              </p>
            </div>
            <button 
              onClick={handleDismissMapTip}
              className="text-blue-400 hover:text-blue-600 text-sm flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <TabLoadingSpinner color="amber" />
      ) : displayOfferings.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">👋</div>
          <p className="text-gray-500 mb-4">
            {viewOnly ? 'No services available' : 'No services yet'}
          </p>
          {!viewOnly && (
            <Link
              to="/offerings/create"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              Create your first service →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayOfferings.map(offering => (
            <div key={offering.id} className="p-4 border border-gray-100 rounded-lg hover:bg-amber-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getCategoryIcon(offering.category)}</span>
                    <Link to={`/offerings/${offering.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                      {offering.title}
                    </Link>
                    {!viewOnly && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(offering.status)}`}>
                        {offering.status}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-1">{offering.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-green-600 font-semibold">
                      €{offering.price || 0}{offering.price_type === 'hourly' && '/hr'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{getCategoryLabel(offering.category)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/offerings/${offering.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                  {!viewOnly && (
                    <>
                      <Link to={`/offerings/${offering.id}/edit`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                      {onDelete && (
                        <button onClick={() => onDelete(offering.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
