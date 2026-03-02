/**
 * Premium section for task detail pages — only shown to the task creator.
 * Allows purchasing Urgent (€2/24h) and Promote (€5/72h) features.
 */
import { useTranslation } from 'react-i18next';
import PaymentButton from '../../../components/PaymentButton';

interface TaskPremiumSectionProps {
  taskId: number;
  isUrgentActive?: boolean;
  urgentExpiresAt?: string | null;
  isPromoteActive?: boolean;
  promotedExpiresAt?: string | null;
}

export default function TaskPremiumSection({
  taskId,
  isUrgentActive = false,
  urgentExpiresAt = null,
  isPromoteActive = false,
  promotedExpiresAt = null,
}: TaskPremiumSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-4 mb-3 md:mx-6 md:mb-5 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 className="font-bold text-xs text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
        ⚡ {t('task.premium.title', 'Boost Your Task')}
      </h3>
      <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
        {t('task.premium.desc', 'Get more applicants by making your task stand out')}
      </p>
      <div className="flex flex-wrap gap-2">
        <PaymentButton
          type="urgent_task"
          targetId={taskId}
          isActive={isUrgentActive}
          expiresAt={urgentExpiresAt}
          size="sm"
        />
        <PaymentButton
          type="promote_task"
          targetId={taskId}
          isActive={isPromoteActive}
          expiresAt={promotedExpiresAt}
          size="sm"
        />
      </div>
    </div>
  );
}
