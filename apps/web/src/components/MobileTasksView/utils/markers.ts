import { divIcon } from 'leaflet';
import { Task } from '@marketplace/shared';

/**
 * Add offset to overlapping markers so they don't stack
 * @param tasks - Array of tasks with coordinates
 * @returns Tasks with display coordinates offset for overlapping positions
 */
export const addMarkerOffsets = (tasks: Task[]): Task[] => {
  const coordMap = new Map<string, Task[]>();

  tasks.forEach((task) => {
    const key = `${task.latitude.toFixed(4)},${task.longitude.toFixed(4)}`;
    if (!coordMap.has(key)) coordMap.set(key, []);
    coordMap.get(key)!.push(task);
  });

  const result: Task[] = [];
  coordMap.forEach((groupedTasks) => {
    if (groupedTasks.length === 1) {
      result.push({
        ...groupedTasks[0],
        displayLatitude: groupedTasks[0].latitude,
        displayLongitude: groupedTasks[0].longitude,
      });
    } else {
      const offsetDistance = 0.0008;
      const angleStep = (2 * Math.PI) / groupedTasks.length;
      groupedTasks.forEach((task, index) => {
        const angle = angleStep * index;
        result.push({
          ...task,
          displayLatitude: task.latitude + offsetDistance * Math.cos(angle),
          displayLongitude: task.longitude + offsetDistance * Math.sin(angle),
        });
      });
    }
  });

  return result;
};

/**
 * Create user location icon - Blue pulsing dot
 */
export const createUserLocationIcon = () =>
  divIcon({
    className: 'user-location-icon',
    html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59,130,246,0.5);
      "></div>
    </div>
  `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

// ── Icon caches ──────────────────────────────────────────────────────
// Two separate caches: one for normal state, one for selected state.
// Selected icons have different size/anchor so they can't share entries.
const iconCache = new Map<string, ReturnType<typeof divIcon>>();
const selectedIconCache = new Map<string, ReturnType<typeof divIcon>>();

/**
 * Build the cache key from the visual-differentiating parameters.
 */
const iconKey = (budget: number, isUrgent: boolean) => `${budget}-${isUrgent}`;

/**
 * Create (or return cached) job price marker icon — compact version.
 *
 * Icons are cached by budget+urgent for normal state, and separately
 * for selected state. This avoids creating new L.divIcon objects on
 * every React render when the task list hasn't changed.
 *
 * @param budget - Job budget amount
 * @param isSelected - Whether this marker is currently selected
 * @param isUrgent - Whether this job is marked as urgent
 */
export const getJobPriceIcon = (budget: number = 0, isSelected: boolean = false, isUrgent: boolean = false) => {
  const key = iconKey(budget, isUrgent);
  const cache = isSelected ? selectedIconCache : iconCache;

  if (cache.has(key)) return cache.get(key)!;

  // Build the icon
  let bgColor = '#22c55e';
  let shadow = '0 2px 4px rgba(0,0,0,0.25)';
  let border = `${isSelected ? 2.5 : 1.5}px solid white`;

  if (budget <= 25) bgColor = '#22c55e';
  else if (budget <= 75) bgColor = '#3b82f6';
  else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)';
    shadow = '0 2px 8px rgba(139, 92, 246, 0.5)';
  }

  if (isUrgent) {
    border = `${isSelected ? 2.5 : 1.5}px solid #ef4444`;
    shadow = '0 0 0 1.5px rgba(239, 68, 68, 0.3), ' + shadow;
  }

  const fontSize = isSelected ? 12 : 11;
  const padding = isSelected ? '3px 8px' : '2px 6px';
  const selectedShadow = isSelected ? '0 3px 12px rgba(0,0,0,0.35)' : shadow;

  const priceText =
    budget >= 1000 ? `&euro;${(budget / 1000).toFixed(1)}k` : `&euro;${budget}`;
  const bgStyle = bgColor.includes('gradient')
    ? `background: ${bgColor};`
    : `background-color: ${bgColor};`;

  const urgentRing = isUrgent
    ? `<div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border-radius: 10px;
        animation: urgentPulse 1.5s ease-out infinite;
        border: 1.5px solid #ef4444;
        pointer-events: none;
      "></div>`
    : '';

  const icon = divIcon({
    className: `job-price-icon ${isSelected ? 'selected-marker' : ''} ${isUrgent ? 'urgent-marker' : ''}`,
    html: `<div style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
      ${urgentRing}
      <div style="
        ${bgStyle}
        color: white;
        font-size: ${fontSize}px;
        font-weight: 700;
        padding: ${padding};
        border-radius: 10px;
        white-space: nowrap;
        box-shadow: ${selectedShadow};
        border: ${border};
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        position: relative;
        z-index: 1;
      ">${priceText}</div>
    </div>`,
    iconSize: isSelected ? [55, 28] : [45, 24],
    iconAnchor: isSelected ? [27, 14] : [22, 12],
  });

  cache.set(key, icon);
  return icon;
};
