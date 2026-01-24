import { Dimensions } from 'react-native';
import { calculateDistance as calcDistance } from '../../../utils/mapClustering';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sheet dimensions
export const SHEET_MIN_HEIGHT = 80;
export const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.4;
export const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// Default location (Riga)
export const DEFAULT_LOCATION = { latitude: 56.9496, longitude: 24.1052 };

// Map thresholds
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
];

export const DIFFICULTY_OPTIONS = [
  { key: 'all', label: 'All', value: null, color: '#6b7280' },
  { key: 'easy', label: 'Easy', value: 'easy', color: '#10b981' },
  { key: 'medium', label: 'Medium', value: 'medium', color: '#f59e0b' },
  { key: 'hard', label: 'Hard', value: 'hard', color: '#ef4444' },
];

// Zoom level helper
export type ZoomLevel = 'far' | 'mid' | 'close';
export const getZoomLevel = (latitudeDelta: number | undefined): ZoomLevel => {
  if (!latitudeDelta) return 'mid';
  if (latitudeDelta > ZOOM_FAR_THRESHOLD) return 'far';
  if (latitudeDelta <= ZOOM_CLOSE_THRESHOLD) return 'close';
  return 'mid';
};

// Distance calculation
export const calculateDistance = calcDistance;

// Category colors
export const getMarkerColor = (category: string): string => {
  const colors: Record<string, string> = {
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
  return colors[category] || JOB_COLOR;
};

// Time formatting
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

export const formatPostedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

// Difficulty helper
export const getDifficultyIndicator = (difficulty: 'easy' | 'medium' | 'hard' | undefined): { color: string; label: string } => {
  switch (difficulty) {
    case 'easy': return { color: '#10b981', label: 'Easy' };
    case 'hard': return { color: '#ef4444', label: 'Hard' };
    case 'medium':
    default: return { color: '#f59e0b', label: 'Medium' };
  }
};
