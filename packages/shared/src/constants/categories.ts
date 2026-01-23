// Shared categories for Jobs and Offerings
// Used across web and mobile apps

export interface Category {
  key: string;
  label: string;
  icon: string;
}

// Complete category list (19 categories including 'all')
export const CATEGORIES: Category[] = [
  { key: 'all', label: 'All Categories', icon: '🔍' },
  { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { key: 'moving', label: 'Moving', icon: '📦' },
  { key: 'heavy-lifting', label: 'Heavy Lifting', icon: '💪' },
  { key: 'assembly', label: 'Assembly', icon: '🔧' },
  { key: 'mounting', label: 'Mounting', icon: '🖼️' },
  { key: 'handyman', label: 'Handyman', icon: '🛠️' },
  { key: 'plumbing', label: 'Plumbing', icon: '🚿' },
  { key: 'electrical', label: 'Electrical', icon: '⚡' },
  { key: 'painting', label: 'Painting', icon: '🎨' },
  { key: 'gardening', label: 'Gardening', icon: '🌿' },
  { key: 'car-wash', label: 'Car Wash', icon: '🚗' },
  { key: 'delivery', label: 'Delivery', icon: '🚚' },
  { key: 'shopping', label: 'Shopping', icon: '🛒' },
  { key: 'pet-care', label: 'Pet Care', icon: '🐕' },
  { key: 'tutoring', label: 'Tutoring', icon: '📚' },
  { key: 'tech-help', label: 'Tech Help', icon: '💻' },
  { key: 'beauty', label: 'Beauty', icon: '💇' },
  { key: 'other', label: 'Other', icon: '📋' },
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
