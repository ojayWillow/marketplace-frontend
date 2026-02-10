import { useTranslation } from 'react-i18next';
import { Task } from '@marketplace/shared';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatTimeAgo } from '../utils/formatting';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import FavoriteButton from '../../ui/FavoriteButton';

/**
 * Strip common "urgent" prefixes users may have manually typed in titles.
 */
const cleanTitle = (title: string): string => {
  return title
    .replace(/^\s*(⚡\s*)?urgent[:\-!\s]*/i, '')
    .replace(/^\s*(⚡\s*)?steidzami[:\-!\s]*/i, '')
    .replace(/^\s*(⚡\s*)?срочно[:\-!\s]*/i, '')
    .replace(/^\s*⚡\s*/, '')
    .trim() || title;
};

interface JobPreviewCardProps {
  task: Task;
  userLocation: { lat: number; lng: number };
  onViewDetails: () => void;
  onClose: () => void;
  onCreatorClick: () => void;
}

/**
 * Job preview card - Shows when a job marker is selected on the map
 */
const JobPreviewCard = ({
  task,
  userLocation,
  onViewDetails,
  onClose,
  onCreatorClick,
}: JobPreviewCardProps) => {
  const { t } = useTranslation();
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    task.latitude,
    task.longitude
  );
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const applicantsCount = task.pending_applications_count || 0;
  const isUrgent = task.is_urgent;
  const displayTitle = isUrgent ? cleanTitle(task.title) : task.title;

  // Check if rating exists (not null/undefined)
  const hasRating = task.creator_rating != null;

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">⯨</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[1001] overflow-hidden animate-slideUp flex flex-col" style={{ maxHeight: '65vh' }}>
      {/* Urgent top accent bar */}
      {isUrgent && (
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse flex-shrink-0" />
      )}

      {/* Scrollable content area */}
      <div className="p-4 pb-0 overflow-y-auto flex-1 min-h-0">
        {/* Top row: Category on left, Distance in CENTER, X button on right */}
        <div className="flex items-center justify-between mb-3">
          {/* Category pill with urgent dot overlay */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <span>{categoryIcon}</span>
              <span>{categoryLabel}</span>
            </span>
            {isUrgent && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] text-white font-bold">⚡</span>
              </span>
            )}
          </div>

          {/* Distance - Centered */}
          <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
            📍 {formatDistance(distance)}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Price - BIG and prominent */}
        <div className="text-center mb-2">
          <span
            className={`text-3xl font-bold ${
              isUrgent
                ? 'text-red-600'
                : budget <= 25
                ? 'text-green-600'
                : budget <= 75
                ? 'text-blue-600'
                : 'text-purple-600'
            }`}
          >
            €{budget}
          </span>
        </div>

        {/* Title (cleaned) */}
        <h3 className="font-bold text-gray-900 text-lg text-center mb-3 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-2 bg-gray-50 rounded-xl text-center">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.distance', 'ATTĀLUMS')}
            </div>
            <div className="text-sm font-bold text-gray-700">
              {formatDistance(distance)}
            </div>
          </div>
          <div className="border-x border-gray-200">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.posted', 'PUBLICĒTS')}
            </div>
            <div className="text-sm font-bold text-gray-700">
              {task.created_at ? formatTimeAgo(task.created_at) : 'New'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {t('tasks.applicants', 'PIETEIKUMI')}
            </div>
            <div className="text-sm font-bold text-gray-700">
              {applicantsCount}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>📍</span>
          <span className="truncate">
            {task.location?.split(',').slice(0, 2).join(', ') || 'Nearby'}
          </span>
        </div>

        {/* Creator - CLICKABLE with avatar and all info on ONE line */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatorClick();
          }}
          className="flex items-center gap-2 text-sm hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors w-full"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
            {task.creator_avatar ? (
              <img 
                src={task.creator_avatar} 
                alt={task.creator_name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(task.creator_name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          
          {/* All info on ONE line: Name | Stars (count) | City */}
          <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
            {/* Name */}
            <span className="font-medium text-gray-900 truncate">
              {task.creator_name || t('common.anonymous', 'Anonymous')}
            </span>
            
            {/* Separator - only show if there's rating or city */}
            {(hasRating || task.creator_city) && (
              <span className="text-gray-300 flex-shrink-0">|</span>
            )}
            
            {/* Rating with stars - inline */}
            {hasRating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex text-xs">
                  {renderStars(task.creator_rating!)}
                </div>
                <span className="text-xs text-gray-500">
                  ({task.creator_review_count || 0})
                </span>
              </div>
            )}
            
            {/* Separator before city */}
            {hasRating && task.creator_city && (
              <span className="text-gray-300 flex-shrink-0">|</span>
            )}
            
            {/* City */}
            {task.creator_city && (
              <span className="text-xs text-gray-500 truncate">
                {task.creator_city}
              </span>
            )}
          </div>
          
          <span className="text-gray-400 text-xs flex-shrink-0">→</span>
        </button>
      </div>

      {/* Action buttons - PINNED at bottom, never scrolled away */}
      <div className="flex gap-3 p-4 pt-3 bg-white flex-shrink-0 border-t border-gray-100">
        <button
          onClick={onViewDetails}
          className={`flex-1 py-3 px-4 rounded-xl text-base font-bold text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isUrgent
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {t('tasks.viewAndApply', 'Skatīt un pieteikties')} →
        </button>
        <FavoriteButton
          itemType="task"
          itemId={task.id}
          size="md"
          className="!rounded-xl !w-12 !h-12"
        />
      </div>

      {/* Safe area padding for phones with home indicator */}
      <div className="h-safe-area-bottom bg-white flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }} />
    </div>
  );
};

export default JobPreviewCard;
