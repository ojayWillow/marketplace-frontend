import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  MapPin,
  ArrowRight, 
  Phone,
  Loader2,
  ChevronDown,
  Shield,
  Star,
  Zap,
  MessageCircle
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../lib/firebase'
import type { ConfirmationResult } from '../lib/firebase'
import api from '../api/client'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user, setAuth } = useAuthStore()
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const mountedRef = useRef(true)

  // Redirect authenticated users with a brief loading screen
  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        navigate('/tasks', { replace: true })
      }, 1500) // Show loading for 1.5 seconds
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, navigate])

  // Initialize reCAPTCHA
  const initRecaptcha = useCallback(() => {
    if (!recaptchaContainerRef.current || !mountedRef.current) return
    if (recaptchaVerifierRef.current) {
      setRecaptchaReady(true)
      return
    }
    
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
        'expired-callback': () => {
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

  useEffect(() => {
    mountedRef.current = true
    const timer = setTimeout(() => initRecaptcha(), 100)
    
    return () => {
      mountedRef.current = false
      clearTimeout(timer)
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch (e) {}
        recaptchaVerifierRef.current = null
      }
    }
  }, [initRecaptcha])

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`
  }

  const getFullPhone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    return cleaned.startsWith('371') ? `+${cleaned}` : `+371${cleaned}`
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fullPhone = getFullPhone()
    if (fullPhone.length < 10) {
      setError(t('auth.invalidPhone', 'Please enter a valid phone number'))
      setLoading(false)
      return
    }

    try {
      if (!recaptchaVerifierRef.current) {
        initRecaptcha()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      if (!recaptchaVerifierRef.current) throw new Error('reCAPTCHA not ready')

      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current)
      setConfirmationResult(confirmation)
      setStep('code')
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      console.error('Send code error:', err)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('too-many-requests')) {
        setError(t('auth.tooManyRequests', 'Too many attempts. Try again later.'))
      } else if (msg.includes('invalid-phone-number')) {
        setError(t('auth.invalidPhone', 'Invalid phone number format.'))
      } else {
        setError(t('auth.sendCodeError', 'Failed to send code. Please try again.'))
      }
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch (e) {}
        recaptchaVerifierRef.current = null
        setRecaptchaReady(false)
      }
      setTimeout(() => initRecaptcha(), 500)
    } finally {
      setLoading(false)
    }
  }

  // Handle paste event for OTP (e.g., from SMS autofill or manual paste)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length > 0) {
      const newCode = [...verificationCode]
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || ''
      }
      setVerificationCode(newCode)
      
      // Auto-verify if we got full code
      if (pastedData.length === 6) {
        handleVerifyCode(pastedData)
      } else {
        // Focus last filled + 1
        const lastFilledIndex = Math.min(pastedData.length - 1, 5)
        codeInputRefs.current[lastFilledIndex + 1]?.focus()
      }
    }
  }

  // Handle input change with better mobile support
  const handleCodeInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const value = input.value.replace(/\D/g, '')
    
    // Handle multi-character input (SMS autofill often pastes full code)
    if (value.length > 1) {
      const newCode = [...verificationCode]
      
      // Distribute digits starting from current input position
      for (let i = 0; i < value.length && (index + i) < 6; i++) {
        newCode[index + i] = value[i]
      }
      
      setVerificationCode(newCode)
      
      // Auto-verify if complete
      const fullCode = newCode.join('')
      if (fullCode.length === 6 && newCode.every(d => d !== '')) {
        handleVerifyCode(fullCode)
      } else {
        // Focus next empty or last
        const nextEmpty = newCode.findIndex(d => d === '')
        codeInputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus()
      }
      return
    }
    
    // Single character input
    const digit = value.slice(-1)
    const newCode = [...verificationCode]
    newCode[index] = digit
    setVerificationCode(newCode)
    
    // Auto-advance to next input
    if (digit && index < 5) {
      // Use setTimeout to ensure state updates before focus
      setTimeout(() => {
        codeInputRefs.current[index + 1]?.focus()
      }, 0)
    }
    
    // Auto-verify when complete
    if (digit && newCode.every(d => d !== '')) {
      handleVerifyCode(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        // If current input is empty, go back and clear previous
        const newCode = [...verificationCode]
        newCode[index - 1] = ''
        setVerificationCode(newCode)
        codeInputRefs.current[index - 1]?.focus()
        e.preventDefault()
      } else if (verificationCode[index]) {
        // Clear current input
        const newCode = [...verificationCode]
        newCode[index] = ''
        setVerificationCode(newCode)
        e.preventDefault()
      }
    }
    
    // Handle left/right arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
      e.preventDefault()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  // Handle focus - select all text in input
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const handleVerifyCode = async (code: string) => {
    if (!confirmationResult || loading) return
    setError('')
    setLoading(true)

    try {
      const result = await confirmationResult.confirm(code)
      const idToken = await result.user.getIdToken()
      
      const response = await api.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: getFullPhone()
      })

      const { access_token, user: userData, is_new_user } = response.data

      if (access_token && userData) {
        // FIXED: Correct argument order (user, token) and correct field names
        setAuth(userData, access_token)
        
        // Check if new user needs to complete profile
        if (is_new_user || userData.username?.startsWith('user_')) {
          navigate('/complete-profile')
        } else {
          navigate('/tasks')
        }
      }
    } catch (err: unknown) {
      console.error('Verify error:', err)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('invalid-verification-code')) {
        setError(t('auth.invalidCode', 'Invalid code. Please try again.'))
      } else {
        setError(t('auth.verifyError', 'Verification failed. Please try again.'))
      }
      setVerificationCode(['', '', '', '', '', ''])
      codeInputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Get display name (first name or username)
  const getDisplayName = () => {
    if (!user) return ''
    if (user.first_name) return user.first_name
    if (user.username && !user.username.startsWith('user_')) return user.username
    return ''
  }

  // Logged in users see welcome loading screen
  if (isAuthenticated || showWelcome) {
    const displayName = getDisplayName()
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {displayName ? `Sveicināti, ${displayName}!` : 'Sveicināti!'} 👋
          </h1>
          <p className="text-gray-400">Meklējam iespējas 25km rādiusā no Rīga, Latvija</p>
        </div>
      </div>
    )
  }

  // OTP Input component for reuse
  const renderOTPInputs = () => (
    <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
      {verificationCode.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { codeInputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digit}
          onInput={(e) => handleCodeInput(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={handleFocus}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-[#0a0a0f] text-white rounded-lg border border-[#2a2a3a] focus:border-blue-500 focus:outline-none caret-transparent"
          maxLength={6}
          disabled={loading}
        />
      ))}
    </div>
  )

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-green-600/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
          {/* Mobile: Value Proposition FIRST */}
          <div className="lg:hidden mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
              <MapPin className="w-3 h-3" />
              Available in Latvia
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              Get help with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> everyday tasks</span>
            </h1>
            
            <p className="text-base text-gray-400 mb-6 leading-relaxed">
              Need someone to walk your dog, help you move, or fix something at home? 
              Connect with trusted locals who can help.
            </p>

            {/* Quick Stats - Mobile */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-white font-medium text-sm">Fast</div>
                <div className="text-gray-500 text-xs">Get offers in minutes</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-white font-medium text-sm">Verified</div>
                <div className="text-gray-500 text-xs">Phone-verified</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-white font-medium text-sm">Rated</div>
                <div className="text-gray-500 text-xs">Trusted reviews</div>
              </div>
            </div>
          </div>

          {/* Mobile: Login Card SECOND */}
          <div className="lg:hidden mb-8">
            <div ref={recaptchaContainerRef} id="recaptcha-container-home" />
            
            <div className="bg-[#1a1a24] rounded-2xl p-5 sm:p-6 border border-[#2a2a3a] shadow-2xl">
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Get Started</h2>
                <p className="text-gray-400 text-sm">Sign in with your phone number</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {step === 'phone' ? (
                <form onSubmit={handleSendCode}>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  
                  <div className="flex gap-2 mb-4">
                    <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] flex-shrink-0">
                      <span className="text-base sm:text-lg">🇱🇻</span>
                      <span className="text-gray-300 text-sm sm:text-base">+371</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      value={formatPhone(phoneNumber)}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="20 000 000"
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-[#0a0a0f] text-white rounded-xl border border-[#2a2a3a] focus:border-blue-500 focus:outline-none placeholder-gray-600 text-base sm:text-lg tracking-wide"
                      maxLength={11}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
                    className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : !recaptchaReady ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
                    ) : (
                      <>Continue <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#2a2a3a]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#1a1a24] text-gray-500">or</span>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="w-full py-3 border border-[#2a2a3a] hover:bg-[#0a0a0f] text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Sign in with email
                  </Link>
                </form>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    Enter the code sent to <span className="text-white">{getFullPhone()}</span>
                  </p>
                  
                  {renderOTPInputs()}

                  <button
                    onClick={() => handleVerifyCode(verificationCode.join(''))}
                    disabled={loading || verificationCode.some(d => d === '')}
                    className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify'}
                  </button>

                  <button
                    onClick={() => { setStep('phone'); setVerificationCode(['', '', '', '', '', '']); setError('') }}
                    className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm"
                  >
                    Change phone number
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-5">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-blue-400 hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
              </p>
            </div>

            {/* Browse as guest - Mobile */}
            <div className="text-center mt-4">
              <Link 
                to="/tasks" 
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 text-sm"
              >
                Just browsing? See available tasks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Desktop: Original Two Column Layout - omitted for brevity, same as before */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* ... rest of desktop layout unchanged ... */}
          </div>
        </div>
      </section>

      {/* ... rest of page sections unchanged ... */}
    </div>
  )
}
