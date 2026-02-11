import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle, User, ChevronDown } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'
import { usePhoneAuth } from '../LandingPage/hooks/usePhoneAuth'
import { useAuthStore } from '@marketplace/shared'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useLogin()
  const { user, isAuthenticated } = useAuthStore()

  // Firebase phone auth
  const {
    step,
    phoneNumber,
    loading: phoneLoading,
    error: phoneError,
    recaptchaReady,
    recaptchaContainerRef,
    otpValue,
    otpInputRef,
    setPhoneNumber,
    formatPhone,
    getFullPhone,
    handleSendCode,
    handleOtpChange,
    focusOtpInput,
    resetToPhoneStep,
  } = usePhoneAuth()

  // Email fallback
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(emailForm)
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">{t('auth.redirecting', 'Redirecting...')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* reCAPTCHA container for Firebase */}
        <div ref={recaptchaContainerRef} id="recaptcha-container-login" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Phone className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'code' ? t('auth.enterVerificationCode', 'Enter Verification Code') : t('auth.signInToKolab', 'Sign in to Kolab')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'phone' && t('auth.enterPhoneToStart', 'Enter your phone number to get started')}
            {step === 'code' && t('auth.enterCodeSentTo', 'Enter the code sent to {{phone}}', { phone: getFullPhone() })}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-7">

          {/* ===== STEP: Phone Number ===== */}
          {step === 'phone' && !showEmailLogin && (
            <>
              {phoneError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm text-center">{phoneError}</p>
                </div>
              )}

              <form onSubmit={handleSendCode}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  {t('auth.phoneNumber', 'Phone Number')}
                </label>

                <div className="flex gap-2 mb-4">
                  <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 flex-shrink-0">
                    <span className="text-base sm:text-lg">🇱🇻</span>
                    <span className="text-gray-700 text-sm sm:text-base">+371</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formatPhone(phoneNumber)}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="20 000 000"
                    className="flex-1 min-w-0 px-3 sm:px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-base sm:text-lg tracking-wide"
                    maxLength={11}
                    autoFocus
                    disabled={phoneLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
                  className="w-full mt-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {phoneLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.sendingCode', 'Sending code...')}</>
                  ) : !recaptchaReady ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('common.loading', 'Loading...')}</>
                  ) : (
                    <>{t('auth.sendCode', 'Send Verification Code')} <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              {/* Email fallback toggle */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {t('auth.emailFallbackPrompt', 'Have an email account? Sign in with email')}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          {/* ===== EMAIL LOGIN (collapsed fallback) ===== */}
          {step === 'phone' && showEmailLogin && (
            <>
              <button
                type="button"
                onClick={() => setShowEmailLogin(false)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToPhone', 'Back to phone sign in')}
              </button>

              {login.isError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm text-center">{t('auth.loginError')}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-4 h-4" /> {t('auth.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={emailForm.email}
                    onChange={e => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">{t('auth.password', 'Password')}</label>
                    <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">{t('auth.forgot', 'Forgot?')}</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={emailForm.password}
                      onChange={e => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full py-3.5 px-6 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {login.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.signingIn', 'Signing in...')}</>
                  ) : (
                    <>{t('auth.signInWithEmail', 'Sign in with Email')} <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ===== STEP: OTP Code ===== */}
          {step === 'code' && (
            <div>
              {phoneError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm text-center">{phoneError}</p>
                </div>
              )}

              {/* Hidden input + visual OTP boxes */}
              <div className="relative mb-4">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otpValue}
                  onChange={handleOtpChange}
                  className="absolute opacity-0 w-full h-full top-0 left-0 z-10"
                  maxLength={6}
                  disabled={phoneLoading}
                  autoFocus
                  style={{ caretColor: 'transparent' }}
                />

                <div className="flex justify-center gap-2 cursor-text" onClick={focusOtpInput}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`w-11 h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-2 transition-colors ${
                        otpValue[index]
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : index === otpValue.length
                            ? 'border-blue-400 bg-white'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {otpValue[index] || ''}
                      {!otpValue[index] && index === otpValue.length && (
                        <span className="animate-pulse text-blue-400">|</span>
                      )}
                    </div>
                  ))}
                </div>

                {otpValue.length === 6 && phoneLoading && (
                  <p className="text-center text-blue-600 text-sm mt-3 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.verifying', 'Verifying...')}
                  </p>
                )}
              </div>

              <button
                onClick={resetToPhoneStep}
                className="w-full mt-3 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> {t('auth.changeNumber', 'Change phone number')}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {t('auth.didntReceiveCode', "Didn't receive the code?")}{' '}
                <button type="button" onClick={resetToPhoneStep} className="text-blue-600 hover:underline font-medium">
                  {t('auth.resend', 'Resend')}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Terms notice */}
        {step === 'phone' && (
          <p className="mt-5 text-[11px] text-gray-400 text-center">
            {t('auth.termsNotice', 'By continuing, you agree to our')}{' '}
            <Link to="/terms" className="underline hover:text-gray-600">{t('auth.terms', 'Terms')}</Link>{' '}{t('common.and', 'and')}{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">{t('auth.privacyPolicy', 'Privacy Policy')}</Link>
          </p>
        )}
      </div>
    </div>
  )
}
