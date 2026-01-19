import { Link } from 'react-router-dom';
import { Task } from '@marketplace/shared';
import { Offering } from '@marketplace/shared';
import { getCategoryLabel } from '../../../constants/categories';

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
  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Finding helpers nearby...</p>
      </div>
    );
  }
  
  if (helpers.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h2 className="font-bold text-lg">Recommended Helpers</h2>
            <p className="text-amber-100 text-sm">
              {helpers.length} offering {getCategoryLabel(task.category)} nearby
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {helpers.slice(0, 4).map(helper => (
            <div key={helper.id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow transition-all">
              <div className="flex items-center gap-3 mb-3">
                {helper.creator_avatar ? (
                  <img 
                    src={helper.creator_avatar} 
                    alt={helper.creator_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {helper.creator_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/users/${helper.creator_id}`}
                    className="font-medium text-gray-900 hover:text-amber-600 truncate block"
                  >
                    {helper.creator_name}
                  </Link>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">
                      {'★'.repeat(Math.floor(helper.creator_rating || 0))}
                      {'☆'.repeat(5 - Math.floor(helper.creator_rating || 0))}
                    </span>
                  </div>
                </div>
                <span className="text-green-600 font-bold">
                  €{helper.price || 0}
                </span>
              </div>

              <button
                onClick={() => onContactHelper(helper)}
                className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                💬 Contact
              </button>
            </div>
          ))}
        </div>

        {helpers.length > 4 && (
          <div className="mt-4 text-center">
            <Link 
              to={`/tasks?tab=offerings&category=${task.category}`}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              View all {helpers.length} helpers →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
