import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import api from '../../api/client'

export default function CompleteProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, updateUser } = useAuthStore()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true })
      return
    }
    
    // If user already has a proper username, redirect to tasks
    if (user?.username && !user.username.startsWith('user_')) {
      navigate('/tasks', { replace: true })
    }
  }, [isAuthenticated, token, user, navigate])

  // Pre-fill email if available
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError(t('auth.usernameRequired', 'Username is required'))
      return false
    }
    if (value.length < 3) {
      setUsernameError(t('auth.usernameTooShort', 'Username must be at least 3 characters'))
      return false
    }
    if (value.length > 30) {
      setUsernameError(t('auth.usernameTooLong', 'Username must be less than 30 characters'))
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(t('auth.usernameInvalid', 'Username can only contain letters, numbers, and underscores'))
      return false
    }
    setUsernameError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateUsername(username)) {
      return
    }

    setLoading(true)

    try {
      const response = await api.put(
        '/api/auth/complete-registration',
        { 
          username: username.toLowerCase(),
          email: email || undefined 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const { user: updatedUser } = response.data
      
      // Update local user state
      if (updatedUser) {
        updateUser(updatedUser)
      }
      
      setSuccess(true)
      
      // Redirect after brief success message
      setTimeout(() => {
        navigate('/tasks', { replace: true })
      }, 1500)
    } catch (err: unknown) {
      console.error('Complete profile error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        const detail = axiosError.response?.data?.detail
        if (detail?.includes('username') && detail?.includes('taken')) {
          setUsernameError(t('auth.usernameTaken', 'This username is already taken'))
        } else if (detail) {
          setError(detail)
        } else {
          setError(t('auth.profileUpdateError', 'Failed to update profile. Please try again.'))
        }
      } else {
        setError(t('auth.profileUpdateError', 'Failed to update profile. Please try again.'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.profileComplete', 'Profile Complete!')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.redirectingToTasks', 'Redirecting you to browse tasks...')}
          </p>
        </div>
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
            {t('auth.completeProfile', 'Complete Your Profile')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('auth.completeProfileSubtitle', 'Just a few more details to get started')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline-block w-4 h-4 mr-2" />
                  {t('auth.username', 'Username')} *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    setUsername(value)
                    if (usernameError) validateUsername(value)
                  }}
                  placeholder={t('auth.usernamePlaceholder', 'e.g., john_doe')}
                  disabled={loading}
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors
                    ${usernameError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{usernameError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.usernameHint', 'Letters, numbers, and underscores only')}
                </p>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="inline-block w-4 h-4 mr-2" />
                  {t('auth.email', 'Email')} <span className="text-gray-400">({t('common.optional', 'optional')})</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:border-blue-500 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.emailHint', 'Used for account recovery and notifications')}
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed 
                text-white font-semibold rounded-xl transition-colors 
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.saving', 'Saving...')}
                </>
              ) : (
                <>
                  {t('auth.continueToApp', 'Continue to App')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Skip option */}
          <button
            onClick={() => navigate('/tasks', { replace: true })}
            disabled={loading}
            className="w-full mt-3 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
              text-sm font-medium transition-colors disabled:opacity-50"
          >
            {t('auth.skipForNow', 'Skip for now')}
          </button>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('auth.profilePrivacyNote', 'Your phone number is verified. Username will be visible to others.')}
        </p>
      </div>
    </div>
  )
}
