// Skills mapped to each category
// Users can select multiple skills from categories they work in

export interface Skill {
  key: string;
  label: string;
  category: string;
}

// Skills organized by category
export const CATEGORY_SKILLS: Record<string, Skill[]> = {
  cleaning: [
    { key: 'residential-cleaning', label: 'Residential Cleaning', category: 'cleaning' },
    { key: 'commercial-cleaning', label: 'Commercial Cleaning', category: 'cleaning' },
    { key: 'deep-cleaning', label: 'Deep Cleaning', category: 'cleaning' },
    { key: 'window-cleaning', label: 'Window Cleaning', category: 'cleaning' },
    { key: 'carpet-cleaning', label: 'Carpet Cleaning', category: 'cleaning' },
    { key: 'post-construction-cleaning', label: 'Post-Construction Cleaning', category: 'cleaning' },
  ],
  moving: [
    { key: 'furniture-moving', label: 'Furniture Moving', category: 'moving' },
    { key: 'packing', label: 'Packing', category: 'moving' },
    { key: 'loading-unloading', label: 'Loading/Unloading', category: 'moving' },
    { key: 'heavy-items', label: 'Heavy Items', category: 'moving' },
    { key: 'piano-moving', label: 'Piano Moving', category: 'moving' },
    { key: 'office-relocation', label: 'Office Relocation', category: 'moving' },
  ],
  'heavy-lifting': [
    { key: 'appliance-moving', label: 'Appliance Moving', category: 'heavy-lifting' },
    { key: 'equipment-moving', label: 'Equipment Moving', category: 'heavy-lifting' },
    { key: 'safe-moving', label: 'Safe Moving', category: 'heavy-lifting' },
    { key: 'machinery-moving', label: 'Machinery Moving', category: 'heavy-lifting' },
  ],
  assembly: [
    { key: 'furniture-assembly', label: 'Furniture Assembly', category: 'assembly' },
    { key: 'ikea-assembly', label: 'IKEA Assembly', category: 'assembly' },
    { key: 'equipment-assembly', label: 'Equipment Assembly', category: 'assembly' },
    { key: 'gym-equipment', label: 'Gym Equipment Assembly', category: 'assembly' },
    { key: 'playground-equipment', label: 'Playground Equipment', category: 'assembly' },
  ],
  mounting: [
    { key: 'tv-mounting', label: 'TV Mounting', category: 'mounting' },
    { key: 'shelf-mounting', label: 'Shelf Mounting', category: 'mounting' },
    { key: 'picture-hanging', label: 'Picture Hanging', category: 'mounting' },
    { key: 'mirror-mounting', label: 'Mirror Mounting', category: 'mounting' },
    { key: 'curtain-installation', label: 'Curtain Installation', category: 'mounting' },
  ],
  handyman: [
    { key: 'general-repairs', label: 'General Repairs', category: 'handyman' },
    { key: 'door-repair', label: 'Door Repair', category: 'handyman' },
    { key: 'drywall-repair', label: 'Drywall Repair', category: 'handyman' },
    { key: 'tile-repair', label: 'Tile Repair', category: 'handyman' },
    { key: 'deck-repair', label: 'Deck Repair', category: 'handyman' },
    { key: 'fence-repair', label: 'Fence Repair', category: 'handyman' },
  ],
  plumbing: [
    { key: 'leak-repair', label: 'Leak Repair', category: 'plumbing' },
    { key: 'pipe-installation', label: 'Pipe Installation', category: 'plumbing' },
    { key: 'drain-cleaning', label: 'Drain Cleaning', category: 'plumbing' },
    { key: 'fixture-installation', label: 'Fixture Installation', category: 'plumbing' },
    { key: 'water-heater', label: 'Water Heater Service', category: 'plumbing' },
    { key: 'emergency-plumbing', label: 'Emergency Plumbing', category: 'plumbing' },
  ],
  electrical: [
    { key: 'wiring', label: 'Wiring', category: 'electrical' },
    { key: 'lighting-installation', label: 'Lighting Installation', category: 'electrical' },
    { key: 'circuit-repair', label: 'Circuit Repair', category: 'electrical' },
    { key: 'outlet-installation', label: 'Outlet Installation', category: 'electrical' },
    { key: 'safety-inspection', label: 'Safety Inspection', category: 'electrical' },
    { key: 'panel-upgrade', label: 'Panel Upgrade', category: 'electrical' },
  ],
  painting: [
    { key: 'interior-painting', label: 'Interior Painting', category: 'painting' },
    { key: 'exterior-painting', label: 'Exterior Painting', category: 'painting' },
    { key: 'wallpaper-installation', label: 'Wallpaper Installation', category: 'painting' },
    { key: 'cabinet-painting', label: 'Cabinet Painting', category: 'painting' },
    { key: 'deck-staining', label: 'Deck Staining', category: 'painting' },
    { key: 'pressure-washing', label: 'Pressure Washing', category: 'painting' },
  ],
  gardening: [
    { key: 'lawn-mowing', label: 'Lawn Mowing', category: 'gardening' },
    { key: 'hedge-trimming', label: 'Hedge Trimming', category: 'gardening' },
    { key: 'tree-pruning', label: 'Tree Pruning', category: 'gardening' },
    { key: 'landscaping', label: 'Landscaping', category: 'gardening' },
    { key: 'garden-design', label: 'Garden Design', category: 'gardening' },
    { key: 'weed-removal', label: 'Weed Removal', category: 'gardening' },
  ],
  'car-wash': [
    { key: 'exterior-wash', label: 'Exterior Wash', category: 'car-wash' },
    { key: 'interior-detailing', label: 'Interior Detailing', category: 'car-wash' },
    { key: 'full-detailing', label: 'Full Detailing', category: 'car-wash' },
    { key: 'waxing-polishing', label: 'Waxing & Polishing', category: 'car-wash' },
    { key: 'headlight-restoration', label: 'Headlight Restoration', category: 'car-wash' },
  ],
  delivery: [
    { key: 'food-delivery', label: 'Food Delivery', category: 'delivery' },
    { key: 'package-delivery', label: 'Package Delivery', category: 'delivery' },
    { key: 'grocery-delivery', label: 'Grocery Delivery', category: 'delivery' },
    { key: 'courier-service', label: 'Courier Service', category: 'delivery' },
    { key: 'same-day-delivery', label: 'Same-Day Delivery', category: 'delivery' },
  ],
  shopping: [
    { key: 'grocery-shopping', label: 'Grocery Shopping', category: 'shopping' },
    { key: 'personal-shopping', label: 'Personal Shopping', category: 'shopping' },
    { key: 'gift-shopping', label: 'Gift Shopping', category: 'shopping' },
    { key: 'errands', label: 'Errands', category: 'shopping' },
  ],
  'pet-care': [
    { key: 'dog-walking', label: 'Dog Walking', category: 'pet-care' },
    { key: 'pet-sitting', label: 'Pet Sitting', category: 'pet-care' },
    { key: 'pet-grooming', label: 'Pet Grooming', category: 'pet-care' },
    { key: 'pet-training', label: 'Pet Training', category: 'pet-care' },
    { key: 'pet-transportation', label: 'Pet Transportation', category: 'pet-care' },
  ],
  tutoring: [
    { key: 'math-tutoring', label: 'Math Tutoring', category: 'tutoring' },
    { key: 'language-tutoring', label: 'Language Tutoring', category: 'tutoring' },
    { key: 'science-tutoring', label: 'Science Tutoring', category: 'tutoring' },
    { key: 'music-lessons', label: 'Music Lessons', category: 'tutoring' },
    { key: 'test-prep', label: 'Test Preparation', category: 'tutoring' },
    { key: 'homework-help', label: 'Homework Help', category: 'tutoring' },
  ],
  'tech-help': [
    { key: 'computer-repair', label: 'Computer Repair', category: 'tech-help' },
    { key: 'phone-repair', label: 'Phone Repair', category: 'tech-help' },
    { key: 'software-installation', label: 'Software Installation', category: 'tech-help' },
    { key: 'network-setup', label: 'Network Setup', category: 'tech-help' },
    { key: 'smart-home-setup', label: 'Smart Home Setup', category: 'tech-help' },
    { key: 'data-recovery', label: 'Data Recovery', category: 'tech-help' },
  ],
  beauty: [
    { key: 'haircut', label: 'Haircut', category: 'beauty' },
    { key: 'hair-styling', label: 'Hair Styling', category: 'beauty' },
    { key: 'manicure-pedicure', label: 'Manicure/Pedicure', category: 'beauty' },
    { key: 'makeup', label: 'Makeup', category: 'beauty' },
    { key: 'massage', label: 'Massage', category: 'beauty' },
    { key: 'skincare', label: 'Skincare', category: 'beauty' },
  ],
  hospitality: [
    { key: 'customer-service', label: 'Customer Service', category: 'hospitality' },
    { key: 'bartending', label: 'Bartending', category: 'hospitality' },
    { key: 'waiting-tables', label: 'Waiting Tables', category: 'hospitality' },
    { key: 'hotel-management', label: 'Hotel Management', category: 'hospitality' },
    { key: 'event-catering', label: 'Event Catering', category: 'hospitality' },
    { key: 'barista', label: 'Barista', category: 'hospitality' },
    { key: 'cooking', label: 'Cooking', category: 'hospitality' },
    { key: 'event-planning', label: 'Event Planning', category: 'hospitality' },
  ],
  construction: [
    { key: 'carpentry', label: 'Carpentry', category: 'construction' },
    { key: 'masonry', label: 'Masonry', category: 'construction' },
    { key: 'roofing', label: 'Roofing', category: 'construction' },
    { key: 'drywall', label: 'Drywall', category: 'construction' },
    { key: 'concrete-work', label: 'Concrete Work', category: 'construction' },
    { key: 'welding', label: 'Welding', category: 'construction' },
    { key: 'demolition', label: 'Demolition', category: 'construction' },
    { key: 'framing', label: 'Framing', category: 'construction' },
    { key: 'flooring', label: 'Flooring', category: 'construction' },
    { key: 'tile-work', label: 'Tile Work', category: 'construction' },
  ],
  other: [
    { key: 'general-help', label: 'General Help', category: 'other' },
    { key: 'odd-jobs', label: 'Odd Jobs', category: 'other' },
  ],
};

// Get all skills as flat array
export const ALL_SKILLS: Skill[] = Object.values(CATEGORY_SKILLS).flat();

// Get skills for a specific category
export const getSkillsByCategory = (category: string): Skill[] => {
  return CATEGORY_SKILLS[category] || [];
};

// Get skill by key
export const getSkillByKey = (key: string): Skill | undefined => {
  return ALL_SKILLS.find(s => s.key === key);
};

// Get skill label by key
export const getSkillLabel = (key: string): string => {
  return getSkillByKey(key)?.label || key;
};

// Get multiple skills by keys
export const getSkillsByKeys = (keys: string[]): Skill[] => {
  return keys.map(key => getSkillByKey(key)).filter((s): s is Skill => s !== undefined);
};
