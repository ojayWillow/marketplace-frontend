import { useTranslation } from 'react-i18next';

interface TaskStatusBannerProps {
  status: string;
  isCreator: boolean;
  isAssigned: boolean;
}

interface BannerConfig {
  textKey: string;
  colors: string;
}

export const TaskStatusBanner = ({
  status,
  isCreator,
  isAssigned,
}: TaskStatusBannerProps) => {
  const { t } = useTranslation();

  let config: BannerConfig | null = null;

  if (status === 'assigned' && isCreator) {
    config = {
      textKey: 'taskDetail.statusWaitingWorker',
      colors:
        'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40',
    };
  } else if (status === 'assigned' && isAssigned) {
    config = {
      textKey: 'taskDetail.statusAssignedToYou',
      colors:
        'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
    };
  } else if (status === 'pending_confirmation' && isCreator) {
    config = {
      textKey: 'taskDetail.statusWorkerDone',
      colors:
        'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
    };
  } else if (status === 'pending_confirmation' && isAssigned) {
    config = {
      textKey: 'taskDetail.statusWaitingConfirmation',
      colors:
        'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40',
    };
  } else if (status === 'completed') {
    config = {
      textKey: 'taskDetail.statusCompleted',
      colors:
        'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40',
    };
  } else if (status === 'cancelled') {
    config = {
      textKey: 'taskDetail.statusCancelled',
      colors:
        'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    };
  } else if (status === 'disputed' && !isCreator && !isAssigned) {
    config = {
      textKey: 'taskDetail.statusDisputed',
      colors:
        'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
    };
  }

  if (!config) return null;

  return (
    <div
      className={`mx-4 mb-4 md:mx-6 border px-3 py-2.5 rounded-lg text-center text-sm ${config.colors}`}
    >
      {t(config.textKey)}
    </div>
  );
};
