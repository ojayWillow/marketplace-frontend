import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone } from 'lucide-react'
import { useLogin } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import ErrorMessage from '../../components/ui/ErrorMessage'

// Eye icons as simple SVG components
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

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

  // If already authenticated but needs phone verification, redirect
  if (isAuthenticated && user && !user.phone_verified) {
    navigate('/verify-phone', { replace: true })
    return null
  }

  // If fully authenticated, redirect to home
  if (isAuthenticated && user?.phone_verified) {
    navigate('/', { replace: true })
    return null
  }

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

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('auth.loginTitle')}
            </h1>
          </div>

          {login.isError && (
            <ErrorMessage
              message={t('auth.loginError')}
              className="mb-6"
            />
          )}

          {/* Phone Login Button - Primary option */}
          <Link
            to="/phone-login"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mb-6"
          >
            <Phone className="w-5 h-5" />
            Sign in with Phone
          </Link>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label mb-0">
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full py-3"
            >
              {login.isPending ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>

          {/* Info about phone verification */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Phone verification is required to use Tirgus. After logging in with email, you'll need to verify your phone number.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('common.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
