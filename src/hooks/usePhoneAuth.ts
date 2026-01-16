import { useState, useCallback } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  initRecaptcha,
  sendVerificationCode,
  verifyCode,
  getFirebaseIdToken,
  clearRecaptcha,
  firebaseSignOut
} from '../lib/firebase'
import { useAuthStore } from '../stores/authStore'
import apiClient from '../api/client'
import type { AuthResponse } from '../api/types'

export type PhoneAuthStep = 'phone' | 'otp' | 'register' | 'success'

interface UsePhoneAuthReturn {
  step: PhoneAuthStep
  phoneNumber: string
  isLoading: boolean
  error: string | null
  isNewUser: boolean
  setPhoneNumber: (phone: string) => void
  sendCode: (buttonId: string) => Promise<boolean>
  verifyOTP: (code: string) => Promise<boolean>
  completeRegistration: (username: string, email?: string) => Promise<boolean>
  reset: () => void
  goBack: () => void
}

// Map Firebase error codes to user-friendly messages
const getErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format. Please use +371 XXXXXXXX'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again tomorrow.'
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please check and try again.'
    case 'auth/code-expired':
      return 'Verification code expired. Please request a new one.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/captcha-check-failed':
      return 'Security check failed. Please try again.'
    default:
      return error.message || 'An error occurred. Please try again.'
  }
}

export const usePhoneAuth = (): UsePhoneAuthReturn => {
  const [step, setStep] = useState<PhoneAuthStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const { setAuth } = useAuthStore()

  // Send verification code
  const sendCode = useCallback(async (buttonId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Initialize reCAPTCHA
      initRecaptcha(buttonId)
      
      // Send SMS
      await sendVerificationCode(phoneNumber)
      
      setStep('otp')
      return true
    } catch (err) {
      const message = err instanceof FirebaseError 
        ? getErrorMessage(err) 
        : 'Failed to send verification code'
      setError(message)
      clearRecaptcha()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [phoneNumber])

  // Verify OTP code
  const verifyOTP = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Verify with Firebase
      await verifyCode(code)
      
      // Get Firebase ID token
      const idToken = await getFirebaseIdToken()
      if (!idToken) {
        throw new Error('Failed to get authentication token')
      }

      // Verify with our backend
      const response = await apiClient.post<AuthResponse>('/api/auth/phone/verify', {
        idToken,
        phoneNumber
      })

      const { access_token, user } = response.data

      // Check if this is a new user that needs to complete registration
      if (!user.username || user.username.startsWith('user_')) {
        setIsNewUser(true)
        setStep('register')
        // Store token temporarily for registration completion
        sessionStorage.setItem('temp_token', access_token)
        sessionStorage.setItem('temp_user', JSON.stringify(user))
        return true
      }

      // Existing user - complete login
      setAuth(user, access_token)
      setStep('success')
      return true
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Verification failed. Please try again.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [phoneNumber, setAuth])

  // Complete registration for new users
  const completeRegistration = useCallback(async (
    username: string,
    email?: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const tempToken = sessionStorage.getItem('temp_token')
      const tempUser = sessionStorage.getItem('temp_user')

      if (!tempToken || !tempUser) {
        throw new Error('Session expired. Please start over.')
      }

      // Update user profile
      const response = await apiClient.put<AuthResponse>(
        '/api/auth/complete-registration',
        { username, email },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      )

      const { access_token, user } = response.data

      // Clear temporary storage
      sessionStorage.removeItem('temp_token')
      sessionStorage.removeItem('temp_user')

      // Complete login
      setAuth(user, access_token)
      setStep('success')
      return true
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Registration failed. Please try again.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setAuth])

  // Reset the flow
  const reset = useCallback(() => {
    setStep('phone')
    setPhoneNumber('')
    setError(null)
    setIsNewUser(false)
    clearRecaptcha()
    firebaseSignOut()
    sessionStorage.removeItem('temp_token')
    sessionStorage.removeItem('temp_user')
  }, [])

  // Go back one step
  const goBack = useCallback(() => {
    setError(null)
    if (step === 'otp') {
      setStep('phone')
      clearRecaptcha()
    } else if (step === 'register') {
      // Can't go back from register - would need to re-verify
      reset()
    }
  }, [step, reset])

  return {
    step,
    phoneNumber,
    isLoading,
    error,
    isNewUser,
    setPhoneNumber,
    sendCode,
    verifyOTP,
    completeRegistration,
    reset,
    goBack
  }
}
