import { Dimensions } from 'react-native';

export const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Bottom sheet positions
export const SHEET_MIN_HEIGHT = 80;
export const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.4;
export const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// Clustering - only when markers would actually overlap
// This is the minimum distance in degrees before clustering kicks in
export const OVERLAP_THRESHOLD_FACTOR = 0.025;

// Zoom level thresholds for user location style
export const ZOOM_FAR_THRESHOLD = 0.12;    // latitudeDelta > 0.12 = zoomed out (small dot)
export const ZOOM_CLOSE_THRESHOLD = 0.05;  // latitudeDelta <= 0.05 = zoomed in (full marker with halo)

// Filter categories
export const CATEGORIES = [
  { key: 'all', label: 'All Categories', icon: '🔍' },
  { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { key: 'moving', label: 'Moving', icon: '📦' },
  { key: 'repairs', label: 'Repairs', icon: '🔧' },
  { key: 'delivery', label: 'Delivery', icon: '🚗' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚' },
  { key: 'tech', label: 'Tech', icon: '💻' },
  { key: 'beauty', label: 'Beauty', icon: '💅' },
  { key: 'other', label: 'Other', icon: '📋' },
] as const;

// Radius filter options
export const RADIUS_OPTIONS = [
  { key: 'all', label: 'All Areas', value: null },
  { key: '5', label: '5 km', value: 5 },
  { key: '10', label: '10 km', value: 10 },
  { key: '20', label: '20 km', value: 20 },
  { key: '50', label: '50 km', value: 50 },
] as const;

// Category colors for markers
export const CATEGORY_COLORS: Record<string, string> = {
  cleaning: '#10b981',
  moving: '#3b82f6',
  repairs: '#f59e0b',
  tutoring: '#8b5cf6',
  delivery: '#ec4899',
  beauty: '#a855f7',
  tech: '#06b6d4',
  other: '#6b7280',
};

export const getMarkerColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#ef4444';
};

// Zoom level type
export type ZoomLevel = 'far' | 'mid' | 'close';

export const getZoomLevel = (latitudeDelta: number | undefined): ZoomLevel => {
  if (!latitudeDelta) return 'mid';
  if (latitudeDelta > ZOOM_FAR_THRESHOLD) return 'far';
  if (latitudeDelta <= ZOOM_CLOSE_THRESHOLD) return 'close';
  return 'mid';
};
