import { Task as APITask } from '@marketplace/shared';

// Extend API Task with UI-specific properties
export interface Task extends APITask {
  icon?: string;
  displayLatitude?: number;
  displayLongitude?: number;
}

export type SheetPosition = 'collapsed' | 'half' | 'full';
