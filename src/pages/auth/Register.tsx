import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Mail, Eye, EyeOff, ArrowRight, Loader2, Phone, AlertCircle } from 'lucide-react'
import { useRegister } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import { isPhoneAuthAvailable } from '../../lib/platform'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const register = useRegister()
  const { user, isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Check if phone auth is available
  const phoneAuthEnabled = isPhoneAuthAvailable()

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      errors.username = t('auth.usernameRequired', 'Username is required')
    } else if (formData.username.length < 3) {
      errors.username = t('auth.usernameTooShort', 'Username must be at least 3 characters')
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = t('auth.usernameInvalid', 'Username can only contain letters, numbers, and underscores')
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired', 'Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid', 'Please enter a valid email address')
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.passwordRequired', 'Password is required')
    } else if (formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort', 'Password must be at least 6 characters')
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch', 'Passwords do not match')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    register.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // For username, automatically format
    const processedValue = name === 'username' 
      ? value.toLowerCase().replace(/[^a-z0-9_]/g, '')
      : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Don't render the form if already authenticated (will redirect)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('auth.registerSubtitle', 'Join Tirgus today')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Phone Registration Option - Only show if available */}
          {phoneAuthEnabled && (
            <>
              <Link
                to="/phone-login"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-6"
              >
                <Phone className="w-5 h-5" />
                {t('auth.registerWithPhone', 'Register with Phone')}
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Link>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                    {t('auth.orContinueWith', 'or continue with email')}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Info banner when phone auth is not available */}
          {!phoneAuthEnabled && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    {t('auth.emailRegistration', 'Email Registration')}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    {t('auth.phoneRegUnavailable', 'Phone registration is available in the production app.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {register.isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {t('auth.registerError', 'Registration failed. Please try again.')}
              </p>
            </div>
          )}

          {/* Email Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4" />
                {t('auth.username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('auth.usernamePlaceholder', 'e.g., john_doe')}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors
                  ${validationErrors.username ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:outline-none focus:border-blue-500
                  placeholder-gray-400 dark:placeholder-gray-500`}
                autoComplete="username"
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors
                  ${validationErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:outline-none focus:border-blue-500
                  placeholder-gray-400 dark:placeholder-gray-500`}
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors pr-12
                    ${validationErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:border-blue-500
                    placeholder-gray-400 dark:placeholder-gray-500`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors pr-12
                    ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:border-blue-500
                    placeholder-gray-400 dark:placeholder-gray-500`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={register.isPending}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {register.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.creating', 'Creating account...')}
                </>
              ) : (
                <>
                  {t('auth.registerButton')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms notice */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('auth.termsNotice', 'By continuing, you agree to our')}{' '}
            <Link to="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {t('footer.terms', 'Terms of Service')}
            </Link>{' '}
            {t('auth.and', 'and')}{' '}
            <Link to="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
          </p>
        </div>

        {/* Existing user prompt */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {t('auth.hasAccount', 'Already have an account?')}{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {t('auth.loginButton', 'Sign in')}
          </Link>
        </p>
      </div>
    </div>
  )
}
