import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Task } from '@marketplace/shared';
import { useAuthPrompt } from '../../../stores/useAuthPrompt';

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

// Dispute should NOT show on 'completed' tasks — only while work is active or pending
const WORKER_DISPUTABLE_STATUSES = ['assigned', 'in_progress', 'pending_confirmation'];
const CREATOR_DISPUTABLE_STATUSES = ['in_progress', 'pending_confirmation'];

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
  const { t } = useTranslation();
  const showAuth = useAuthPrompt((s) => s.show);
  const hasApplied = (task as any).has_applied;
  const userApplication = (task as any).user_application;
  const canMarkDone = isAssigned && (task.status === 'assigned' || task.status === 'in_progress');
  const canEdit = isCreator && task.status === 'open';
  const canApply = isAuthenticated && !isCreator && !isAssigned && task.status === 'open' && !hasApplied;

  // Dispute visibility: only during active work, NOT after completed
  const canDispute =
    (isAssigned && WORKER_DISPUTABLE_STATUSES.includes(task.status)) ||
    (isCreator && CREATOR_DISPUTABLE_STATUSES.includes(task.status));

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('taskDetail.actions.pendingReview', '⏳ Pending review');
      case 'accepted': return t('taskDetail.actions.accepted', '✅ Accepted');
      case 'rejected': return t('taskDetail.actions.rejected', '❌ Rejected');
      default: return status;
    }
  };

  // Handle apply click for guests — show auth sheet, then open application form
  const handleGuestApply = () => {
    showAuth(() => {
      onShowApplicationForm();
    });
  };

  // Don't render anything for completed/cancelled/disputed tasks
  if (['completed', 'cancelled', 'disputed'].includes(task.status) && !canDispute) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      {/* Already Applied Message */}
      {hasApplied && task.status === 'open' && (
        <div className="mb-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div>
              <p className="font-semibold text-xs text-blue-800 dark:text-blue-300">{t('taskDetail.actions.alreadyApplied', 'Already applied')}</p>
              {userApplication && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
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
            className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            {actionLoading ? t('taskDetail.actions.processing', 'Processing...') : t('taskDetail.actions.markDone', '✓ Mark as Done')}
          </button>
        )}

        {/* Creator confirming */}
        {isCreator && task.status === 'pending_confirmation' && (
          <button
            onClick={onConfirmDone}
            disabled={actionLoading}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            {actionLoading ? t('taskDetail.actions.processing', 'Processing...') : t('taskDetail.actions.confirm', '✓ Confirm')}
          </button>
        )}

        {/* Dispute button — only during active work */}
        {canDispute && (
          <button
            onClick={onDispute}
            disabled={actionLoading}
            className="px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            {t('taskDetail.actions.dispute', '⚠️ Dispute')}
          </button>
        )}

        {/* Owner Edit/Cancel */}
        {isCreator && canEdit && (
          <>
            <Link
              to={`/tasks/${task.id}/edit`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-bold text-sm text-center shadow-lg active:scale-[0.98]"
            >
              {t('taskDetail.actions.edit', '✏️ Edit')}
            </Link>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="px-5 py-3 border-2 border-red-500 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold text-sm active:scale-[0.98]"
            >
              🗑️
            </button>
          </>
        )}

        {/* Authenticated visitor — Apply */}
        {canApply && !showApplicationForm && (
          <button
            onClick={onShowApplicationForm}
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-bold text-sm shadow-lg active:scale-[0.98]"
          >
            {t('taskDetail.actions.applyForJob', '✓ Apply for This Job')}
          </button>
        )}

        {/* Guest — Apply (opens auth sheet first) */}
        {!isAuthenticated && task.status === 'open' && (
          <button
            onClick={handleGuestApply}
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            {t('taskDetail.actions.applyForJob', '✓ Apply for This Job')}
          </button>
        )}
      </div>
    </div>
  );
};
