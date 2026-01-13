import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '@/constants/categories';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { calculateDistance } from '../../utils/taskHelpers';
import type { TaskCardProps } from './TaskCard.types';

export const TaskCard = ({ task, userLocation, isMatching }: TaskCardProps) => {
  const { t } = useTranslation();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const isHighValue = budget > 75;
  const isUrgent = task.is_urgent;

  return (
    <div className={`relative block border rounded-lg p-4 hover:shadow-md transition-all ${
      isUrgent
        ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-500'
        : isHighValue
          ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-amber-50 hover:border-purple-400 ring-1 ring-purple-200'
          : isMatching
            ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
            : 'border-gray-200 hover:border-blue-300'
    }`}>
      {/* Favorite Button - positioned top right */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          itemType="task"
          itemId={task.id}
          size="sm"
        />
      </div>

      <Link to={`/tasks/${task.id}`} className="block">
        {/* Urgent badge */}
        {isUrgent && (
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              ⚡ {t('tasks.urgent', 'Urgent')}
            </span>
          </div>
        )}

        {/* High value badge */}
        {isHighValue && !isUrgent && (
          <div className="flex items-center gap-2 mb-2 text-purple-700">
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-200 to-amber-200 rounded text-xs font-semibold">✨ {t('offerings.premiumOpportunity', 'Premium opportunity!')}</span>
          </div>
        )}

        {/* Matching badge */}
        {isMatching && !isHighValue && !isUrgent && (
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <span className="px-2 py-0.5 bg-blue-200 rounded text-xs font-semibold">✨ {t('offerings.matchesYourOffering', 'Matches your offering')}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl flex-shrink-0">{task.icon}</span>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{task.title}</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{getCategoryLabel(task.category)}</span>
              {isUrgent && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">{t('tasks.urgent', 'Urgent')}</span>
              )}
            </div>
            {task.creator_name && (
              <p className="text-xs text-gray-500 mt-2">{t('tasks.postedBy', 'Posted by')} {task.creator_name}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-xl sm:text-2xl font-bold ${
              budget <= 25 ? 'text-green-600' :
              budget <= 75 ? 'text-blue-600' :
              'text-purple-600'
            }`}>
              €{budget}
            </div>
            {isHighValue && <div className="text-xs text-amber-500 mt-1">💎 {t('map.premium', 'Premium')}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
};
