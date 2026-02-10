import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '../../../../constants/categories';
import FavoriteButton from '../../../../components/ui/FavoriteButton';
import { calculateDistance } from '../../utils/taskHelpers';
import type { TaskCardProps } from './TaskCard.types';

/**
 * Strip common "urgent" prefixes users may have manually typed in titles.
 * Case-insensitive, handles multiple languages (EN/LV/RU) and emoji variants.
 */
const cleanTitle = (title: string): string => {
  return title
    .replace(/^\s*(⚡\s*)?urgent[:\-!\s]*/i, '')
    .replace(/^\s*(⚡\s*)?steidzami[:\-!\s]*/i, '')
    .replace(/^\s*(⚡\s*)?срочно[:\-!\s]*/i, '')
    .replace(/^\s*⚡\s*/, '')
    .trim() || title;
};

export const TaskCard = ({ task, userLocation, isMatching }: TaskCardProps) => {
  const { t } = useTranslation();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const isHighValue = budget > 75;
  const isUrgent = task.is_urgent;
  const displayTitle = isUrgent ? cleanTitle(task.title) : task.title;

  return (
    <div className={`relative block border rounded-lg p-4 hover:shadow-md transition-all ${
      isUrgent
        ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-500 border-l-4 border-l-red-500'
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
              {/* Icon with urgent pulse dot */}
              <div className="relative flex-shrink-0">
                <span className="text-xl sm:text-2xl">{task.icon}</span>
                {isUrgent && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center text-[8px] text-white font-bold">⚡</span>
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{displayTitle}</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">📍 {distance.toFixed(1)}km</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{getCategoryLabel(task.category)}</span>
            </div>
            {task.creator_name && (
              <p className="text-xs text-gray-500 mt-2">{t('tasks.postedBy', 'Posted by')} {task.creator_name}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-xl sm:text-2xl font-bold ${
              isUrgent ? 'text-red-600' :
              budget <= 25 ? 'text-green-600' :
              budget <= 75 ? 'text-blue-600' :
              'text-purple-600'
            }`}>
              €{budget}
            </div>
            {isHighValue && !isUrgent && <div className="text-xs text-amber-500 mt-1">💎 {t('map.premium', 'Premium')}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
};
