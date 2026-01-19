import { Link } from 'react-router-dom';
import { Task } from '../../../api/tasks';

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
  const canApply = isAuthenticated && !isCreator && task.status === 'open' && !hasApplied;
  const canMarkDone = isAssigned && (task.status === 'assigned' || task.status === 'in_progress');
  const canEdit = isCreator && task.status === 'open';

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
    <div className="mt-8">
      {/* Already Applied Message */}
      {hasApplied && task.status === 'open' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-blue-800">You have already applied to this task</p>
              {userApplication && (
                <p className="text-sm text-blue-600 mt-1">
                  Status: {getApplicationStatusLabel(userApplication.status)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Visitor View - Apply button at the bottom */}
        {canApply && !showApplicationForm && (
          <button
            onClick={onShowApplicationForm}
            className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
          >
            ✓ Apply for This Job
          </button>
        )}
        
        {/* Owner View */}
        {isCreator && canEdit && (
          <>
            <Link
              to={`/tasks/${task.id}/edit`}
              className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg text-center"
            >
              ✏️ Edit Task
            </Link>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="px-8 py-4 border border-gray-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              🗑️ Cancel Task
            </button>
          </>
        )}

        {/* Worker marking done */}
        {canMarkDone && (
          <button
            onClick={onMarkDone}
            disabled={actionLoading}
            className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-lg"
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
              className="flex-1 bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold text-lg"
            >
              {actionLoading ? 'Processing...' : '✓ Confirm Completed'}
            </button>
            <button
              onClick={onDispute}
              disabled={actionLoading}
              className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-medium"
            >
              ⚠️ Dispute
            </button>
          </>
        )}

        {/* Login prompt */}
        {!isAuthenticated && task.status === 'open' && (
          <Link 
            to="/login" 
            className="flex-1 bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 font-semibold text-lg text-center"
          >
            Login to Apply
          </Link>
        )}
      </div>
    </div>
  );
};
