// Unified categories for Jobs and Offerings
// Aligned with shared package - same categories across web and mobile
// Designed for quick-help gig platform - simple, clear categories

export interface Category {
  value: string;
  label: string;
  icon: string;
  description: string;
}

// Complete category list (15 categories)
export const CATEGORIES: Category[] = [
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, organizing' },
  { value: 'moving', label: 'Moving & Lifting', icon: '📦', description: 'Moving, heavy lifting, transporting' },
  { value: 'assembly', label: 'Assembly', icon: '🔧', description: 'Furniture assembly, IKEA, mounting' },
  { value: 'handyman', label: 'Handyman', icon: '🛠️', description: 'Repairs, fixes, small construction' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚿', description: 'Pipes, faucets, drains' },
  { value: 'electrical', label: 'Electrical', icon: '⚡', description: 'Wiring, lighting, outlets' },
  { value: 'painting', label: 'Painting', icon: '🎨', description: 'Wall painting, touch-ups, decorating' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌿', description: 'Gardening, yard work, snow removal' },
  { value: 'delivery', label: 'Delivery & Errands', icon: '🚚', description: 'Delivery, shopping, errands' },
  { value: 'care', label: 'Care', icon: '🤝', description: 'Pet care, childcare, elderly care' },
  { value: 'tutoring', label: 'Tutoring', icon: '📚', description: 'Teaching, lessons, homework help' },
  { value: 'tech', label: 'Tech Help', icon: '💻', description: 'Computer, phone, tech support' },
  { value: 'beauty', label: 'Beauty', icon: '💇', description: 'Hair, makeup, styling' },
  { value: 'events', label: 'Events', icon: '🎉', description: 'Party setup, catering, entertainment' },
  { value: 'other', label: 'Other', icon: '📋', description: 'Everything else' },
];

// For dropdown menus - includes "All" option
export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories', icon: '🔍' },
  ...CATEGORIES.map(c => ({ value: c.value, label: c.label, icon: c.icon }))
];

// Quick lookup by value
export const getCategoryByValue = (value: string): Category | undefined => {
  return CATEGORIES.find(c => c.value === value);
};

// Get icon for a category
export const getCategoryIcon = (value: string): string => {
  return getCategoryByValue(value)?.icon || '📋';
};

// Get label for a category
export const getCategoryLabel = (value: string): string => {
  return getCategoryByValue(value)?.label || value;
};

// Get description for a category
export const getCategoryDescription = (value: string): string => {
  return getCategoryByValue(value)?.description || '';
};

// Group categories for organized display
export const CATEGORY_GROUPS = [
  {
    name: 'Home & Property',
    categories: ['cleaning', 'moving', 'assembly', 'handyman', 'plumbing', 'electrical', 'painting']
  },
  {
    name: 'Outdoor & Transport',
    categories: ['outdoor', 'delivery']
  },
  {
    name: 'People & Services',
    categories: ['care', 'tutoring', 'tech', 'beauty', 'events']
  },
  {
    name: 'Other',
    categories: ['other']
  }
];

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
export const normalizeCategory = (value: string): string => {
  return LEGACY_CATEGORY_MAP[value] || value;
};
