import { Task } from '../../../api/tasks';
import { getStatusLabel, getDifficultyLabel } from '../types';

interface TaskInfoGridProps {
  task: Task;
}

export const TaskInfoGrid = ({ task }: TaskInfoGridProps) => {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl">
      <div className="text-center">
        <div className="text-3xl mb-2">💰</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Price</div>
        <div className="text-lg font-semibold text-gray-900">€{task.budget || 0}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Difficulty</div>
        <div className="text-lg font-semibold text-gray-900">{getDifficultyLabel(task.priority || 'normal')}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">📅</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Deadline</div>
        <div className="text-lg font-semibold text-gray-900">
          {task.deadline 
            ? new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : 'Flexible'}
        </div>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">⚡</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Status</div>
        <div className="text-lg font-semibold text-gray-900">{getStatusLabel(task.status)}</div>
      </div>
    </div>
  );
};
