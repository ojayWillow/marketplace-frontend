import { FORM_CATEGORIES, getCategoryIcon } from '@marketplace/shared';

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

// Job alert category chips — sourced from shared package (single source of truth).
// FORM_CATEGORIES has the 15 canonical keys used by Create Task form.
// This ensures alert prefs use the same keys as tasks in the database.
export const TASK_CATEGORIES = FORM_CATEGORIES.map(c => c.key);

// Re-export shared icon lookup so JobAlertSettings doesn't need a direct import
export { getCategoryIcon };

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
