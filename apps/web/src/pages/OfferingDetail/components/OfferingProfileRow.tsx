import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { OfferingProfileRowProps } from '../types';

const OfferingProfileRow = ({ offering, safeCreatorName, isOwner }: OfferingProfileRowProps) => (
  <div className="px-4 pb-3 md:px-6 md:pt-5 md:pb-5 md:border-b md:border-gray-200 dark:md:border-gray-700">
    <div className="flex items-center gap-2.5 md:gap-4">
      <Link to={`/users/${offering.creator_id}`} className="flex-shrink-0">
        {offering.creator_avatar ? (
          <img
            src={offering.creator_avatar}
            alt={safeCreatorName}
            className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover md:border-2 md:border-amber-200 dark:md:border-amber-800"
          />
        ) : (
          <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm md:text-lg font-bold">
            {safeCreatorName.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm md:flex-col md:items-start md:gap-0.5">
        <Link to={`/users/${offering.creator_id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-500 truncate md:text-base">
          {safeCreatorName}
        </Link>
        <span className="text-gray-300 dark:text-gray-600 md:hidden">·</span>
        {offering.creator_rating !== undefined && offering.creator_rating !== null && (
          <StarRating
            rating={offering.creator_rating}
            size="xs"
            showValue
            reviewCount={offering.creator_review_count || 0}
            showCount
            compact
          />
        )}
      </div>
      {isOwner && (
        <Link
          to={`/offerings/${offering.id}/edit`}
          className="text-xs md:text-sm text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 dark:hover:text-amber-400 flex-shrink-0"
        >
          Edit
        </Link>
      )}
    </div>
  </div>
);

export default OfferingProfileRow;
