import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Task } from '@marketplace/shared';
import { Offering } from '@marketplace/shared';
import { getCategoryLabel } from '../../../constants/categories';
import StarRating from '../../../components/ui/StarRating';

interface RecommendedHelpersProps {
  task: Task;
  helpers: Offering[];
  loading: boolean;
  onContactHelper: (helper: Offering) => void;
}

export const RecommendedHelpers = ({
  task,
  helpers,
  loading,
  onContactHelper,
}: RecommendedHelpersProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('taskDetail.helpers.finding', 'Finding helpers nearby...')}</p>
      </div>
    );
  }
  
  if (helpers.length === 0) return null;

  const categoryLabel = t(`tasks.categories.${task.category}`, getCategoryLabel(task.category));

  return (
    <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h2 className="font-bold text-lg">{t('taskDetail.helpers.title', 'Recommended Helpers')}</h2>
            <p className="text-amber-100 text-sm">
              {t('taskDetail.helpers.offeringNearby', '{{count}} offering {{category}} nearby', { count: helpers.length, category: categoryLabel })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {helpers.slice(0, 4).map(helper => (
            <div key={helper.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow transition-all">
              <div className="flex items-center gap-3 mb-3">
                {helper.creator_avatar ? (
                  <img 
                    src={helper.creator_avatar} 
                    alt={helper.creator_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 dark:border-amber-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {helper.creator_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/users/${helper.creator_id}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400 truncate block"
                  >
                    {helper.creator_name}
                  </Link>
                  <StarRating
                    rating={helper.creator_rating || 0}
                    size="xs"
                    showValue
                    reviewCount={helper.creator_review_count || 0}
                    showCount
                    compact
                  />
                </div>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  €{helper.price || 0}
                </span>
              </div>

              <button
                onClick={() => onContactHelper(helper)}
                className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                {t('taskDetail.helpers.contact', '💬 Contact')}
              </button>
            </div>
          ))}
        </div>

        {helpers.length > 4 && (
          <div className="mt-4 text-center">
            <Link 
              to={`/tasks?tab=offerings&category=${task.category}`}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              {t('taskDetail.helpers.viewAll', 'View all {{count}} helpers →', { count: helpers.length })}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
