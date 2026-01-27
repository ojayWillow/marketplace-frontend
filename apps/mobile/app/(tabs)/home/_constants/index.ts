import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Layout constants
export const SHEET_MIN_HEIGHT = 80;
export const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.4;
export const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// Map constants
export const DEFAULT_LOCATION = { latitude: 56.9496, longitude: 24.1052 };
export const OVERLAP_THRESHOLD_FACTOR = 0.025;
export const ZOOM_FAR_THRESHOLD = 0.12;
export const ZOOM_CLOSE_THRESHOLD = 0.05;

// Theme colors
export const JOB_COLOR = '#0ea5e9';      // Sky blue
export const OFFERING_COLOR = '#f97316';  // Orange

// Filter options
export const RADIUS_OPTIONS = [
  { key: 'all', label: 'All Areas', value: null },
  { key: '5', label: '5 km', value: 5 },
  { key: '10', label: '10 km', value: 10 },
  { key: '20', label: '20 km', value: 20 },
  { key: '50', label: '50 km', value: 50 },
] as const;

export const DIFFICULTY_OPTIONS = [
  { key: 'all', label: 'All', value: null, color: '#6b7280' },
  { key: 'easy', label: 'Easy', value: 'easy', color: '#10b981' },
  { key: 'medium', label: 'Medium', value: 'medium', color: '#f59e0b' },
  { key: 'hard', label: 'Hard', value: 'hard', color: '#ef4444' },
] as const;

// Category colors for markers
export const CATEGORY_COLORS: Record<string, string> = {
  cleaning: '#10b981',
  moving: '#3b82f6',
  'heavy-lifting': '#ef4444',
  assembly: '#f59e0b',
  mounting: '#8b5cf6',
  handyman: '#6366f1',
  plumbing: '#06b6d4',
  electrical: '#eab308',
  painting: '#ec4899',
  gardening: '#22c55e',
  'car-wash': '#3b82f6',
  delivery: '#f97316',
  shopping: '#a855f7',
  'pet-care': '#f472b6',
  tutoring: '#8b5cf6',
  'tech-help': '#06b6d4',
  beauty: '#ec4899',
  other: '#6b7280',
};

export const getMarkerColor = (category: string): string => {
  return CATEGORY_COLORS[category] || JOB_COLOR;
};
