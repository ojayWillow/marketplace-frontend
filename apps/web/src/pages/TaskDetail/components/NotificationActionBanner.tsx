import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NotificationType } from '@marketplace/shared/src/api/notifications';

interface NotificationActionBannerProps {
  isCreator: boolean;
  isAssigned: boolean;
  taskStatus: string;
}

interface BannerConfig {
  icon: string;
  title: string;
  subtitle: string;
  color: string;       // tailwind text color
  bg: string;          // tailwind bg color
  border: string;      // tailwind border color
  scrollTo?: string;   // CSS selector to scroll to
}

/**
 * Determines the right banner message based on notification type + user role + task status.
 */
const getBannerConfig = (
  notificationType: string,
  isCreator: boolean,
  isAssigned: boolean,
  taskStatus: string
): BannerConfig | null => {
  switch (notificationType) {
    case NotificationType.NEW_APPLICATION:
      if (isCreator && taskStatus === 'open') {
        return {
          icon: '\u{1F4E9}',
          title: 'You have new applicants!',
          subtitle: 'Review applications below and accept the best fit for your job.',
          color: 'text-blue-800',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          scrollTo: '[data-section="applications"]',
        };
      }
      if (isCreator && taskStatus !== 'open') {
        return {
          icon: '\u{2705}',
          title: 'This job already has a worker assigned',
          subtitle: 'You previously accepted an applicant for this task.',
          color: 'text-green-800',
          bg: 'bg-green-50',
          border: 'border-green-200',
        };
      }
      return null;

    case NotificationType.APPLICATION_ACCEPTED:
      if (isAssigned && (taskStatus === 'assigned' || taskStatus === 'in_progress')) {
        return {
          icon: '\u{1F389}',
          title: 'You got the job!',
          subtitle: 'Start working on this task. When you\u2019re done, mark it as complete below.',
          color: 'text-green-800',
          bg: 'bg-green-50',
          border: 'border-green-200',
          scrollTo: '[data-section="actions"]',
        };
      }
      if (isAssigned && taskStatus === 'pending_confirmation') {
        return {
          icon: '\u{1F4CB}',
          title: 'You marked this task as done',
          subtitle: 'Waiting for the task owner to confirm completion.',
          color: 'text-purple-800',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
        };
      }
      if (isAssigned && taskStatus === 'completed') {
        return {
          icon: '\u{2705}',
          title: 'This task is complete!',
          subtitle: 'Great job! You can leave a review below.',
          color: 'text-green-800',
          bg: 'bg-green-50',
          border: 'border-green-200',
          scrollTo: '[data-section="reviews"]',
        };
      }
      return null;

    case NotificationType.APPLICATION_REJECTED:
      return {
        icon: '\u{1F614}',
        title: 'Application not selected',
        subtitle: 'The task owner chose another applicant. Keep looking \u2014 there are more jobs available!',
        color: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };

    case NotificationType.TASK_MARKED_DONE:
      if (isCreator && taskStatus === 'pending_confirmation') {
        return {
          icon: '\u{1F4CB}',
          title: 'Worker says the task is done!',
          subtitle: 'Review the work and confirm completion, or open a dispute if something isn\u2019t right.',
          color: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          scrollTo: '[data-section="actions"]',
        };
      }
      if (isCreator && taskStatus === 'completed') {
        return {
          icon: '\u{2705}',
          title: 'You already confirmed this task',
          subtitle: 'This task has been marked as complete. Leave a review below!',
          color: 'text-green-800',
          bg: 'bg-green-50',
          border: 'border-green-200',
          scrollTo: '[data-section="reviews"]',
        };
      }
      if (isCreator && taskStatus === 'disputed') {
        return {
          icon: '\u26A0\uFE0F',
          title: 'This task is under dispute',
          subtitle: 'Our team is reviewing the situation. We\u2019ll update you soon.',
          color: 'text-red-800',
          bg: 'bg-red-50',
          border: 'border-red-200',
        };
      }
      return null;

    case NotificationType.TASK_COMPLETED:
      return {
        icon: '\u{2705}',
        title: 'Task completed!',
        subtitle: 'This task has been confirmed as done. You can leave a review below.',
        color: 'text-green-800',
        bg: 'bg-green-50',
        border: 'border-green-200',
        scrollTo: '[data-section="reviews"]',
      };

    case NotificationType.TASK_DISPUTED:
      return {
        icon: '\u26A0\uFE0F',
        title: 'This task is under dispute',
        subtitle: 'Our team is reviewing the situation and will resolve it shortly.',
        color: 'text-red-800',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };

    default:
      return null;
  }
};

/**
 * Contextual banner shown at the top of TaskDetail when the user arrives
 * from a notification. Tells them exactly what action to take based on
 * their role (job giver / job doer) and the current task status.
 */
export const NotificationActionBanner = ({ isCreator, isAssigned, taskStatus }: NotificationActionBannerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const fromNotification = searchParams.get('from') === 'notification';
  const notificationType = searchParams.get('type') || '';

  const config = fromNotification
    ? getBannerConfig(notificationType, isCreator, isAssigned, taskStatus)
    : null;

  // Auto-scroll to relevant section after a small delay
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
    // Clean URL params without a navigation
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('from');
    newParams.delete('type');
    setSearchParams(newParams, { replace: true });
  };

  if (!config || dismissed) return null;

  return (
    <div className={`mx-4 mt-3 md:mx-0 ${config.bg} ${config.border} border rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2 duration-300`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{config.icon}</span>

        {/* Text */}
        <div>
          <p className={`font-bold text-sm ${config.color}`}>
            {config.title}
          </p>
          <p className={`text-xs mt-0.5 ${config.color} opacity-80`}>
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
