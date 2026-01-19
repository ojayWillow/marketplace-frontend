import { useTranslation } from 'react-i18next';
import { Task } from '../types';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatTimeAgo } from '../utils/formatting';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import FavoriteButton from '../../ui/FavoriteButton';

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
  const applicantsCount = task.applications_count || 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[1001] overflow-hidden animate-slideUp">
      <div className="p-4">
        {/* Top row: Category on left, Distance in CENTER, X button on right */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <span>{categoryIcon}</span>
            <span>{categoryLabel}</span>
          </span>

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
              budget <= 25
                ? 'text-green-600'
                : budget <= 75
                ? 'text-blue-600'
                : 'text-purple-600'
            }`}
          >
            €{budget}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg text-center mb-3 line-clamp-2">
          {task.title}
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

        {/* Posted by - CLICKABLE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatorClick();
          }}
          className="flex items-center gap-2 text-sm text-blue-600 mb-4 hover:underline active:opacity-70"
        >
          <span>👤</span>
          <span className="font-medium">{task.creator_name || 'Anonymous'}</span>
          <span className="text-gray-400">→</span>
        </button>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="flex-1 py-3 px-4 rounded-xl text-base font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
      </div>

      {/* Safe area padding for phones with home indicator */}
      <div className="h-6 bg-white" />
    </div>
  );
};

export default JobPreviewCard;
