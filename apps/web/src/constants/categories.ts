// Re-export categories from shared package — single source of truth.
// This adapter maps shared's `.key` field to `.value` so existing
// web consumers don't need any changes.

import {
  CATEGORIES as SHARED_CATEGORIES,
  FORM_CATEGORIES,
  getCategoryByKey,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryDescription,
  LEGACY_CATEGORY_MAP,
  normalizeCategory,
} from '@marketplace/shared';

// Re-export types with web's `.value` field alias
export interface Category {
  value: string;
  label: string;
  icon: string;
  description: string;
}

// Map shared categories (key → value) for web consumers
export const CATEGORIES: Category[] = FORM_CATEGORIES.map(c => ({
  value: c.key,
  label: c.label,
  icon: c.icon,
  description: c.description,
}));

// For dropdown menus — includes "All" option
export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories', icon: '🔍' },
  ...CATEGORIES.map(c => ({ value: c.value, label: c.label, icon: c.icon }))
];

// Quick lookup by value (delegates to shared's getCategoryByKey)
export const getCategoryByValue = (value: string): Category | undefined => {
  const found = getCategoryByKey(value);
  if (!found) return undefined;
  return { value: found.key, label: found.label, icon: found.icon, description: found.description };
};

// Re-export helpers directly — they work with string keys, no mapping needed
export { getCategoryIcon, getCategoryLabel, getCategoryDescription };
export { LEGACY_CATEGORY_MAP, normalizeCategory };

// Group categories for organized display (web-specific grouping)
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
