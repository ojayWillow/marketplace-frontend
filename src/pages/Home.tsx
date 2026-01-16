import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Handshake, 
  ArrowRight, 
  Check,
  Phone,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuthStore } from '../stores/authStore'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../lib/firebase'
import type { ConfirmationResult } from '../lib/firebase'
import api from '../api/client'

const benefits = [
  'home.benefit1',
  'home.benefit2', 
  'home.benefit3',
]

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { isAuthenticated, setAuth } = useAuthStore()
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const mountedRef = useRef(true)

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

  // Handle redirects
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tasks', { replace: true })
    } else if (isMobile) {
      navigate('/tasks', { replace: true })
    }
  }, [isAuthenticated, isMobile, navigate])

  // Initialize reCAPTCHA on mount
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

  // Format phone for display
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

  // Send verification code
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
      // Reset reCAPTCHA
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

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1)
    setVerificationCode(newCode)
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus()
    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  // Verify code
  const handleVerifyCode = async (code: string) => {
    if (!confirmationResult) return
    setError('')
    setLoading(true)

    try {
      const result = await confirmationResult.confirm(code)
      const idToken = await result.user.getIdToken()
      
      const response = await api.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: getFullPhone()
      })

      if (response.data.token && response.data.user) {
        setAuth(response.data.token, response.data.user)
        
        // Check if new user needs to complete profile
        if (response.data.isNewUser || response.data.user.username?.startsWith('user_')) {
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

  // Show nothing while redirecting
  if (isAuthenticated || isMobile) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('common.quickHelp', 'Quick Help')}
            </h1>
            <p className="text-gray-400">
              {t('home.tagline', 'Find help nearby in minutes')}
            </p>
          </div>

          {/* reCAPTCHA container */}
          <div ref={recaptchaContainerRef} id="recaptcha-container-home" />

          {/* Phone Login Card */}
          <div className="bg-[#1a1a24] rounded-2xl p-6 border border-[#2a2a3a] shadow-xl">
            
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendCode}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Phone className="w-4 h-4" />
                  {t('auth.phone', 'Phone')}
                </label>
                
                <div className="flex gap-2 mb-4">
                  {/* Country Code */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a]">
                    <span className="text-lg">🇱🇻</span>
                    <span className="text-gray-300">+371</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                  
                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={formatPhone(phoneNumber)}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="20 000 000"
                    className="flex-1 px-4 py-3 bg-[#0a0a0f] text-white rounded-xl border border-[#2a2a3a] focus:border-blue-500 focus:outline-none placeholder-gray-600 text-lg tracking-wide"
                    maxLength={11}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.sending', 'Sending...')}</>
                  ) : !recaptchaReady ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('common.loading', 'Loading...')}</>
                  ) : (
                    <>{t('auth.sendCode', 'Send Verification Code')} <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2a2a3a]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1a1a24] text-gray-500">{t('auth.orContinueWith', 'or continue with')}</span>
                  </div>
                </div>

                {/* Email Login Link */}
                <Link
                  to="/login"
                  className="w-full py-3 border border-[#2a2a3a] hover:bg-[#0a0a0f] text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {t('auth.useEmail', 'Use email instead')}
                </Link>
              </form>
            ) : (
              /* Code Input Step */
              <div>
                <p className="text-gray-400 text-sm text-center mb-4">
                  {t('auth.codeSentTo', 'Enter the code sent to')} <span className="text-white">{getFullPhone()}</span>
                </p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { codeInputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-[#0a0a0f] text-white rounded-lg border border-[#2a2a3a] focus:border-blue-500 focus:outline-none"
                      maxLength={1}
                      disabled={loading}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyCode(verificationCode.join(''))}
                  disabled={loading || verificationCode.some(d => d === '')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.verifying', 'Verifying...')}</>
                  ) : (
                    t('auth.verify', 'Verify')
                  )}
                </button>

                <button
                  onClick={() => { setStep('phone'); setVerificationCode(['', '', '', '', '', '']); setError('') }}
                  className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm"
                >
                  {t('auth.changeNumber', 'Change phone number')}
                </button>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-8 space-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-400">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{t(benefit)}</span>
              </div>
            ))}
          </div>

          {/* Browse as Guest */}
          <div className="mt-8 text-center">
            <Link 
              to="/tasks" 
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              {t('home.browseAsGuest', 'Browse as guest')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-gray-600 text-sm border-t border-[#1a1a24]">
        <p>
          © {new Date().getFullYear()} {t('common.appName')} · {' '}
          <Link to="/terms" className="hover:text-gray-400">{t('footer.terms')}</Link> · {' '}
          <Link to="/privacy" className="hover:text-gray-400">{t('footer.privacy')}</Link>
        </p>
      </footer>
    </div>
  )
}
