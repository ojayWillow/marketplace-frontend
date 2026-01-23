// Mobile-specific auth store using SecureStore
// This provides secure storage for auth tokens on mobile devices

import { createAuthStore } from '@marketplace/shared/src/stores/authStore';
import { mobileStorage } from './mobileStorage';

// Create auth store with mobile-specific secure storage
export const useAuthStore = createAuthStore(mobileStorage);
