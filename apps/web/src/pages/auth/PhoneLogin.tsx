import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, ArrowLeft, ArrowRight, Loader2, CheckCircle, User, Mail } from 'lucide-react'
import { usePhoneAuth } from '../../hooks/usePhoneAuth'
import { PhoneInput } from '../../components/auth/PhoneInput'
import { OTPInput } from '../../components/auth/OTPInput'

export const PhoneLogin = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
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
  } = usePhoneAuth()

  const [otpValue, setOtpValue] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Redirect on success
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        navigate('/')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [step, navigate])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 8) return
    await sendCode()
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length !== 6) return
    await verifyOTP(otpValue)
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')

    // Validate username
    if (!username.trim()) {
      setUsernameError(t('auth.usernameRequired', 'Username is required'))
      return
    }
    if (username.length < 3) {
      setUsernameError(t('auth.usernameTooShort', 'Username must be at least 3 characters'))
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(t('auth.usernameInvalid', 'Username can only contain letters, numbers, and underscores'))
      return
    }

    await completeRegistration(username, email || undefined)
  }

  // Auto-submit OTP when 6 digits entered
  useEffect(() => {
    if (otpValue.length === 6 && step === 'otp' && !isLoading) {
      verifyOTP(otpValue)
    }
  }, [otpValue, step, isLoading, verifyOTP])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 'register' 
              ? t('auth.completeProfile', 'Complete Your Profile')
              : t('auth.phoneLoginTitle', 'Sign in with Phone')
            }
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {step === 'phone' && t('auth.phoneLoginSubtitle', 'We\'ll send you a verification code')}
            {step === 'otp' && t('auth.otpSubtitle', 'Enter the code sent to {{phone}}', { phone: phoneNumber })}
            {step === 'register' && t('auth.registerSubtitle', 'Just a few more details to get started')}
            {step === 'success' && t('auth.successSubtitle', 'You\'re all set!')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendCode}>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                disabled={isLoading}
                error={error}
                autoFocus
              />

              <button
                type="submit"
                disabled={isLoading || !phoneNumber || phoneNumber.length < 8}
                className="w-full mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.sending', 'Sending...')}
                  </>
                ) : (
                  <>
                    {t('auth.sendCode', 'Send Verification Code')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                disabled={isLoading}
                error={error}
                autoFocus
              />

              <button
                type="submit"
                disabled={isLoading || otpValue.length !== 6}
                className="w-full mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.verifying', 'Verifying...')}
                  </>
                ) : (
                  <>
                    {t('auth.verify', 'Verify Code')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={goBack}
                disabled={isLoading}
                className="w-full mt-3 py-3 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.changeNumber', 'Change phone number')}
              </button>

              {/* Resend code */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t('auth.didntReceive', "Didn't receive the code?")}{' '}
                <button
                  type="button"
                  onClick={() => { setOtpValue(''); goBack() }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t('auth.resend', 'Resend')}
                </button>
              </p>
            </form>
          )}

          {/* Step 3: Complete Registration (new users) */}
          {step === 'register' && (
            <form onSubmit={handleCompleteRegistration}>
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline-block w-4 h-4 mr-2" />
                    {t('auth.username')} *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder={t('auth.usernamePlaceholder', 'e.g., john_doe')}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors
                      ${usernameError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:border-blue-500
                    `}
                    autoFocus
                  />
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{usernameError}</p>
                  )}
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline-block w-4 h-4 mr-2" />
                    {t('auth.email')} <span className="text-gray-400">({t('common.optional')})</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('auth.emailHint', 'Used for account recovery and notifications')}
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="w-full mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.creating', 'Creating account...')}
                  </>
                ) : (
                  <>
                    {t('auth.createAccount', 'Create Account')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.welcomeBack', 'Welcome!')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('auth.redirecting', 'Redirecting you to the app...')}
              </p>
            </div>
          )}
        </div>

        {/* Existing user - email login option */}
        {step === 'phone' && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.existingEmailUser', 'Already have an account with email?')}{' '}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('auth.signInWithEmail', 'Sign in with email')}
              </Link>
            </p>
          </div>
        )}

        {/* Terms notice */}
        {(step === 'phone' || step === 'register') && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('auth.termsNotice', 'By continuing, you agree to our')}{' '}
            <Link to="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {t('footer.terms')}
            </Link>{' '}
            {t('auth.and', 'and')}{' '}
            <Link to="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {t('footer.privacy')}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default PhoneLogin
