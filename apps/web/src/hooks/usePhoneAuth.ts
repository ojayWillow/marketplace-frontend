import { useState, useCallback } from 'react'
import { useAuthStore } from '@marketplace/shared'
import { apiClient } from '@marketplace/shared'
import type { AuthResponse } from '@marketplace/shared'

export type PhoneAuthStep = 'phone' | 'otp' | 'register' | 'success'

interface PhoneVerifyResponse extends AuthResponse {
  is_new_user: boolean
}

interface UsePhoneAuthReturn {
  step: PhoneAuthStep
  phoneNumber: string
  isLoading: boolean
  error: string | null
  isNewUser: boolean
  setPhoneNumber: (phone: string) => void
  sendCode: () => Promise<boolean>
  verifyOTP: (code: string) => Promise<boolean>
  completeRegistration: (username: string, email?: string) => Promise<boolean>
  reset: () => void
  goBack: () => void
}

// Map backend error messages to user-friendly messages
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } }
    const backendError = axiosError.response?.data?.error
    if (backendError) {
      return backendError
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An error occurred. Please try again.'
}

export const usePhoneAuth = (): UsePhoneAuthReturn => {
  const [step, setStep] = useState<PhoneAuthStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const { setAuth } = useAuthStore()

  // Send verification code via Vonage
  const sendCode = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.post('/api/auth/phone/send-otp', {
        phoneNumber: phoneNumber
      })
      
      setStep('otp')
      return true
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [phoneNumber])

  // Verify OTP code via Vonage
  const verifyOTP = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<PhoneVerifyResponse>('/api/auth/phone/verify-otp', {
        phoneNumber: phoneNumber,
        code: code
      })

      const { access_token, user, is_new_user } = response.data

      // Check if this is a new user that needs to complete registration
      if (is_new_user) {
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
      const message = getErrorMessage(err)
      setError(message)
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
      const message = getErrorMessage(err)
      setError(message)
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
    sessionStorage.removeItem('temp_token')
    sessionStorage.removeItem('temp_user')
  }, [])

  // Go back one step
  const goBack = useCallback(() => {
    setError(null)
    if (step === 'otp') {
      setStep('phone')
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
