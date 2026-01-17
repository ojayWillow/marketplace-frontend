import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import api from '../../api/client'

export default function CompleteProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setAuth } = useAuthStore()
  
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

  // Pre-fill email if available (and it's not the placeholder email)
  useEffect(() => {
    if (user?.email && !user.email.includes('@phone.tirgus.local')) {
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

      const { access_token, user: updatedUser } = response.data
      
      // Update local auth state with new user and token
      if (updatedUser && access_token) {
        setAuth(updatedUser, access_token)
      } else if (updatedUser) {
        // Fallback: if no new token, just update with existing token
        setAuth(updatedUser, token!)
      }
      
      setSuccess(true)
      
      // Redirect after brief success message
      setTimeout(() => {
        navigate('/tasks', { replace: true })
      }, 1500)
    } catch (err: unknown) {
      console.error('Complete profile error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } }
        const errorMsg = axiosError.response?.data?.error
        if (errorMsg?.toLowerCase().includes('username') && errorMsg?.toLowerCase().includes('exists')) {
          setUsernameError(t('auth.usernameTaken', 'This username is already taken'))
        } else if (errorMsg) {
          setError(errorMsg)
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('auth.profileComplete', 'Profile Complete!')}
          </h1>
          <p className="text-gray-400">
            {t('auth.redirectingToTasks', 'Redirecting you to browse tasks...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t('auth.completeProfile', 'Complete Your Profile')}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('auth.completeProfileSubtitle', 'Just a few more details to get started')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1a24] rounded-2xl border border-[#2a2a3a] p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    ${usernameError ? 'border-red-500' : 'border-[#2a2a3a]'}
                    bg-[#0a0a0f] text-white
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder-gray-600
                  `}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.usernameHint', 'Letters, numbers, and underscores only')}
                </p>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="inline-block w-4 h-4 mr-2" />
                  {t('auth.email', 'Email')} <span className="text-gray-500">({t('common.optional', 'optional')})</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#2a2a3a] 
                    bg-[#0a0a0f] text-white 
                    focus:outline-none focus:border-blue-500 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder-gray-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.emailHint', 'Used for account recovery and notifications')}
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 
                disabled:bg-gray-700 disabled:cursor-not-allowed 
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
            className="w-full mt-3 py-3 text-gray-500 hover:text-gray-300 
              text-sm font-medium transition-colors disabled:opacity-50"
          >
            {t('auth.skipForNow', 'Skip for now')}
          </button>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          {t('auth.profilePrivacyNote', 'Your phone number is verified. Username will be visible to others.')}
        </p>
      </div>
    </div>
  )
}
