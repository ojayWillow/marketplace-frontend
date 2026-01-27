import { type Task } from '@marketplace/shared';

/**
 * Apply spiral offset to markers at the same location
 * This spreads overlapping markers in a spiral pattern so they're all visible
 */
export function applyOverlapOffset(
  tasks: Task[]
): (Task & { displayLat: number; displayLng: number })[] {
  // Group tasks by location (rounded to ~10m precision)
  const locationGroups = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    if (!task.latitude || !task.longitude) return;
    // Round to 4 decimal places (~11m precision) to group nearby markers
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!locationGroups.has(key)) {
      locationGroups.set(key, []);
    }
    locationGroups.get(key)!.push(task);
  });

  const result: (Task & { displayLat: number; displayLng: number })[] = [];
  
  locationGroups.forEach((group) => {
    if (group.length === 1) {
      // Single marker - no offset needed
      result.push({
        ...group[0],
        displayLat: group[0].latitude!,
        displayLng: group[0].longitude!,
      });
    } else {
      // Multiple markers at same location - apply spiral offset
      const baseOffset = 0.0003; // ~30 meters at equator
      
      group.forEach((task, index) => {
        if (index === 0) {
          // First marker stays at original position
          result.push({
            ...task,
            displayLat: task.latitude!,
            displayLng: task.longitude!,
          });
        } else {
          // Spiral pattern: each subsequent marker goes further out
          const angle = (index * 137.5 * Math.PI) / 180; // Golden angle for nice distribution
          const radius = baseOffset * Math.sqrt(index); // Increasing radius
          
          result.push({
            ...task,
            displayLat: task.latitude! + (radius * Math.cos(angle)),
            displayLng: task.longitude! + (radius * Math.sin(angle)),
          });
        }
      });
    }
  });

  return result;
}
