import { useTranslation } from 'react-i18next';
import { Task } from '@marketplace/shared';
import { getStatusLabel, getDifficultyLabel } from '@marketplace/shared';

interface TaskInfoGridProps {
  task: Task;
}

export const TaskInfoGrid = ({ task }: TaskInfoGridProps) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'lv' ? 'lv-LV' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="grid grid-cols-2 gap-3 my-5 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="text-center p-2">
        <div className="text-xl mb-1">💰</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('taskDetail.infoGrid.budget', 'Budget')}</div>
        <div className="font-bold text-sm text-green-600 dark:text-green-400">€{task.budget || 0}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">📍</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('taskDetail.infoGrid.location', 'Location')}</div>
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{task.location?.split(',')[0] || t('taskDetail.na', 'N/A')}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">⚡</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('taskDetail.infoGrid.difficulty', 'Difficulty')}</div>
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 capitalize">{task.difficulty || getDifficultyLabel(task.priority || 'normal')}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">📅</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('taskDetail.infoGrid.posted', 'Posted')}</div>
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
          {new Date(task.created_at!).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};
