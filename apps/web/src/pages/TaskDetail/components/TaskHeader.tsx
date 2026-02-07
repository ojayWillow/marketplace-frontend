import { Link } from 'react-router-dom';
import { Task } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import ShareButton from '../../../components/ui/ShareButton';

interface TaskHeaderProps {
  task: Task;
}

export const TaskHeader = ({ task }: TaskHeaderProps) => {
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);

  return (
    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-5 text-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryIcon}</span>
          <div>
            <span className="px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
              {categoryLabel}
            </span>
            {task.is_urgent && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold">
                🔥 Urgent
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-2xl font-black">
            €{task.budget || task.reward || 0}
          </div>
          <ShareButton
            url={`/tasks/${task.id}`}
            title={task.title}
            description={`${categoryLabel} job - €${task.budget || 0}`}
            size="sm"
            className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
          />
        </div>
      </div>

      <h1 className="text-xl font-bold leading-tight">{task.title}</h1>
    </div>
  );
};
