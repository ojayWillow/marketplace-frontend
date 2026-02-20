import { memo } from 'react';
import { Task } from '@marketplace/shared';
import MobileJobCard from './MobileJobCard';

interface VirtualizedJobListProps {
  tasks: Task[];
  userLocation: { lat: number; lng: number };
  selectedTaskId: number | null;
  onJobSelect: (task: Task) => void;
}

/**
 * Job list for the mobile bottom sheet.
 *
 * Renders all cards directly — MobileJobCard is already wrapped in
 * React.memo with a custom comparator, so re-renders only happen
 * when individual card data changes. At typical list sizes (20-50),
 * this is more reliable and equally performant vs. virtualization.
 */
const VirtualizedJobList = memo(function VirtualizedJobList({
  tasks,
  userLocation,
  selectedTaskId,
  onJobSelect,
}: VirtualizedJobListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="h-full overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
      {tasks.map((task) => (
        <MobileJobCard
          key={task.id}
          task={task}
          userLocation={userLocation}
          onClick={() => onJobSelect(task)}
          isSelected={selectedTaskId === task.id}
        />
      ))}
      <div className="h-4" />
    </div>
  );
});

export default VirtualizedJobList;
