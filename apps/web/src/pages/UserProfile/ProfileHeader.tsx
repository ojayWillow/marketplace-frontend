interface ProfileHeaderProps {
  displayName: string;
  avatarUrl?: string;
  initials: string;
  bio?: string;
  isVerified?: boolean;
  memberSince: string;
  averageRating?: number | null;
  reviewsCount?: number | null;
}

export default function ProfileHeader({
  displayName,
  avatarUrl,
  initials,
  bio,
  isVerified,
  memberSince,
  averageRating,
  reviewsCount,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 ring-4 ring-white dark:ring-gray-800 shadow-lg">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white text-3xl font-bold">
            {initials}
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{displayName}</h1>

      {bio && (
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-3">
          {bio}
        </p>
      )}

      <div className="flex items-center gap-3 text-sm">
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
        {memberSince && (
          <span className="text-gray-400 dark:text-gray-500">
            Member since {memberSince}
          </span>
        )}
      </div>

      {(averageRating != null && reviewsCount != null && reviewsCount > 0) && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`text-lg ${
                  star <= Math.round(averageRating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-200 dark:text-gray-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {averageRating?.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}
    </div>
  );
}
