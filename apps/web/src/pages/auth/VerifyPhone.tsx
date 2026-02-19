import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@marketplace/shared'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../lib/firebase'
import type { ConfirmationResult } from '../../lib/firebase'
import { apiClient as api } from '@marketplace/shared'
import { AxiosError } from 'axios'

type Step = 'phone' | 'code' | 'success'

export default function VerifyPhone() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser, logout } = useAuthStore()

  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const mountedRef = useRef(true)

  // Get the intended destination after verification
  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Initialize reCAPTCHA - memoized to prevent recreation
  const initRecaptcha = useCallback(() => {
    if (!recaptchaContainerRef.current || !mountedRef.current) return

    // Don't recreate if already exists and is valid
    if (recaptchaVerifierRef.current) {
      setRecaptchaReady(true)
      return
    }

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {
          console.debug('reCAPTCHA solved')
        },
        'expired-callback': () => {
          console.debug('reCAPTCHA expired')
          // Mark as not ready so it will be recreated on next use
          recaptchaVerifierRef.current = null
          setRecaptchaReady(false)
        }
      })
      setRecaptchaReady(true)
    } catch (err) {
      console.error('reCAPTCHA init error:', err)
      setRecaptchaReady(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initRecaptcha()
    }, 100)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
      // Clean up reCAPTCHA on unmount
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          // Ignore errors during cleanup
        }
        recaptchaVerifierRef.current = null
      }
    }
  }, [initRecaptcha])

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.startsWith('371')) return `+${cleaned}`
    return `+371${cleaned}`
  }

  // Send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fullPhone = getFullPhoneNumber()

    // Basic validation
    if (fullPhone.length < 10) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    try {
      // Ensure reCAPTCHA is ready
      if (!recaptchaVerifierRef.current) {
        initRecaptcha()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not ready')
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        recaptchaVerifierRef.current
      )

      setConfirmationResult(confirmation)
      setStep('code')
      setResendTimer(60)

      // Focus first code input
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      console.error('Send code error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code'

      if (errorMessage.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.')
      } else if (errorMessage.includes('invalid-phone-number')) {
        setError('Invalid phone number format.')
      } else if (errorMessage.includes('captcha-check-failed')) {
        setError('reCAPTCHA verification failed. Please refresh and try again.')
      } else {
        setError('Failed to send code. Please try again.')
      }

      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          // Ignore
        }
        recaptchaVerifierRef.current = null
        setRecaptchaReady(false)
      }
      // Reinitialize after a delay
      setTimeout(() => initRecaptcha(), 500)
    } finally {
      setLoading(false)
    }
  }

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1)
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setVerificationCode(newCode)
      handleVerifyCode(pastedData)
    }
  }

  // Verify the code and link phone to account
  const handleVerifyCode = async (code: string) => {
    if (!confirmationResult) {
      setError('Please request a new verification code.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Verify with Firebase
      const result = await confirmationResult.confirm(code)
      const idToken = await result.user.getIdToken()

      // Send to our backend to link phone to existing account
      const response = await api.post('/api/auth/phone/link', {
        idToken,
        phoneNumber: getFullPhoneNumber()
      })

      // Update local user state
      if (response.data.user) {
        updateUser(response.data.user)
      }

      setStep('success')

      // Redirect after success
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 2000)

    } catch (err: unknown) {
      console.error('Verify code error:', err)

      // Check for Axios error with response
      if (err instanceof AxiosError && err.response) {
        const status = err.response.status
        const errorData = err.response.data as { error?: string }

        if (status === 409) {
          // Phone already linked to another account
          setError('This phone number is already linked to another account. Please use a different phone number or log in with the existing account.')
          // Go back to phone input step
          setStep('phone')
          setVerificationCode(['', '', '', '', '', ''])
          return
        } else if (status === 401) {
          setError('Session expired. Please log in again.')
          logout()
          navigate('/login')
          return
        } else if (errorData?.error) {
          setError(errorData.error)
        } else {
          setError('Verification failed. Please try again.')
        }
      } else {
        // Firebase errors
        const errorMessage = err instanceof Error ? err.message : 'Verification failed'

        if (errorMessage.includes('invalid-verification-code')) {
          setError('Invalid code. Please check and try again.')
        } else if (errorMessage.includes('code-expired')) {
          setError('Code expired. Please request a new one.')
        } else {
          setError('Verification failed. Please try again.')
        }
      }

      // Clear the code inputs on error
      setVerificationCode(['', '', '', '', '', ''])
      codeInputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Resend code
  const handleResend = async () => {
    if (resendTimer > 0) return

    setError('')
    setLoading(true)
    setVerificationCode(['', '', '', '', '', ''])

    try {
      // Reinitialize reCAPTCHA if needed
      if (!recaptchaVerifierRef.current) {
        initRecaptcha()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not ready')
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        getFullPhoneNumber(),
        recaptchaVerifierRef.current
      )

      setConfirmationResult(confirmation)
      setResendTimer(60)
      codeInputRefs.current[0]?.focus()
    } catch (err) {
      console.error('Resend error:', err)
      setError('Failed to resend code. Please try again.')
      // Reset reCAPTCHA
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          // Ignore
        }
        recaptchaVerifierRef.current = null
        setRecaptchaReady(false)
      }
      setTimeout(() => initRecaptcha(), 500)
    } finally {
      setLoading(false)
    }
  }

  // Handle logout (if user wants to use different account)
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Phone</h1>
          <p className="text-gray-400">
            {step === 'phone' && 'Phone verification is required to use Tirgus'}
            {step === 'code' && `Enter the code sent to ${getFullPhoneNumber()}`}
            {step === 'success' && 'Your phone has been verified!'}
          </p>
          {user && (
            <p className="text-gray-500 text-sm mt-2">
              Logged in as <span className="text-gray-300">{user.email || user.username}</span>
            </p>
          )}
        </div>

        {/* reCAPTCHA container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container-verify" />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step: Enter Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-600">
                  <span className="text-lg">🇱🇻</span>
                  <span className="text-gray-300">+371</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="20 000 000"
                  className="flex-1 bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-lg tracking-wide"
                  maxLength={11}
                  autoFocus
                />
              </div>
              <p className="text-gray-500 text-sm mt-3">
                We'll send you a verification code via SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : !recaptchaReady ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Use a different account
            </button>
          </form>
        )}

        {/* Step: Enter Code */}
        {step === 'code' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Verification Code
              </label>

              {/* 6-digit code input */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeInputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    maxLength={1}
                    disabled={loading}
                  />
                ))}
              </div>

              <p className="text-gray-500 text-sm text-center mt-4">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            <button
              onClick={() => handleVerifyCode(verificationCode.join(''))}
              disabled={loading || verificationCode.some(d => d === '')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Phone'
              )}
            </button>

            {/* Back & Resend */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setStep('phone')
                  setVerificationCode(['', '', '', '', '', ''])
                  setError('')
                }}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change phone number
              </button>

              <p className="text-center text-gray-500 text-sm">
                Didn't receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Resend
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Phone Verified!</h2>
              <p className="text-gray-400">Redirecting you...</p>
            </div>
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
