// Shared categories for Jobs and Offerings
// This ensures both sides use the same categories for matching

export interface Category {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  // Home & Living
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, organizing' },
  { value: 'moving', label: 'Moving', icon: '📦', description: 'Help with moving, lifting, transporting' },
  { value: 'assembly', label: 'Furniture Assembly', icon: '🔧', description: 'IKEA assembly, furniture building' },
  { value: 'repair', label: 'Home Repair', icon: '🛠️', description: 'Fixing things around the house' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚿', description: 'Pipes, faucets, drains, water issues' },
  { value: 'electrical', label: 'Electrical', icon: '⚡', description: 'Electrical work, lighting, outlets' },
  { value: 'painting', label: 'Painting', icon: '🎨', description: 'Wall painting, touch-ups, decorating' },
  
  // Outdoor
  { value: 'outdoor', label: 'Gardening & Outdoor', icon: '🌿', description: 'Lawn care, gardening, yard work' },
  { value: 'car-wash', label: 'Car Wash', icon: '🚗', description: 'Car washing, detailing, cleaning' },
  { value: 'snow-removal', label: 'Snow Removal', icon: '❄️', description: 'Snow shoveling, winter cleanup' },
  
  // Care Services
  { value: 'pet-care', label: 'Pet Care', icon: '🐕', description: 'Dog walking, pet sitting, feeding' },
  { value: 'babysitting', label: 'Babysitting', icon: '👶', description: 'Childcare, babysitting, nanny services' },
  { value: 'elderly-care', label: 'Elderly Care', icon: '👴', description: 'Companionship, assistance, errands for seniors' },
  
  // Errands & Delivery
  { value: 'delivery', label: 'Delivery', icon: '🚚', description: 'Pick up and deliver items' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', description: 'Grocery shopping, errands, buying items' },
  { value: 'errands', label: 'Errands', icon: '🏃', description: 'General errands, waiting in line, misc tasks' },
  
  // Professional Services
  { value: 'tutoring', label: 'Tutoring', icon: '📚', description: 'Teaching, homework help, lessons' },
  { value: 'tech-help', label: 'Tech Help', icon: '💻', description: 'Computer help, phone setup, tech support' },
  { value: 'photography', label: 'Photography', icon: '📷', description: 'Photo shoots, events, portraits' },
  { value: 'translation', label: 'Translation', icon: '🌐', description: 'Language translation, interpretation' },
  
  // Events & Entertainment
  { value: 'events', label: 'Event Help', icon: '🎉', description: 'Party setup, event assistance, catering help' },
  { value: 'music', label: 'Music & DJ', icon: '🎵', description: 'Live music, DJ services, entertainment' },
  
  // Health & Wellness
  { value: 'fitness', label: 'Fitness & Training', icon: '💪', description: 'Personal training, workout buddy' },
  { value: 'beauty', label: 'Beauty & Styling', icon: '💇', description: 'Hair, makeup, styling services' },
  
  // Other
  { value: 'other', label: 'Other', icon: '💼', description: 'Something else not listed above' },
];

// For dropdown menus - includes "All" option (label does NOT include icon, render separately)
export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories', icon: '📋' },
  ...CATEGORIES.map(c => ({ value: c.value, label: c.label, icon: c.icon }))
];

// Quick lookup by value
export const getCategoryByValue = (value: string): Category | undefined => {
  return CATEGORIES.find(c => c.value === value);
};

// Get icon for a category
export const getCategoryIcon = (value: string): string => {
  return getCategoryByValue(value)?.icon || '💼';
};

// Get label for a category
export const getCategoryLabel = (value: string): string => {
  return getCategoryByValue(value)?.label || value;
};

// Group categories for organized display
export const CATEGORY_GROUPS = [
  {
    name: 'Home & Living',
    categories: ['cleaning', 'moving', 'assembly', 'repair', 'plumbing', 'electrical', 'painting']
  },
  {
    name: 'Outdoor',
    categories: ['outdoor', 'car-wash', 'snow-removal']
  },
  {
    name: 'Care Services',
    categories: ['pet-care', 'babysitting', 'elderly-care']
  },
  {
    name: 'Errands & Delivery',
    categories: ['delivery', 'shopping', 'errands']
  },
  {
    name: 'Professional Services',
    categories: ['tutoring', 'tech-help', 'photography', 'translation']
  },
  {
    name: 'Events & Entertainment',
    categories: ['events', 'music']
  },
  {
    name: 'Health & Wellness',
    categories: ['fitness', 'beauty']
  },
  {
    name: 'Other',
    categories: ['other']
  }
];
