import { Link } from 'react-router-dom';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import { useMatchingJobs } from '../hooks';
import { MatchingJobsSectionProps } from '../types';

const MatchingJobsSection = ({ offering, userId }: MatchingJobsSectionProps) => {
  const { matchingJobs, jobsLoading } = useMatchingJobs(offering, userId);

  if (userId !== offering.creator_id) return null;

  return (
    <div className="mt-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 md:p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <div>
            <h2 className="text-sm md:text-base font-bold">Jobs Matching Your Service</h2>
            <p className="text-blue-100 text-xs md:text-sm">
              Open {getCategoryLabel(offering.category)} jobs near you
            </p>
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        {jobsLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Finding matching jobs...</p>
          </div>
        ) : matchingJobs.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl mb-1">👀</div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No matching jobs yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              No one is looking for {getCategoryLabel(offering.category)} help in your area right now.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {matchingJobs.map(job => (
              <Link
                key={job.id}
                to={`/tasks/${job.id}`}
                className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{getCategoryIcon(job.category)}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{job.title || 'Untitled'}</h4>
                      {job.is_urgent && (
                        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">⚡</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 md:line-clamp-2">{job.description || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-bold text-green-600 dark:text-green-500">€{job.budget || 0}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {matchingJobs.length > 0 && (
          <div className="mt-3 text-center">
            <Link
              to={`/tasks?tab=jobs&category=${offering.category}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs md:text-sm font-medium"
            >
              Browse all {getCategoryLabel(offering.category)} jobs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingJobsSection;
