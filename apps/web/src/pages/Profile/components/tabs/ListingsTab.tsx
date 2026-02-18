import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type Listing } from '@marketplace/shared';
import { getImageUrl } from '@marketplace/shared';
import { getStatusBadgeClass } from '../../utils/statusHelpers';
import { TabLoadingSpinner } from '../LoadingState';

interface ListingsTabProps {
  listings: Listing[];
  loading: boolean;
  onDelete?: (id: number) => void;
  viewOnly?: boolean;
}

export const ListingsTab = ({ listings, loading, onDelete, viewOnly = false }: ListingsTabProps) => {
  const { t } = useTranslation();

  const displayListings = viewOnly 
    ? listings.filter(l => l.status === 'active')
    : listings;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          {viewOnly ? t('profile.listingsTab.titleViewOnly') : t('profile.listingsTab.title')}
        </h2>
        {!viewOnly && (
          <Link
            to="/listings/create"
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            {t('profile.listingsTab.newListing')}
          </Link>
        )}
      </div>
      
      {loading ? (
        <TabLoadingSpinner color="purple" />
      ) : displayListings.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🏷️</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {viewOnly ? t('profile.listingsTab.noListingsViewOnly') : t('profile.listingsTab.noListings')}
          </p>
          {!viewOnly && (
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
            >
              {t('profile.listingsTab.createFirst')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayListings.map(listing => {
            const images = listing.images ? listing.images.split(',').filter(Boolean) : [];
            const firstImage = images[0];
            
            return (
              <div key={listing.id} className="flex gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                  {firstImage ? (
                    <img src={getImageUrl(firstImage)} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">🖼</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/listings/${listing.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 truncate">
                      {listing.title}
                    </Link>
                    {!viewOnly && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${getStatusBadgeClass(listing.status)}`}>
                        {t(`common.statuses.${listing.status}`, listing.status)}
                      </span>
                    )}
                  </div>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold">€{Number(listing.price).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Link to={`/listings/${listing.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('profile.listingsTab.view')}</Link>
                    {!viewOnly && (
                      <>
                        <Link to={`/listings/${listing.id}/edit`} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">{t('profile.listingsTab.edit')}</Link>
                        {onDelete && (
                          <button onClick={() => onDelete(listing.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">{t('profile.listingsTab.delete')}</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
