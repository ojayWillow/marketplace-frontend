import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@marketplace/shared';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatTimeAgo } from '../utils/formatting';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import shareTask from '../../../utils/shareTask';
import { FEATURES } from '../../../constants/featureFlags';
import StarRating from '../../ui/StarRating';

/**
 * Strip common "urgent" prefixes users may have manually typed in titles.
 */
const cleanTitle = (title: string): string => {
  return title
    .replace(/^\s*(\u26a1\s*)?urgent[:\-!\s]*/i, '')
    .replace(/^\s*(\u26a1\s*)?steidzami[:\-!\s]*/i, '')
    .replace(/^\s*(\u26a1\s*)?\u0441\u0440\u043e\u0447\u043d\u043e[:\-!\s]*/i, '')
    .replace(/^\s*\u26a1\s*/, '')
    .trim() || title;
};

interface JobPreviewCardProps {
  task: Task;
  userLocation: { lat: number; lng: number };
  hasRealLocation: boolean;
  onViewDetails: () => void;
  onClose: () => void;
  onCreatorClick: () => void;
}

/**
 * Job preview card \u2014 Shows when a job marker is selected on the map.
 * Positioned above the MobileBottomNav (h-14 = 56px + safe-area-inset-bottom).
 */
const JobPreviewCard = ({
  task,
  userLocation,
  hasRealLocation,
  onViewDetails,
  onClose,
  onCreatorClick,
}: JobPreviewCardProps) => {
  const { t } = useTranslation();
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    task.latitude,
    task.longitude
  );
  const budget = task.budget || task.reward || 0;
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const applicantsCount = task.pending_applications_count || 0;
  const isUrgent = FEATURES.URGENT && task.is_urgent;
  const displayTitle = isUrgent ? cleanTitle(task.title) : task.title;

  const hasRating = task.creator_rating != null;

  const jobCity = task.location?.split(',')[0]?.trim() || '';

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareTask(task);
    if (result === 'copied') {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  return (
    <div
      className="absolute left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl dark:shadow-gray-950/80 z-[1001] overflow-hidden animate-slideUp flex flex-col"
      style={{
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '55vh',
      }}
    >
      {isUrgent && (
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse flex-shrink-0" />
      )}

      <div className="px-4 pt-4 pb-2 overflow-y-auto flex-1 min-h-0">
        {/* Top row: Category | Distance or City | Close */}
        <div className="flex items-center justify-between mb-2">
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              <span>{categoryIcon}</span>
              <span>{categoryLabel}</span>
            </span>
            {isUrgent && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] text-white font-bold">\u26a1</span>
              </span>
            )}
          </div>

          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
            {hasRealLocation ? (
              <>\ud83d\udccd {formatDistance(distance)}</>
            ) : (
              <>\ud83d\udccd {jobCity || t('tasks.locationUnknown', 'Location')}</>
            )}
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            \u2715
          </button>
        </div>

        {/* Price */}
        <div className="text-center mb-1">
          <span
            className={`text-3xl font-bold ${
              isUrgent
                ? 'text-red-600 dark:text-red-400'
                : budget <= 25
                ? 'text-green-600 dark:text-green-400'
                : budget <= 75
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-purple-600 dark:text-purple-400'
            }`}
          >
            \u20ac{budget}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg text-center mb-2 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Stats row */}
        <div className={`grid ${hasRealLocation ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-center`}>
          {hasRealLocation && (
            <div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {t('tasks.distance', 'ATT\u0100LUMS')}
              </div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {formatDistance(distance)}
              </div>
            </div>
          )}
          <div className={hasRealLocation ? 'border-x border-gray-200 dark:border-gray-700' : ''}>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {t('tasks.posted', 'PUBLIC\u0112TS')}
            </div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {task.created_at ? formatTimeAgo(task.created_at) : 'New'}
            </div>
          </div>
          <div className={!hasRealLocation ? 'border-l border-gray-200 dark:border-gray-700' : ''}>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {t('tasks.applicants', 'PIETEIKUMI')}
            </div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {applicantsCount}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>\ud83d\udccd</span>
          <span className="truncate">
            {task.location?.split(',').slice(0, 2).join(', ') || 'Nearby'}
          </span>
        </div>

        {/* Creator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatorClick();
          }}
          className="flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors w-full"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
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
          
          <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {task.creator_name || t('common.anonymous', 'Anonymous')}
            </span>
            
            {(hasRating || task.creator_city) && (
              <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">|</span>
            )}
            
            {hasRating && (
              <StarRating
                rating={task.creator_rating!}
                size="xs"
                showValue
                reviewCount={task.creator_review_count || 0}
                showCount
                compact
              />
            )}
            
            {hasRating && task.creator_city && (
              <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">|</span>
            )}
            
            {task.creator_city && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {task.creator_city}
              </span>
            )}
          </div>
          
          <span className="text-gray-400 dark:text-gray-500 text-xs flex-shrink-0">\u2192</span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 py-3 bg-white dark:bg-gray-900 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onViewDetails}
          className={`flex-1 py-3 px-4 rounded-xl text-base font-bold text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isUrgent
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {t('tasks.viewAndApply', 'Skat\u012bt un pieteikties')} \u2192
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
          title={shareState === 'copied' ? t('share.copied', 'Copied!') : t('share.share', 'Share')}
        >
          {shareState === 'copied' ? (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default JobPreviewCard;
