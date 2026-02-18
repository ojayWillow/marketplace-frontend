import { WorkItemWithDistance } from '../types';
import { formatTimeAgo, getDifficultyColor, renderStars, formatItemDistance } from '../utils';
import { FEATURES } from '../../../constants/featureFlags';

interface WorkItemCardProps {
  item: WorkItemWithDistance;
  categoryInfo: { icon: string; label: string };
  onClick: () => void;
}

/**
 * Strip redundant "URGENT:" prefix from titles since the is_urgent flag
 * already shows a 🔥 badge. Old tasks may have it baked into the title.
 */
const cleanTitle = (title: string): string => {
  return title.replace(/^URGENT:\s*/i, '').trim();
};

const WorkItemCard = ({ item, categoryInfo, onClick }: WorkItemCardProps) => {
  const price = item.type === 'job' ? item.budget : item.price;
  const timeAgo = item.created_at ? formatTimeAgo(item.created_at) : '';
  const hasReviews = item.creator_review_count && item.creator_review_count > 0;
  const difficultyColor = getDifficultyColor(item.difficulty);
  const distanceText = formatItemDistance(item.distance, item.location);

  const isJob = item.type === 'job';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm dark:shadow-gray-900/50 border-l-4 border border-t-gray-100 border-r-gray-100 border-b-gray-100 dark:border-t-gray-800 dark:border-r-gray-800 dark:border-b-gray-800 active:shadow-md active:scale-[0.98] transition-all cursor-pointer ${
        isJob ? 'border-l-blue-500' : 'border-l-amber-500'
      }`}
    >
      {/* Header: category + urgent on the left, price pinned right */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg flex-shrink-0">{categoryInfo.icon}</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{categoryInfo.label}</span>
          {FEATURES.URGENT && item.is_urgent && (
            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-[10px] font-bold flex-shrink-0 whitespace-nowrap">
              🔥 Urgent
            </span>
          )}
        </div>
        {price && (
          <span className={`text-lg font-bold flex-shrink-0 ${isJob ? 'text-blue-600 dark:text-blue-500' : 'text-amber-600 dark:text-amber-500'}`}>
            €{price}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-2">{cleanTitle(item.title)}</h3>

      {/* Creator info */}
      <div className="flex gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(item.creator_name || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col justify-center gap-0.5 min-w-0">
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {item.creator_name || 'Anonymous'}
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            {hasReviews ? (
              <>
                <span className="text-yellow-500 leading-none flex-shrink-0">
                  {renderStars(item.creator_rating || 0)}
                </span>
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">({item.creator_review_count})</span>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">New user</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.description}</p>
      )}

      {/* Footer: distance left, difficulty center, time right */}
      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-50 dark:border-t-gray-800">
        <span className="text-gray-500 dark:text-gray-400 font-medium flex-1 truncate">📏 {distanceText}</span>
        <span className={`font-semibold flex-shrink-0 ${difficultyColor}`}>
          ⚡ {item.difficulty || 'Medium'}
        </span>
        <span className="text-gray-400 dark:text-gray-500 flex-1 text-right flex-shrink-0">{timeAgo}</span>
      </div>
    </div>
  );
};

export default WorkItemCard;
