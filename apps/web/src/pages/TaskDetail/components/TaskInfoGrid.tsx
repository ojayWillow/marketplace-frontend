import { Task } from '@marketplace/shared';
import { getStatusLabel, getDifficultyLabel } from '@marketplace/shared';

interface TaskInfoGridProps {
  task: Task;
}

export const TaskInfoGrid = ({ task }: TaskInfoGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 my-5 p-3.5 bg-gray-50 rounded-xl">
      <div className="text-center p-2">
        <div className="text-xl mb-1">💰</div>
        <div className="text-xs text-gray-500 font-medium">Budget</div>
        <div className="font-bold text-sm text-green-600">€{task.budget || 0}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">📍</div>
        <div className="text-xs text-gray-500 font-medium">Location</div>
        <div className="font-bold text-sm truncate">{task.location?.split(',')[0] || 'N/A'}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">⚡</div>
        <div className="text-xs text-gray-500 font-medium">Difficulty</div>
        <div className="font-bold text-sm capitalize">{task.difficulty || getDifficultyLabel(task.priority || 'normal')}</div>
      </div>
      <div className="text-center p-2">
        <div className="text-xl mb-1">📅</div>
        <div className="text-xs text-gray-500 font-medium">Posted</div>
        <div className="font-bold text-sm">
          {new Date(task.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};
