import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'

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

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.phone_verified) {
        navigate('/verify-phone', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-gray-400">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-gray-400">Welcome back to Tirgus</p>
        </div>

        {/* Phone Login Button - Primary option */}
        <Link
          to="/phone-login"
          className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-6"
        >
          <Phone className="w-5 h-5" />
          Sign in with Phone
          <ArrowRight className="w-5 h-5 ml-auto" />
        </Link>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Error message */}
        {login.isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{t('auth.loginError')}</p>
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot Password?
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
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {login.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                {t('auth.loginButton')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Info about phone verification */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> Phone verification is required to use Tirgus. After logging in with email, you'll need to verify your phone number.
          </p>
        </div>

        {/* Register link */}
        <p className="mt-6 text-center text-gray-400">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {t('common.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
