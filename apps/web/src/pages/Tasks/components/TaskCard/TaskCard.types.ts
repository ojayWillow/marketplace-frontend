import type { Task } from '@marketplace/shared';

export interface UserLocation {
  lat: number;
  lng: number;
}

// Extend API Task with UI-specific properties
export interface ExtendedTask extends Task {
  icon?: string;
  displayLatitude?: number;
  displayLongitude?: number;
}

export interface TaskCardProps {
  task: ExtendedTask;
  userLocation: UserLocation;
  isMatching?: boolean;
}
