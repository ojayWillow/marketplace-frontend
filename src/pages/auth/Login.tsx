import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import { isPhoneAuthAvailable } from '../../lib/platform'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useLogin()
  const { user, isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  
  // Check if phone auth is available (not in Expo Go)
  const phoneAuthEnabled = isPhoneAuthAvailable()

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back to Tirgus</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Phone Login Button - Only show if phone auth is available */}
          {phoneAuthEnabled && (
            <>
              <Link
                to="/phone-login"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-6"
              >
                <Phone className="w-5 h-5" />
                {t('auth.signInWithPhone', 'Sign in with Phone')}
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
                    {t('auth.emailLoginOnly', 'Email Login')}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    {t('auth.phoneAuthUnavailable', 'Phone authentication is available in the production app.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {login.isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{t('auth.loginError')}</p>
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.signingIn', 'Signing in...')}
                </>
              ) : (
                <>
                  {t('auth.loginButton')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* New user prompt */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          {phoneAuthEnabled ? (
            <Link
              to="/phone-login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('auth.createAccountWithPhone', 'Create account with phone')}
            </Link>
          ) : (
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('auth.registerButton', 'Register')}
            </Link>
          )}
        </p>
      </div>
    </div>
  )
}
