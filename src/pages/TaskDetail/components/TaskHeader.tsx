import { Link } from 'react-router-dom';
import { Task } from '../../../api/tasks';
import { getCategoryIcon, getCategoryLabel } from '../../../constants/categories';
import ShareButton from '../../../components/ui/ShareButton';

interface TaskHeaderProps {
  task: Task;
}

export const TaskHeader = ({ task }: TaskHeaderProps) => {
  const categoryIcon = getCategoryIcon(task.category);
  const categoryLabel = getCategoryLabel(task.category);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative" style={{ minHeight: '140px' }}>
      {/* Top Left - Category Badge */}
      <div className="absolute top-6 left-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
          <span>{categoryIcon}</span>
          {categoryLabel}
        </span>
      </div>
      
      {/* Top Right - Price */}
      <div className="absolute top-6 right-6 text-right">
        <div className="text-3xl font-bold">€{task.budget || 0}</div>
        <div className="text-blue-100 text-sm mt-1">Budget</div>
      </div>
      
      {/* Center - Title */}
      <div className="pt-10 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{task.title}</h1>
      </div>
      
      {/* Bottom Right - Share Button */}
      <div className="absolute bottom-6 right-6">
        <ShareButton
          url={`/tasks/${task.id}`}
          title={task.title}
          description={`${categoryLabel} job - €${task.budget || 0}`}
          size="sm"
          className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
        />
      </div>
    </div>
  );
};
