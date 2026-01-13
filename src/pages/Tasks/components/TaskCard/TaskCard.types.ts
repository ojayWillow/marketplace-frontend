import type { Task, UserLocation } from '../../types';

export interface TaskCardProps {
  task: Task;
  userLocation: UserLocation;
  isMatching?: boolean;
}
