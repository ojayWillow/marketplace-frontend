import { Task } from '../types';
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
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
          <span>📍 {formatDistance(distance)}</span>
          <span>•</span>
          <span>{task.created_at ? formatTimeAgo(task.created_at) : 'New'}</span>
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
