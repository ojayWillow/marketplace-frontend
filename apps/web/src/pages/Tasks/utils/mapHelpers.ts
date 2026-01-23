// Map-related helper functions
import type { Task } from '@marketplace/shared';

/**
 * Add offset to overlapping markers so they don't stack on top of each other
 */
export const addMarkerOffsets = (tasks: Task[]): Task[] => {
  const coordMap = new Map<string, Task[]>();

  // Group tasks by their coordinates (rounded to 4 decimal places)
  tasks.forEach(task => {
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key)!.push(task);
  });

  // Apply offsets to overlapping markers
  const result: Task[] = [];
  coordMap.forEach((groupedTasks) => {
    if (groupedTasks.length === 1) {
      // Single task at this location, no offset needed
      result.push({
        ...groupedTasks[0],
        displayLatitude: groupedTasks[0].latitude,
        displayLongitude: groupedTasks[0].longitude
      });
    } else {
      // Multiple tasks at same location - spread them in a circle
      const offsetDistance = 0.0008; // Approximately 80-90 meters
      const angleStep = (2 * Math.PI) / groupedTasks.length;

      groupedTasks.forEach((task, index) => {
        const angle = angleStep * index;
        const latOffset = offsetDistance * Math.cos(angle);
        const lonOffset = offsetDistance * Math.sin(angle);

        result.push({
          ...task,
          displayLatitude: task.latitude + latOffset,
          displayLongitude: task.longitude + lonOffset
        });
      });
    }
  });

  return result;
};
