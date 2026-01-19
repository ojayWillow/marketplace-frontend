/**
 * Platform detection utilities
 * 
 * Used to detect the runtime environment and adjust features accordingly.
 * Firebase Phone Auth with SMS doesn't work in Expo Go due to native module requirements.
 */

/**
 * Check if the app is running in Expo Go environment
 * In Expo Go, certain native features like Firebase Phone Auth are not available
 */
export const isExpoGo = (): boolean => {
  // Check for Expo Go specific globals
  // In a web environment, this will always be false
  if (typeof window !== 'undefined') {
    // Check if running in React Native/Expo environment
    const isReactNative = typeof (window as any).ReactNativeWebView !== 'undefined'
    const hasExpoConstants = typeof (window as any).expo !== 'undefined'
    
    // In Expo Go, expo-constants exposes specific properties
    if (hasExpoConstants) {
      const expo = (window as any).expo
      // Expo Go has executionEnvironment set to 'storeClient'
      return expo?.modules?.ExpoConstants?.executionEnvironment === 'storeClient'
    }
    
    return isReactNative
  }
  return false
}

/**
 * Check if phone authentication is available
 * Phone auth requires native modules that aren't available in Expo Go
 */
export const isPhoneAuthAvailable = (): boolean => {
  // Phone auth is available in:
  // 1. Web browsers (using reCAPTCHA)
  // 2. Native builds (development builds or production)
  // 
  // Phone auth is NOT available in:
  // 1. Expo Go (managed workflow without native modules)
  
  // For now, we check if we're in a web environment
  // When Expo is properly set up, this can be extended
  const isWeb = typeof window !== 'undefined' && !isExpoGo()
  
  // Also check if Firebase is properly initialized
  // This helps during development when Firebase might not be configured
  const hasFirebaseConfig = !!(import.meta.env.VITE_FIREBASE_API_KEY)
  
  return isWeb && hasFirebaseConfig
}

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true
}

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true
}

/**
 * Get the current platform type
 */
export type PlatformType = 'web' | 'expo-go' | 'native'

export const getPlatformType = (): PlatformType => {
  if (isExpoGo()) {
    return 'expo-go'
  }
  
  if (typeof window !== 'undefined') {
    // Check for React Native WebView (native app)
    if ((window as any).ReactNativeWebView) {
      return 'native'
    }
    return 'web'
  }
  
  return 'web'
}
