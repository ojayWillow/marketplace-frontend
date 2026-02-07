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
  
  // FIX: Only show apply if NOT assigned and task is open
  const canApply = isAuthenticated && !isCreator && !isAssigned && task.status === 'open' && !hasApplied;

  // Get application status label
  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pending review';
      case 'accepted': return '✅ Accepted';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 mt-6">
      {/* Already Applied Message */}
      {hasApplied && task.status === 'open' && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <div>
              <p className="font-semibold text-sm text-blue-800">Already applied</p>
              {userApplication && (
                <p className="text-xs text-blue-600 mt-0.5">
                  {getApplicationStatusLabel(userApplication.status)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Worker marking done - PRIORITY #1 */}
        {canMarkDone && (
          <button
            onClick={onMarkDone}
            disabled={actionLoading}
            className="flex-1 bg-green-500 text-white py-3.5 rounded-xl hover:bg-green-600 disabled:bg-gray-400 font-bold text-base shadow-lg active:scale-[0.98] transition-all"
          >
            {actionLoading ? 'Processing...' : '✓ Mark as Done'}
          </button>
        )}

        {/* Creator confirming - strictly check status */}
        {isCreator && task.status === 'pending_confirmation' && (
          <>
            <button
              onClick={onConfirmDone}
              disabled={actionLoading}
              className="flex-1 bg-green-500 text-white py-3.5 rounded-xl hover:bg-green-600 disabled:bg-gray-400 font-bold text-base shadow-lg active:scale-[0.98] transition-all"
            >
              {actionLoading ? 'Processing...' : '✓ Confirm'}
            </button>
            <button
              onClick={onDispute}
              disabled={actionLoading}
              className="px-6 py-3.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-400 font-bold text-base shadow-lg active:scale-[0.98] transition-all"
            >
              ⚠️ Dispute
            </button>
          </>
        )}

        {/* Owner Edit/Cancel View */}
        {isCreator && canEdit && (
          <>
            <Link
              to={`/tasks/${task.id}/edit`}
              className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl hover:bg-blue-600 transition-all font-bold text-base text-center shadow-lg active:scale-[0.98]"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="px-6 py-3.5 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all font-bold text-base active:scale-[0.98]"
            >
              🗑️
            </button>
          </>
        )}

        {/* Visitor View - Apply button */}
        {canApply && !showApplicationForm && (
          <button
            onClick={onShowApplicationForm}
            className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl hover:bg-blue-600 transition-all font-bold text-base shadow-lg active:scale-[0.98]"
          >
            ✓ Apply for This Job
          </button>
        )}

        {/* Login prompt */}
        {!isAuthenticated && task.status === 'open' && (
          <Link
            to="/login"
            className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl hover:bg-blue-600 font-bold text-base text-center shadow-lg active:scale-[0.98] transition-all"
          >
            Login to Apply
          </Link>
        )}
      </div>
    </div>
  );
};