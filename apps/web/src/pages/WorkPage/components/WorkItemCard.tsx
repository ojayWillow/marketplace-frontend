import { WorkItemWithDistance } from '../types';
import { formatTimeAgo, getDifficultyColor, renderStars, formatItemDistance } from '../utils';

interface WorkItemCardProps {
  item: WorkItemWithDistance;
  categoryInfo: { icon: string; label: string };
  onClick: () => void;
}

const WorkItemCard = ({ item, categoryInfo, onClick }: WorkItemCardProps) => {
  const price = item.type === 'job' ? item.budget : item.price;
  const timeAgo = item.created_at ? formatTimeAgo(item.created_at) : '';
  const hasReviews = item.creator_review_count && item.creator_review_count > 0;
  const difficultyColor = getDifficultyColor(item.difficulty);
  const distanceText = formatItemDistance(item.distance, item.location);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:shadow-md active:scale-[0.98] transition-all cursor-pointer ${
        item.type === 'job' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'
      }`}
    >
      {/* Header: category + price */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{categoryInfo.icon}</span>
          <span className="text-xs font-semibold text-gray-700">{categoryInfo.label}</span>
        </div>
        {item.is_urgent && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            \uD83D\uDD25 Urgent
          </span>
        )}
        {price && (
          <span className={`text-lg font-bold ${item.type === 'job' ? 'text-blue-600' : 'text-amber-600'}`}>
            \u20AC{price}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 truncate mb-3">{item.title}</h3>

      {/* Creator info */}
      <div className="flex gap-2 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 self-start">
          {(item.creator_name || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col justify-center gap-0.5 flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-800 truncate">
            {item.creator_name || 'Anonymous'}
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            {hasReviews ? (
              <>
                <span className="text-yellow-500 leading-none">
                  {renderStars(item.creator_rating || 0)}
                </span>
                <span className="text-gray-400">({item.creator_review_count})</span>
              </>
            ) : (
              <span className="text-gray-400">New user</span>
            )}
            <span className="text-gray-300">\u2022</span>
            <span className="text-xs text-gray-500 truncate">
              \uD83D\uDCCD {item.location?.split(',')[0] || 'Location'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
      )}

      {/* Footer: distance, difficulty, time */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 font-medium">\uD83D\uDCCF {distanceText}</span>
        <span className={`font-semibold ${difficultyColor}`}>
          \u26A1 {item.difficulty || 'Medium'}
        </span>
        <span className="text-gray-400">{timeAgo}</span>
      </div>
    </div>
  );
};

export default WorkItemCard;
