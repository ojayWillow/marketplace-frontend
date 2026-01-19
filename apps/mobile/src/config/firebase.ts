import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import Constants from 'expo-constants';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let authInitialized = false;

// Lazy initialization - only initialize when actually needed
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    if (getApps().length === 0) {
      console.log('Initializing Firebase app...');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Getting existing Firebase app...');
      app = getApp();
    }
  }
  return app;
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  if (!auth || !authInitialized) {
    const firebaseApp = getFirebaseApp();
    console.log('Getting Firebase auth...');
    auth = getAuth(firebaseApp);
    authInitialized = true;
  }
  return auth;
};
