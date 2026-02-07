import { Link } from 'react-router-dom';
import { Task } from '@marketplace/shared';

interface TaskActionButtonsProps {
  task: Task;
  isCreator: boolean;
  isAssigned: boolean;
  isAuthenticated: boolean;
  actionLoading: boolean;
  showApplicationForm: boolean;
  onShowApplicationForm: () => void;
  onMarkDone: () => void;
  onConfirmDone: () => void;
  onDispute: () => void;
  onCancel: () => void;
}

export const TaskActionButtons = ({
  task,
  isCreator,
  isAssigned,
  isAuthenticated,
  actionLoading,
  showApplicationForm,
  onShowApplicationForm,
  onMarkDone,
  onConfirmDone,
  onDispute,
  onCancel,
}: TaskActionButtonsProps) => {
  const hasApplied = (task as any).has_applied;
  const userApplication = (task as any).user_application;
  const canMarkDone = isAssigned && (task.status === 'assigned' || task.status === 'in_progress');
  const canEdit = isCreator && task.status === 'open';
  const canApply = isAuthenticated && !isCreator && !isAssigned && task.status === 'open' && !hasApplied;

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '\u23f3 Pending review';
      case 'accepted': return '\u2705 Accepted';
      case 'rejected': return '\u274c Rejected';
      default: return status;
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Already Applied Message */}
      {hasApplied && task.status === 'open' && (
        <div className="mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">\ud83d\udcdd</span>
            <div>
              <p className="font-semibold text-xs text-blue-800">Already applied</p>
              {userApplication && (
                <p className="text-xs text-blue-600">
                  {getApplicationStatusLabel(userApplication.status)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2.5">
        {/* Worker marking done */}
        {canMarkDone && (
          <button
            onClick={onMarkDone}
            disabled={actionLoading}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:bg-gray-400 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            {actionLoading ? 'Processing...' : '\u2713 Mark as Done'}
          </button>
        )}

        {/* Creator confirming */}
        {isCreator && task.status === 'pending_confirmation' && (
          <>
            <button
              onClick={onConfirmDone}
              disabled={actionLoading}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:bg-gray-400 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
            >
              {actionLoading ? 'Processing...' : '\u2713 Confirm'}
            </button>
            <button
              onClick={onDispute}
              disabled={actionLoading}
              className="px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-400 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
            >
              \u26a0\ufe0f Dispute
            </button>
          </>
        )}

        {/* Owner Edit/Cancel */}
        {isCreator && canEdit && (
          <>
            <Link
              to={`/tasks/${task.id}/edit`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-bold text-sm text-center shadow-lg active:scale-[0.98]"
            >
              \u270f\ufe0f Edit
            </Link>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="px-5 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all font-bold text-sm active:scale-[0.98]"
            >
              \ud83d\uddd1\ufe0f
            </button>
          </>
        )}

        {/* Visitor — Apply */}
        {canApply && !showApplicationForm && (
          <button
            onClick={onShowApplicationForm}
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-bold text-sm shadow-lg active:scale-[0.98]"
          >
            \u2713 Apply for This Job
          </button>
        )}

        {/* Login prompt */}
        {!isAuthenticated && task.status === 'open' && (
          <Link
            to="/login"
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 font-bold text-sm text-center shadow-lg active:scale-[0.98] transition-all"
          >
            Login to Apply
          </Link>
        )}
      </div>
    </div>
  );
};
