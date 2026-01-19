import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Offering } from '../../../../api/offerings';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';
import FavoriteButton from '../../../../components/ui/FavoriteButton';
import StarRating from '../StarRating';
import { calculateDistance, formatDistance } from '../../utils';
import type { UserLocation } from '../../types';

interface OfferingMapPopupProps {
  offering: Offering;
  userLocation: UserLocation;
}

const OfferingMapPopup = ({ offering, userLocation }: OfferingMapPopupProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  
  return (
    <div className="offering-popup" style={{ width: '220px' }}>
      {/* Boosted badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          🔥 {t('offerings.boosted', 'Boosted')}
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      {/* Top row: Category bubble (orange) */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
      </div>
      
      {/* Provider info + Price */}
      <div className="flex items-center gap-2 mb-3">
        {offering.creator_avatar ? (
          <img src={offering.creator_avatar} alt={offering.creator_name} className="w-10 h-10 rounded-full object-cover border border-amber-200" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
            {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{offering.creator_name}</div>
          {offering.creator_rating !== undefined && offering.creator_rating > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <StarRating rating={offering.creator_rating} />
            </div>
          )}
        </div>
        <div className="text-lg font-bold text-green-600">
          €{offering.price || 0}
          {offering.price_type === 'hourly' && <span className="text-xs font-normal">/h</span>}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-xs mb-3 line-clamp-2">{offering.title}</h3>
      
      {/* Action Button - Orange */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/offerings/${offering.id}`);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all"
        >
          {t('offerings.viewProfile', 'View Profile')} →
        </button>
        <FavoriteButton
          itemType="offering"
          itemId={offering.id}
          size="sm"
          className="!rounded-lg"
        />
      </div>
    </div>
  );
};

export default OfferingMapPopup;
