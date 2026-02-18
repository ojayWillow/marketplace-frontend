export const languages = [
  { code: 'lv', label: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', label: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
];

export const themeOptions = [
  {
    value: 'light' as const,
    icon: '☀️',
    labelKey: 'settings.theme.light',
    labelDefault: 'Light',
    descKey: 'settings.theme.lightDesc',
    descDefault: 'Always use light mode',
  },
  {
    value: 'dark' as const,
    icon: '🌙',
    labelKey: 'settings.theme.dark',
    labelDefault: 'Dark',
    descKey: 'settings.theme.darkDesc',
    descDefault: 'Always use dark mode',
  },
  {
    value: 'system' as const,
    icon: '🖥️',
    labelKey: 'settings.theme.system',
    labelDefault: 'System',
    descKey: 'settings.theme.systemDesc',
    descDefault: 'Match your device settings',
  },
];

// All categories used across both tasks and offerings.
// Task-creation categories: pet-care, moving, shopping, cleaning, delivery,
//   outdoor, handyman, tutoring, tech-help, other
// Offering-specific categories: assembly, plumbing, electrical, painting,
//   care, tech, beauty, events
export const TASK_CATEGORIES = [
  'cleaning',
  'handyman',
  'delivery',
  'moving',
  'outdoor',
  'pet-care',
  'tutoring',
  'tech-help',
  'shopping',
  'assembly',
  'plumbing',
  'electrical',
  'painting',
  'care',
  'tech',
  'beauty',
  'events',
  'other',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'cleaning': '🧹',
  'handyman': '🔧',
  'delivery': '🚗',
  'moving': '📦',
  'outdoor': '🌿',
  'pet-care': '🐕',
  'tutoring': '📚',
  'tech-help': '💻',
  'shopping': '🛒',
  'assembly': '🪑',
  'plumbing': '🔩',
  'electrical': '⚡',
  'painting': '🎨',
  'care': '❤️',
  'tech': '🖥️',
  'beauty': '💇',
  'events': '🎉',
  'other': '📋',
};

export const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && !isStandalone;
};

export const isIOSPWA = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && isStandalone;
};
