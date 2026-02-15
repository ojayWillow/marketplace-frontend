import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { OfferingProfileRowProps } from '../types';

const OfferingProfileRow = ({ offering, safeCreatorName, isOwner, contacting, onContact }: OfferingProfileRowProps) => (
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
          <div className="flex items-center gap-1">
            <StarRating rating={offering.creator_rating} />
            <span className="text-gray-400 dark:text-gray-500 text-xs">({offering.creator_review_count || 0})</span>
          </div>
        )}
      </div>
      {!isOwner && (
        <button
          onClick={onContact}
          disabled={contacting}
          className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          title="Send message"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      {!isOwner && (
        <Link
          to={`/users/${offering.creator_id}`}
          className="text-xs md:text-sm text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 dark:hover:text-amber-400 flex-shrink-0"
        >
          Profile
        </Link>
      )}
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
