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
  { key: 'delivery', label: 'Delivery & Errands', icon: '🚚', description: 'Delivery, shopping, errands, driving' },
  { key: 'care', label: 'Care', icon: '🤝', description: 'Pet care, childcare, elderly care' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚', description: 'Teaching, lessons, homework help' },
  { key: 'tech', label: 'Tech Help', icon: '💻', description: 'Computer, phone, tech support' },
  { key: 'beauty', label: 'Beauty', icon: '💇', description: 'Hair, makeup, styling' },
  { key: 'events', label: 'Events', icon: '🎉', description: 'Party setup, catering, cooking, entertainment' },
  { key: 'other', label: 'Other', icon: '📋', description: 'Everything else' },
];

// Categories for create/edit forms (excludes 'all')
export const FORM_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all');

// Valid category keys (for filtering)
export const VALID_CATEGORY_KEYS = FORM_CATEGORIES.map(c => c.key);

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
  // Old mobile categories
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
  // Additional legacy skills
  'tech-support': 'tech',
  'techsupport': 'tech',
  'cooking': 'events',
  'catering': 'events',
  'driving': 'delivery',
  'driver': 'delivery',
  'transport': 'delivery',
  'cleaning-services': 'cleaning',
  'house-cleaning': 'cleaning',
  'dog-walking': 'care',
  'pet-sitting': 'care',
  'lawn-care': 'outdoor',
  'yard-work': 'outdoor',
  'furniture-assembly': 'assembly',
  'ikea': 'assembly',
};

// Normalize category - converts legacy keys to new ones
export const normalizeCategory = (key: string): string => {
  const normalized = key.toLowerCase().trim();
  return LEGACY_CATEGORY_MAP[normalized] || normalized;
};

// Check if a category key is valid (exists in current categories)
export const isValidCategory = (key: string): boolean => {
  return VALID_CATEGORY_KEYS.includes(key);
};

// Filter and normalize skills array - removes invalid ones, converts legacy
export const normalizeSkills = (skills: string[]): string[] => {
  const normalized = skills
    .map(s => normalizeCategory(s.toLowerCase().trim()))
    .filter(s => isValidCategory(s));
  // Remove duplicates
  return [...new Set(normalized)];
};
