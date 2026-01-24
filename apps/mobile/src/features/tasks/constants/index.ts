// Re-export shared constants from home feature
export { 
  JOB_COLOR, 
  OFFERING_COLOR, 
  DIFFICULTY_OPTIONS,
  DEFAULT_LOCATION,
  calculateDistance 
} from '../../home/constants';

// Tasks-specific types
export type MainTab = 'all' | 'jobs' | 'services';
