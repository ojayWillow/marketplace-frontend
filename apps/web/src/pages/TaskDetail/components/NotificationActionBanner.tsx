import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface NotificationActionBannerProps {
  isCreator: boolean;
  isAssigned: boolean;
  taskStatus: string;
}

interface BannerConfig {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  darkColor: string;
  bg: string;
  darkBg: string;
  border: string;
  darkBorder: string;
  scrollTo?: string;
}

const NOTIF_TYPES = {
  NEW_APPLICATION: 'new_application',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  TASK_MARKED_DONE: 'task_marked_done',
  TASK_COMPLETED: 'task_completed',
  TASK_DISPUTED: 'task_disputed',
} as const;

const getBannerConfig = (
  notificationType: string,
  isCreator: boolean,
  isAssigned: boolean,
  taskStatus: string
): BannerConfig | null => {
  switch (notificationType) {
    case NOTIF_TYPES.NEW_APPLICATION:
      if (isCreator && taskStatus === 'open') {
        return {
          icon: '📩',
          title: 'You have new applicants!',
          subtitle: 'Review applications below and accept the best fit for your job.',
          color: 'text-blue-800', darkColor: 'dark:text-blue-300',
          bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20',
          border: 'border-blue-200', darkBorder: 'dark:border-blue-800/40',
          scrollTo: '[data-section="applications"]',
        };
      }
      if (isCreator && taskStatus !== 'open') {
        return {
          icon: '✅',
          title: 'This job already has a worker assigned',
          subtitle: 'You previously accepted an applicant for this task.',
          color: 'text-green-800', darkColor: 'dark:text-green-300',
          bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20',
          border: 'border-green-200', darkBorder: 'dark:border-green-800/40',
        };
      }
      return null;

    case NOTIF_TYPES.APPLICATION_ACCEPTED:
      if (isAssigned && (taskStatus === 'assigned' || taskStatus === 'in_progress')) {
        return {
          icon: '🎉',
          title: 'You got the job!',
          subtitle: 'Start working on this task. When you are done, mark it as complete below.',
          color: 'text-green-800', darkColor: 'dark:text-green-300',
          bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20',
          border: 'border-green-200', darkBorder: 'dark:border-green-800/40',
          scrollTo: '[data-section="actions"]',
        };
      }
      if (isAssigned && taskStatus === 'pending_confirmation') {
        return {
          icon: '📋',
          title: 'You marked this task as done',
          subtitle: 'Waiting for the task owner to confirm completion.',
          color: 'text-purple-800', darkColor: 'dark:text-purple-300',
          bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20',
          border: 'border-purple-200', darkBorder: 'dark:border-purple-800/40',
        };
      }
      if (isAssigned && taskStatus === 'completed') {
        return {
          icon: '✅',
          title: 'This task is complete!',
          subtitle: 'Great job! You can leave a review below.',
          color: 'text-green-800', darkColor: 'dark:text-green-300',
          bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20',
          border: 'border-green-200', darkBorder: 'dark:border-green-800/40',
          scrollTo: '[data-section="reviews"]',
        };
      }
      return null;

    case NOTIF_TYPES.APPLICATION_REJECTED:
      return {
        icon: '😔',
        title: 'Application not selected',
        subtitle: 'The task owner chose another applicant. Keep looking - there are more jobs available!',
        color: 'text-gray-700', darkColor: 'dark:text-gray-300',
        bg: 'bg-gray-50', darkBg: 'dark:bg-gray-800',
        border: 'border-gray-200', darkBorder: 'dark:border-gray-700',
      };

    case NOTIF_TYPES.TASK_MARKED_DONE:
      if (isCreator && taskStatus === 'pending_confirmation') {
        return {
          icon: '📋',
          title: 'Worker says the task is done!',
          subtitle: 'Review the work and confirm completion, or open a dispute if something is not right.',
          color: 'text-amber-800', darkColor: 'dark:text-amber-300',
          bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20',
          border: 'border-amber-200', darkBorder: 'dark:border-amber-800/40',
          scrollTo: '[data-section="actions"]',
        };
      }
      if (isCreator && taskStatus === 'completed') {
        return {
          icon: '✅',
          title: 'You already confirmed this task',
          subtitle: 'This task has been marked as complete. Leave a review below!',
          color: 'text-green-800', darkColor: 'dark:text-green-300',
          bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20',
          border: 'border-green-200', darkBorder: 'dark:border-green-800/40',
          scrollTo: '[data-section="reviews"]',
        };
      }
      if (isCreator && taskStatus === 'disputed') {
        return {
          icon: '⚠️',
          title: 'This task is under dispute',
          subtitle: 'Our team is reviewing the situation. We will update you soon.',
          color: 'text-red-800', darkColor: 'dark:text-red-300',
          bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20',
          border: 'border-red-200', darkBorder: 'dark:border-red-800/40',
        };
      }
      return null;

    case NOTIF_TYPES.TASK_COMPLETED:
      return {
        icon: '✅',
        title: 'Task completed!',
        subtitle: 'This task has been confirmed as done. You can leave a review below.',
        color: 'text-green-800', darkColor: 'dark:text-green-300',
        bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20',
        border: 'border-green-200', darkBorder: 'dark:border-green-800/40',
        scrollTo: '[data-section="reviews"]',
      };

    case NOTIF_TYPES.TASK_DISPUTED:
      return {
        icon: '⚠️',
        title: 'This task is under dispute',
        subtitle: 'Our team is reviewing the situation and will resolve it shortly.',
        color: 'text-red-800', darkColor: 'dark:text-red-300',
        bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20',
        border: 'border-red-200', darkBorder: 'dark:border-red-800/40',
      };

    default:
      return null;
  }
};

export const NotificationActionBanner = ({ isCreator, isAssigned, taskStatus }: NotificationActionBannerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const fromNotification = searchParams.get('from') === 'notification';
  const notificationType = searchParams.get('type') || '';

  const config = fromNotification
    ? getBannerConfig(notificationType, isCreator, isAssigned, taskStatus)
    : null;

  useEffect(() => {
    if (!config?.scrollTo || dismissed) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(config.scrollTo!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [config?.scrollTo, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('from');
    newParams.delete('type');
    setSearchParams(newParams, { replace: true });
  };

  if (!config || dismissed) return null;

  return (
    <div className={`mx-4 mt-3 md:mx-0 ${config.bg} ${config.darkBg} ${config.border} ${config.darkBorder} border rounded-xl p-4 relative`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div>
          <p className={`font-bold text-sm ${config.color} ${config.darkColor}`}>
            {config.title}
          </p>
          <p className={`text-xs mt-0.5 ${config.color} ${config.darkColor} opacity-80`}>
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
