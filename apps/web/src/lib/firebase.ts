import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Re-export Firebase Auth types and functions for use in components
export { RecaptchaVerifier, signInWithPhoneNumber }
export type { ConfirmationResult }

// Set language to user's browser preference
auth.useDeviceLanguage()

// Store recaptcha verifier globally
let recaptchaVerifier: RecaptchaVerifier | null = null
let confirmationResult: ConfirmationResult | null = null

/**
 * Initialize invisible reCAPTCHA verifier
 * Must be called before sending SMS
 */
export const initRecaptcha = (buttonId: string): RecaptchaVerifier => {
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with sending SMS
      console.debug('reCAPTCHA verified')
    },
    'expired-callback': () => {
      // Reset reCAPTCHA if expired
      console.debug('reCAPTCHA expired')
    }
  })

  return recaptchaVerifier
}

/**
 * Send SMS verification code to phone number
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<ConfirmationResult> => {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized. Call initRecaptcha first.')
  }

  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    return confirmationResult
  } catch (error) {
    // Reset reCAPTCHA on error
    recaptchaVerifier.clear()
    recaptchaVerifier = null
    throw error
  }
}

/**
 * Verify the SMS code entered by user
 */
export const verifyCode = async (code: string) => {
  if (!confirmationResult) {
    throw new Error('No verification in progress. Send code first.')
  }

  const result = await confirmationResult.confirm(code)
  return result.user
}

/**
 * Get Firebase ID token for backend verification
 */
export const getFirebaseIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

/**
 * Sign out from Firebase
 */
export const firebaseSignOut = async () => {
  await auth.signOut()
  confirmationResult = null
}

/**
 * Clear reCAPTCHA verifier (call on component unmount)
 */
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
}

export default app
