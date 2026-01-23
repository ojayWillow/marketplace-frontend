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
 * Redesigned with clear visual hierarchy and no redundant information
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
  const timeAgo = task.created_at ? formatTimeAgo(task.created_at) : t('tasks.new', 'New');

  // Get price color based on budget tier
  const getPriceColor = () => {
    if (budget <= 25) return 'text-green-600';
    if (budget <= 75) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[1001] overflow-hidden animate-slideUp">
      {/* Drag Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      <div className="px-4 pb-4">
        {/* ===== HEADER ZONE ===== */}
        {/* Category (left) | Distance (center-right) | Close (right) */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
            {categoryIcon} {categoryLabel}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
              📍 {formatDistance(distance)}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===== HERO ZONE ===== */}
        {/* Big price + Title */}
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold ${getPriceColor()} mb-2`}>
            €{budget}
          </div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
            {task.title}
          </h3>
        </div>

        {/* ===== CONTENT ZONE ===== */}
        {/* Description in subtle card */}
        {task.description && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          </div>
        )}

        {/* ===== META ZONE ===== */}
        {/* Location + Creator */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-base">📍</span>
            <span className="truncate">
              {task.location?.split(',').slice(0, 2).join(', ') || t('tasks.nearby', 'Nearby')}
            </span>
          </div>

          {/* Creator - Clickable */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick();
            }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 active:opacity-70 transition-colors"
          >
            <span className="text-base">👤</span>
            <span className="font-medium">{task.creator_name || t('common.anonymous', 'Anonymous')}</span>
            <span className="text-gray-400 text-xs">→</span>
          </button>
        </div>

        {/* ===== ACTION ZONE ===== */}
        {/* Time badge + View Details button + Favorite */}
        <div className="flex items-center gap-2">
          {/* Time Posted - Secondary */}
          <div className="px-3 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 flex-shrink-0">
            🕐 {timeAgo}
          </div>

          {/* View Details - Primary CTA */}
          <button
            onClick={onViewDetails}
            className="flex-1 py-3 px-4 rounded-xl text-base font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {t('tasks.viewDetails', 'View Details')} →
          </button>

          {/* Favorite Button */}
          <FavoriteButton
            itemType="task"
            itemId={task.id}
            size="md"
            className="!rounded-xl !w-12 !h-12 flex-shrink-0"
          />
        </div>
      </div>

      {/* Safe area padding for phones with home indicator */}
      <div className="h-6 bg-white" />
    </div>
  );
};

export default JobPreviewCard;
