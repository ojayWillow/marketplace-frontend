// API exports
export * from './api';

// Types - export only non-conflicting types from root types
// (API-related types are already exported from ./api)
export type { Category } from './types';

// Store exports
export { useAuthStore } from './stores/authStore';
export { useFavoritesStore } from './stores/favoritesStore';
export { useMatchingStore } from './stores/matchingStore';
export { useToastStore } from './stores/toastStore';

// i18n exports
export { default as i18n } from './i18n';
