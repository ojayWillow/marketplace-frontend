// Unified categories for Jobs and Offerings
// Used across web and mobile apps
// Designed for quick-help gig platform - simple, clear categories

export interface Category {
  key: string;
  label: string;
  icon: string;
  description: string;
}

// Complete category list (15 categories + 'all' for filters)
export const CATEGORIES: Category[] = [
  { key: 'all', label: 'All Categories', icon: '🔍', description: 'Show all categories' },
  { key: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, organizing' },
  { key: 'moving', label: 'Moving & Lifting', icon: '📦', description: 'Moving, heavy lifting, transporting' },
  { key: 'assembly', label: 'Assembly', icon: '🔧', description: 'Furniture assembly, IKEA, mounting' },
  { key: 'handyman', label: 'Handyman', icon: '🛠️', description: 'Repairs, fixes, small construction' },
  { key: 'plumbing', label: 'Plumbing', icon: '🚿', description: 'Pipes, faucets, drains' },
  { key: 'electrical', label: 'Electrical', icon: '⚡', description: 'Wiring, lighting, outlets' },
  { key: 'painting', label: 'Painting', icon: '🎨', description: 'Wall painting, touch-ups, decorating' },
  { key: 'outdoor', label: 'Outdoor', icon: '🌿', description: 'Gardening, yard work, snow removal' },
  { key: 'delivery', label: 'Delivery & Errands', icon: '🚚', description: 'Delivery, shopping, errands' },
  { key: 'care', label: 'Care', icon: '🤝', description: 'Pet care, childcare, elderly care' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚', description: 'Teaching, lessons, homework help' },
  { key: 'tech', label: 'Tech Help', icon: '💻', description: 'Computer, phone, tech support' },
  { key: 'beauty', label: 'Beauty', icon: '💇', description: 'Hair, makeup, styling' },
  { key: 'events', label: 'Events', icon: '🎉', description: 'Party setup, catering, entertainment' },
  { key: 'other', label: 'Other', icon: '📋', description: 'Everything else' },
];

// Categories for create/edit forms (excludes 'all')
export const FORM_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all');

// Quick lookup by key
export const getCategoryByKey = (key: string): Category | undefined => {
  return CATEGORIES.find(c => c.key === key);
};

// Get icon for a category
export const getCategoryIcon = (key: string): string => {
  return getCategoryByKey(key)?.icon || '📋';
};

// Get label for a category
export const getCategoryLabel = (key: string): string => {
  return getCategoryByKey(key)?.label || key;
};

// Get description for a category
export const getCategoryDescription = (key: string): string => {
  return getCategoryByKey(key)?.description || '';
};

// Legacy mapping - maps old category keys to new ones
// Use this for backward compatibility with existing data
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'heavy-lifting': 'moving',
  'mounting': 'assembly',
  'construction': 'handyman',
  'repair': 'handyman',
  'gardening': 'outdoor',
  'car-wash': 'outdoor',
  'snow-removal': 'outdoor',
  'pet-care': 'care',
  'babysitting': 'care',
  'childcare': 'care',
  'elderly-care': 'care',
  'shopping': 'delivery',
  'errands': 'delivery',
  'tech-help': 'tech',
  'hospitality': 'events',
  'music': 'events',
  'photography': 'other',
  'translation': 'other',
  'fitness': 'other',
};

// Normalize category - converts legacy keys to new ones
export const normalizeCategory = (key: string): string => {
  return LEGACY_CATEGORY_MAP[key] || key;
};
