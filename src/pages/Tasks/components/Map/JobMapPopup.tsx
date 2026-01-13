import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryIcon, getCategoryLabel } from '../../../../constants/categories';
import FavoriteButton from '../../../../components/ui/FavoriteButton';
import { calculateDistance, formatDistance, formatTimeAgo } from '../../utils';
import type { Task, UserLocation } from '../../types';

interface JobMapPopupProps {
  task: Task;
  userLocation: UserLocation;
}

const JobMapPopup = ({ task, userLocation }: JobMapPopupProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const distance = calculateDistance(userLocation.lat, userLocation.lng, task.latitude, task.longitude);
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  
  // Truncate location
  const shortLocation = task.location?.split(',').slice(0, 2).join(', ') || t('tasks.nearby', 'Nearby');
  
  // Simulated applicants count
  const applicantsCount = task.applications_count || 0;
  
  return (
    <div className="job-popup" style={{ width: '240px' }}>
      {/* Urgent badge if applicable - simplified, no extra text */}
      {task.is_urgent && (
        <div className="mb-2 px-2 py-1 bg-red-100 border border-red-200 rounded-lg text-center">
          <span className="text-red-700 font-semibold text-xs">⚡ {t('tasks.urgent', 'URGENT')}</span>
        </div>
      )}
      
      {/* Top row: Category bubble (blue) + Distance */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <span>{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </span>
        <span className="text-xs text-gray-500">📍 {formatDistance(distance)}</span>
      </div>
      
      {/* Price - prominent (green for money) */}
      <div className="text-center mb-2">
        <span className="text-2xl font-bold text-green-600">€{budget}</span>
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-tight text-center mb-3 line-clamp-2">
        {task.title}
      </h3>
      
      {/* Labeled Info Grid */}
      <div className="grid grid-cols-3 gap-1 mb-3 py-2 bg-gray-50 rounded-lg text-center">
        <div>
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.distance', 'Distance')}</div>
          <div className="text-xs font-semibold text-gray-700">{formatDistance(distance)}</div>
        </div>
        <div className="border-x border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.posted', 'Posted')}</div>
          <div className="text-xs font-semibold text-gray-700">{task.created_at ? formatTimeAgo(task.created_at, t) : t('tasks.new', 'New')}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase">{t('tasks.applicants', 'Applicants')}</div>
          <div className="text-xs font-semibold text-gray-700">{applicantsCount}</div>
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <span>📍</span>
        <span className="truncate">{shortLocation}</span>
      </div>
      
      {/* Posted by */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <span>👤</span>
        <span>{task.creator_name || t('tasks.anonymous', 'Anonymous')}</span>
      </div>
      
      {/* Dual CTAs - Blue for jobs */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/tasks/${task.id}`);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all"
        >
          {t('tasks.viewAndApply', 'View & Apply')} →
        </button>
        <FavoriteButton
          itemType="task"
          itemId={task.id}
          size="sm"
          className="!rounded-lg"
        />
      </div>
    </div>
  );
};

export default JobMapPopup;
