import Constants from 'expo-constants';

interface EnvConfig {
  apiUrl: string;
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  googleMapsApiKey?: string;
}

export const env: EnvConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
};

// Validate required env vars
if (!env.apiUrl) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL is not set, using default: http://localhost:3000/api');
}

export default env;
