import { Task as APITask } from '../../api/tasks';

// Extend API Task with UI-specific properties
export interface Task extends APITask {
  icon?: string;
  displayLatitude?: number;
  displayLongitude?: number;
}

export type SheetPosition = 'collapsed' | 'half' | 'full';
