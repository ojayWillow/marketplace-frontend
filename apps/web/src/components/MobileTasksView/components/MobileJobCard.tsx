import { Task } from '@marketplace/shared';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatTimeAgo } from '../utils/formatting';
import { FEATURES } from '../../../constants/featureFlags';

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

interface MobileJobCardProps {
  task: Task;
  userLocation: { lat: number; lng: number };
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Compact job card for the task list
 */
const MobileJobCard = ({
  task,
  userLocation,
  onClick,
  isSelected,
}: MobileJobCardProps) => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    task.latitude,
    task.longitude
  );
  const budget = task.budget || task.reward || 0;
  const hasRating = task.creator_rating != null;
  const isUrgent = FEATURES.URGENT && task.is_urgent;
  const displayTitle = isUrgent ? cleanTitle(task.title) : task.title;

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">⯪</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 dark:text-gray-600">★</span>);
      }
    }
    return stars;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
          : isUrgent
          ? 'bg-red-50/40 dark:bg-red-900/10 border-l-4 border-l-red-500'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      {/* Icon with optional urgent pulse dot */}
      <div className="relative">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
          }`}
        >
          {task.icon || '📋'}
        </div>
        {isUrgent && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center text-[8px] text-white font-bold">⚡</span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Line 1: Title (cleaned) */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
          {displayTitle}
        </h3>
        
        {/* Line 2: Distance and Time */}
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          <span>📍 {formatDistance(distance)}</span>
          <span>•</span>
          <span>{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</span>
        </div>
        
        {/* Line 3: Creator with avatar, name, rating, and city */}
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {/* Avatar */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 overflow-hidden">
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
          
          {/* Name */}
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
            {task.creator_name || 'Anonymous'}
          </span>
          
          {/* Separator if rating or city exists */}
          {(hasRating || task.creator_city) && (
            <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">|</span>
          )}
          
          {/* Rating with stars */}
          {hasRating && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <div className="flex text-[10px]">
                {renderStars(task.creator_rating!)}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                ({task.creator_review_count || 0})
              </span>
            </div>
          )}
          
          {/* Separator before city */}
          {hasRating && task.creator_city && (
            <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">|</span>
          )}
          
          {/* City */}
          {task.creator_city && (
            <span className="text-gray-500 dark:text-gray-400 truncate">
              {task.creator_city}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={`text-lg font-bold ${
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : budget <= 25
              ? 'text-green-600 dark:text-green-400'
              : budget <= 75
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-purple-600 dark:text-purple-400'
          }`}
        >
          €{budget}
        </span>
      </div>
    </div>
  );
};

export default MobileJobCard;
