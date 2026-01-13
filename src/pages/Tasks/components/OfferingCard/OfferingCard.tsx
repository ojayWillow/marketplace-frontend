import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '@/constants/categories';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { calculateDistance } from '@/pages/Tasks/utils/taskHelpers';
import type { OfferingCardProps } from './OfferingCard.types';

// Star Rating helper component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

export const OfferingCard = ({ offering, userLocation }: OfferingCardProps) => {
  const { t } = useTranslation();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, offering.latitude, offering.longitude);
  const isBoosted = offering.is_boost_active;

  return (
    <div className={`relative block border rounded-lg p-4 hover:shadow-md transition-all ${
      isBoosted
        ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400 ring-1 ring-amber-200'
        : 'border-gray-200 hover:border-amber-300'
    }`}>
      {/* Favorite Button - positioned top right */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          itemType="offering"
          itemId={offering.id}
          size="sm"
        />
      </div>

      <Link to={`/offerings/${offering.id}`} className="block">
        {/* Boosted badge */}
        {isBoosted && (
          <div className="flex items-center gap-2 mb-2 text-amber-700">
            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-200 to-orange-200 rounded text-xs font-semibold">🔥 {t('offerings.boostedOnMap', 'Boosted - Visible on map!')}</span>
          </div>
        )}

        <div className="flex items-start gap-3 pr-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {offering.creator_avatar ? (
              <img src={offering.creator_avatar} alt={offering.creator_name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-200" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{offering.title}</h4>
            <p className="text-xs text-gray-500 mb-1">{t('offerings.provider', 'by')} {offering.creator_name}</p>

            {/* Rating */}
            {offering.creator_rating !== undefined && offering.creator_rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <StarRating rating={offering.creator_rating} />
                <span className="text-xs sm:text-sm text-gray-500">({offering.creator_review_count || 0})</span>
              </div>
            )}

            {/* Price - GREEN (money color) */}
            <div className="text-base sm:text-lg font-bold text-green-600 mb-2">
              €{offering.price || 0}
              {offering.price_type === 'hourly' && t('common.perHour', '/hr')}
              {offering.price_type === 'fixed' && ` ${t('common.fixed', 'fixed')}`}
              {offering.price_type === 'negotiable' && ` (${t('common.negotiable', 'neg')})`}
            </div>

            {/* Category & Distance - Orange badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">{getCategoryLabel(offering.category)}</span>
              <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
