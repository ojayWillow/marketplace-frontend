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
import { useAuthStore, apiClient as api } from '@marketplace/shared'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../lib/firebase'
import type { ConfirmationResult } from '../lib/firebase'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user, setAuth } = useAuthStore()
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [otpValue, setOtpValue] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [recaptchaLoading, setRecaptchaLoading] = useState(true)
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const otpInputRef = useRef<HTMLInputElement>(null)
  const initAttemptedRef = useRef(false)

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        navigate('/tasks', { replace: true })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, navigate])

  // Initialize reCAPTCHA once
  const initRecaptcha = useCallback(() => {
    if (initAttemptedRef.current && recaptchaVerifierRef.current) {
      return // Already initialized
    }
    
    const container = document.getElementById('recaptcha-container-main')
    if (!container) {
      console.log('reCAPTCHA container not found, retrying...')
      setTimeout(initRecaptcha, 200)
      return
    }
    
    // Clear any existing
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear() } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null
    }
    
    initAttemptedRef.current = true
    setRecaptchaLoading(true)
    
    try {
      console.log('Creating reCAPTCHA verifier...')
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, container, {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved!')
          setRecaptchaReady(true)
          setRecaptchaLoading(false)
          setError('')
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired')
          setRecaptchaReady(false)
          setError('Security check expired. Please verify again.')
        }
      })
      
      recaptchaVerifierRef.current.render().then(() => {
        console.log('reCAPTCHA rendered successfully')
        setRecaptchaLoading(false)
      }).catch((err) => {
        console.error('reCAPTCHA render error:', err)
        setError('Failed to load security check. Please refresh.')
        setRecaptchaLoading(false)
      })
    } catch (err) {
      console.error('reCAPTCHA init error:', err)
      initAttemptedRef.current = false
      setRecaptchaLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (step === 'phone') {
      const timer = setTimeout(initRecaptcha, 300)
      return () => clearTimeout(timer)
    }
  }, [initRecaptcha, step])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch (e) { /* ignore */ }
      }
    }
  }, [])

  // AUTO-SUBMIT when 6 digits entered
  useEffect(() => {
    if (otpValue.length === 6 && confirmationResult && !loading) {
      handleVerifyCode(otpValue)
    }
  }, [otpValue, confirmationResult, loading])

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

  // Send OTP via Firebase
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

    if (!recaptchaVerifierRef.current) {
      setError('Security check not loaded. Please refresh the page.')
      setLoading(false)
      return
    }
    
    if (!recaptchaReady) {
      setError('Please complete the security check first')
      setLoading(false)
      return
    }

    try {
      console.log('Sending verification code to:', fullPhone)
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current)
      console.log('Code sent successfully!')
      
      setConfirmationResult(confirmation)
      setStep('code')
      setOtpValue('')
      setTimeout(() => otpInputRef.current?.focus(), 100)
      
    } catch (err: unknown) {
      console.error('Send code error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      
      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes.')
      } else if (msg.includes('invalid-phone-number')) {
        setError('Invalid phone number format.')
      } else if (msg.includes('quota-exceeded')) {
        setError('SMS limit reached. Please try again later.')
      } else if (msg.includes('captcha-check-failed') || msg.includes('recaptcha')) {
        setError('Security check failed. Please refresh and try again.')
      } else {
        setError('Failed to send code. Please try again.')
      }
      
      // Reset for retry
      setRecaptchaReady(false)
      initAttemptedRef.current = false
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear() } catch (e) { /* ignore */ }
        recaptchaVerifierRef.current = null
      }
      setTimeout(initRecaptcha, 500)
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input - supports autofill
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtpValue(value)
  }

  const focusOtpInput = () => otpInputRef.current?.focus()

  // Verify OTP with Firebase then Backend
  const handleVerifyCode = async (code: string) => {
    if (!confirmationResult || loading || code.length !== 6) return
    setError('')
    setLoading(true)

    try {
      console.log('Verifying code...')
      const result = await confirmationResult.confirm(code)
      console.log('Firebase verification successful')
      
      const idToken = await result.user.getIdToken()
      console.log('Got Firebase ID token, calling backend...')
      
      const response = await api.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: getFullPhone()
      })

      const { access_token, user: userData, is_new_user } = response.data

      if (access_token && userData) {
        setAuth(userData, access_token)
        if (is_new_user || userData.username?.startsWith('user_')) {
          navigate('/complete-profile')
        } else {
          navigate('/tasks')
        }
      }
    } catch (err: unknown) {
      console.error('Verify error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      
      if (msg.includes('invalid-verification-code')) {
        setError('Wrong code. Please check and try again.')
      } else if (msg.includes('code-expired')) {
        setError('Code expired. Please request a new one.')
        resetToPhoneStep()
      } else {
        setError('Verification failed. Please try again.')
      }
      setOtpValue('')
      otpInputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Reset back to phone input
  const resetToPhoneStep = () => {
    setStep('phone')
    setOtpValue('')
    setError('')
    setConfirmationResult(null)
    setRecaptchaReady(false)
    setRecaptchaLoading(true)
    initAttemptedRef.current = false
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear() } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null
    }
    setTimeout(initRecaptcha, 300)
  }

  const getDisplayName = () => {
    if (!user) return ''
    if (user.first_name) return user.first_name
    if (user.username && !user.username.startsWith('user_')) return user.username
    return ''
  }

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

  // OTP Display component
  const renderOTPDisplay = () => {
    const digits = otpValue.split('')
    
    return (
      <div className="relative mb-4">
        <input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otpValue}
          onChange={handleOtpChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute opacity-0 w-full h-full top-0 left-0 z-10"
          maxLength={6}
          disabled={loading}
          style={{ caretColor: 'transparent' }}
        />
        
        <div className="flex justify-center gap-1.5 sm:gap-2 cursor-text" onClick={focusOtpInput}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-[#0a0a0f] text-white rounded-lg border transition-colors ${
                isFocused && index === digits.length ? 'border-blue-500' : digits[index] ? 'border-blue-500/50' : 'border-[#2a2a3a]'
              }`}
            >
              {digits[index] || ''}
              {isFocused && index === digits.length && <span className="animate-pulse text-blue-400">|</span>}
            </div>
          ))}
        </div>
        
        {otpValue.length === 6 && loading && (
          <p className="text-center text-blue-400 text-sm mt-2 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </p>
        )}
      </div>
    )
  }

  // Shared login card content
  const renderLoginCard = () => (
    <>
      <div className="text-center mb-5 lg:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 lg:mb-2">Get Started</h2>
        <p className="text-gray-400 text-sm lg:text-base">Sign in with your phone number</p>
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
              autoFocus
            />
          </div>

          {/* reCAPTCHA container - with explicit styling to ensure visibility */}
          <div className="mb-4">
            <div 
              id="recaptcha-container-main" 
              className="flex justify-center items-center"
              style={{ minHeight: '78px' }}
            ></div>
            {recaptchaLoading && !recaptchaReady && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm">Loading security check...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
            className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
            ) : !recaptchaReady ? (
              <>Complete security check above</>
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
            Enter the 6-digit code sent to <span className="text-white">{getFullPhone()}</span>
          </p>
          
          {renderOTPDisplay()}

          <button
            onClick={resetToPhoneStep}
            className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm"
          >
            ← Change phone number
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-5 lg:mt-6">
        By continuing, you agree to our{' '}
        <Link to="/terms" className="text-blue-400 hover:underline">Terms</Link> and{' '}
        <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
      </p>
    </>
  )

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-green-600/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
          {/* Mobile: Value Proposition */}
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

          {/* Mobile: Login Card - HIDDEN, only show desktop card */}
          <div className="lg:hidden mb-8">
            <div className="bg-[#1a1a24] rounded-2xl p-5 sm:p-6 border border-[#2a2a3a] shadow-2xl">
              {renderLoginCard()}
            </div>

            <div className="text-center mt-4">
              <Link 
                to="/tasks" 
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 text-sm"
              >
                Just browsing? See available tasks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Desktop: Two Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                <MapPin className="w-4 h-4" />
                Available in Latvia
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Get help with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> everyday tasks</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Need someone to walk your dog, help you move, or fix something at home? 
                Connect with trusted locals who can help — usually within hours.
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Fast</div>
                    <div className="text-gray-500 text-sm">Get offers in minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Verified</div>
                    <div className="text-gray-500 text-sm">Phone-verified users</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Rated</div>
                    <div className="text-gray-500 text-sm">Reviews you can trust</div>
                  </div>
                </div>
              </div>

              <Link 
                to="/tasks" 
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Just browsing? <span className="text-blue-400">See available tasks →</span>
              </Link>
            </div>

            {/* Desktop: Login Card */}
            <div className="lg:pl-8">
              <div className="bg-[#1a1a24] rounded-2xl p-6 md:p-8 border border-[#2a2a3a] shadow-2xl">
                {renderLoginCard()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">How it works</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Whether you need help or want to earn money — it's simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-16">
            <div className="bg-[#1a1a24]/50 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#2a2a3a]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-5 sm:mb-6">
                Need help?
              </div>
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm sm:text-base">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Post your task</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Describe what you need help with and set your budget</p>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm sm:text-base">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Get offers</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Local helpers will apply — review their profiles and ratings</p>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm sm:text-base">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Get it done</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Pick your helper, they complete the task, you pay them directly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a24]/50 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#2a2a3a]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-5 sm:mb-6">
                Want to earn?
              </div>
              
              <div className="space-y-5 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm sm:text-base">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Browse the map</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">See tasks posted near you in real-time on the map</p>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm sm:text-base">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Apply to tasks</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Found something you can help with? Send your offer</p>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm sm:text-base">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Earn money</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Complete tasks, build your reputation, and get paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Categories */}
      <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Popular tasks</h2>
            <p className="text-gray-400 text-base sm:text-lg">People in your area are getting help with...</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: '🐕', label: 'Pet Care', desc: 'Walking, sitting' },
              { icon: '📦', label: 'Moving', desc: 'Furniture, boxes' },
              { icon: '🧹', label: 'Cleaning', desc: 'Home, office' },
              { icon: '🚗', label: 'Delivery', desc: 'Pick up & drop' },
              { icon: '🔧', label: 'Repairs', desc: 'Handyman tasks' },
              { icon: '💻', label: 'Tech Help', desc: 'Setup, support' },
            ].map((cat, i) => (
              <Link 
                key={i}
                to="/tasks"
                className="bg-[#1a1a24]/50 hover:bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#3a3a4a] rounded-xl p-3 sm:p-4 text-center transition-all group"
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cat.icon}</div>
                <div className="text-white font-medium text-xs sm:text-sm group-hover:text-blue-400 transition-colors">{cat.label}</div>
                <div className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Built on trust</h2>
            <p className="text-gray-400 text-base sm:text-lg">Your safety and security come first</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Phone Verified</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Every user verifies their phone number — no anonymous accounts</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Ratings & Reviews</h3>
              <p className="text-gray-400 text-xs sm:text-sm">See real feedback from other users before you decide</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">In-App Chat</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Communicate directly and securely within the app</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
            Join your local community and start getting things done today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Sign up free <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-[#2a2a3a] hover:bg-[#1a1a24] text-white font-semibold rounded-xl transition-colors"
            >
              Browse tasks first
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
