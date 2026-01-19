// Shared types for Tasks module
import type { Task as APITask } from '@/api/tasks';
import type { Offering } from '@/api/offerings';

// Extend API Task with UI-specific properties
export interface Task extends APITask {
  icon?: string;
  displayLatitude?: number;
  displayLongitude?: number;
}

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export type LocationType = 'auto' | 'default' | 'manual';

export interface UserLocation {
  lat: number;
  lng: number;
}

export type { Offering };
