import { Task } from '@marketplace/shared';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatTimeAgo } from '../utils/formatting';
import FavoriteButton from '../../ui/FavoriteButton';

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
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
          isSelected ? 'bg-blue-100' : 'bg-blue-50'
        }`}
      >
        {task.icon || '📋'}
      </div>

      <div className="flex-1 min-w-0">
        {/* Line 1: Title */}
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {task.title}
        </h3>
        
        {/* Line 2: Distance and Time */}
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
          <span>📍 {formatDistance(distance)}</span>
          <span>•</span>
          <span>{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</span>
        </div>
        
        {/* Line 3: Creator with avatar, name, rating, and city - ALL ON ONE LINE */}
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
          <span className="font-medium text-gray-700 truncate">
            {task.creator_name || 'Anonymous'}
          </span>
          
          {/* Separator if rating or city exists */}
          {(hasRating || task.creator_city) && (
            <span className="text-gray-300 flex-shrink-0">|</span>
          )}
          
          {/* Rating with stars */}
          {hasRating && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <div className="flex text-[10px]">
                {renderStars(task.creator_rating!)}
              </div>
              <span className="text-[10px] text-gray-500">
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
            <span className="text-gray-500 truncate">
              {task.creator_city}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={`text-lg font-bold ${
            budget <= 25
              ? 'text-green-600'
              : budget <= 75
              ? 'text-blue-600'
              : 'text-purple-600'
          }`}
        >
          €{budget}
        </span>
        <FavoriteButton itemType="task" itemId={task.id} size="sm" />
      </div>
    </div>
  );
};

export default MobileJobCard;
