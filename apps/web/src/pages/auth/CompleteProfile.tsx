import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User, Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle,
  MapPin, Wrench, Bell, Check, X
} from 'lucide-react'
import { useAuthStore } from '@marketplace/shared'
import { apiClient as api } from '@marketplace/shared'
import { COUNTRIES, CITIES, AVAILABLE_SKILLS, getLocalizedLabel } from '../../constants/locations'

// ── Types ──────────────────────────────────────────────────────────────

interface OnboardingData {
  // Step 1 — Identity
  username: string
  first_name: string
  last_name: string
  // Step 2 — Location & Contact
  country: string
  city: string
  email: string
  // Step 3 — Skills & About
  skills: string[]
  bio: string
  // Step 4 — Notifications
  pushNotifications: boolean
  jobAlerts: boolean
  jobAlertRadius: number
  jobAlertCategories: string[]
}

const TOTAL_STEPS = 4

const STEP_LABELS = [
  'Identity',
  'Location',
  'Skills',
  'Notifications',
]

// ── Component ──────────────────────────────────────────────────────────

export default function CompleteProfile() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setAuth } = useAuthStore()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Username availability
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form data
  const [data, setData] = useState<OnboardingData>({
    username: '',
    first_name: '',
    last_name: '',
    country: '',
    city: '',
    email: '',
    skills: [],
    bio: '',
    pushNotifications: false,
    jobAlerts: false,
    jobAlertRadius: 10,
    jobAlertCategories: [],
  })

  // Step-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // ── Auth guard ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true })
      return
    }
    if (user?.username && !user.username.startsWith('user_')) {
      if (user?.onboarding_completed) {
        navigate('/tasks', { replace: true })
      }
    }
  }, [isAuthenticated, token, user, navigate])

  // Pre-fill email if real
  useEffect(() => {
    if (user?.email && !user.email.includes('@phone.kolab.local')) {
      setData(d => ({ ...d, email: user.email! }))
    }
  }, [user])

  // ── Username availability check (debounced) ────────────────────────

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setUsernameChecking(true)
    try {
      const res = await api.get(`/api/auth/check-username/${username.toLowerCase()}`)
      setUsernameAvailable(res.data.available)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setUsernameChecking(false)
    }
  }, [])

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setData(d => ({ ...d, username: clean }))
    setUsernameAvailable(null)
    if (fieldErrors.username) setFieldErrors(e => ({ ...e, username: '' }))

    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    if (clean.length >= 3) {
      usernameTimerRef.current = setTimeout(() => checkUsername(clean), 500)
    }
  }

  // ── Validation per step ────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {}

    if (s === 1) {
      if (!data.username || data.username.length < 3) {
        errors.username = t('auth.usernameTooShort', 'Username must be at least 3 characters')
      } else if (data.username.length > 30) {
        errors.username = t('auth.usernameTooLong', 'Username must be less than 30 characters')
      } else if (!/^[a-z0-9_]+$/.test(data.username)) {
        errors.username = t('auth.usernameInvalid', 'Letters, numbers, and underscores only')
      } else if (usernameAvailable === false) {
        errors.username = t('auth.usernameTaken', 'This username is already taken')
      }
      if (!data.first_name.trim()) {
        errors.first_name = t('auth.firstNameRequired', 'First name is required')
      }
      if (!data.last_name.trim()) {
        errors.last_name = t('auth.lastNameRequired', 'Last name is required')
      }
    }

    if (s === 2) {
      if (data.email && (!/\S+@\S+\.\S+/.test(data.email))) {
        errors.email = t('auth.invalidEmail', 'Invalid email format')
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Navigation ─────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  // ── Submit ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const payload: Record<string, unknown> = {
        username: data.username.toLowerCase(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      }
      if (data.email) payload.email = data.email.toLowerCase()
      if (data.country) payload.country = data.country
      if (data.city) payload.city = data.city
      if (data.skills.length > 0) payload.skills = data.skills
      if (data.bio.trim()) payload.bio = data.bio.trim()
      if (data.jobAlerts || data.pushNotifications) {
        payload.job_alert_preferences = {
          enabled: data.jobAlerts,
          radius_km: data.jobAlertRadius,
          categories: data.jobAlertCategories,
        }
      }

      const res = await api.put('/api/auth/complete-registration', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const { access_token, user: updatedUser } = res.data
      if (updatedUser && access_token) {
        setAuth(updatedUser, access_token)
      } else if (updatedUser) {
        setAuth(updatedUser, token!)
      }

      // Request push notification permission if opted in
      if (data.pushNotifications && 'Notification' in window) {
        try { await Notification.requestPermission() } catch { /* ignore */ }
      }

      setSuccess(true)
      setTimeout(() => navigate('/tasks', { replace: true }), 1500)
    } catch (err: unknown) {
      console.error('Onboarding error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error || t('auth.profileUpdateError', 'Failed to complete setup. Please try again.'))
      } else {
        setError(t('auth.profileUpdateError', 'Failed to complete setup. Please try again.'))
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────

  const availableCities = data.country ? (CITIES[data.country] || []) : []

  const toggleSkill = (key: string) => {
    setData(d => ({
      ...d,
      skills: d.skills.includes(key)
        ? d.skills.filter(s => s !== key)
        : [...d.skills, key],
    }))
  }

  const toggleAlertCategory = (key: string) => {
    setData(d => ({
      ...d,
      jobAlertCategories: d.jobAlertCategories.includes(key)
        ? d.jobAlertCategories.filter(s => s !== key)
        : [...d.jobAlertCategories, key],
    }))
  }

  // ── Input component helper ─────────────────────────────────────────

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border-2 transition-colors bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600 ${
      hasError ? 'border-red-500' : 'border-[#2a2a3a]'
    }`

  // ── Success screen ─────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('auth.profileComplete', 'Welcome to Kolab!')}
          </h1>
          <p className="text-gray-400">
            {t('auth.redirectingToTasks', 'Redirecting you to browse tasks...')}
          </p>
        </div>
      </div>
    )
  }

  // ── Progress bar ───────────────────────────────────────────────────

  const ProgressBar = () => (
    <div className="mb-8">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-3">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const isActive = stepNum === step
          const isDone = stepNum < step
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#2a2a3a] text-gray-500'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${
                isActive ? 'text-blue-400' : isDone ? 'text-green-400' : 'text-gray-600'
              }`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
      {/* Bar */}
      <div className="h-1 bg-[#2a2a3a] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">
        Step {step} of {TOTAL_STEPS}
      </p>
    </div>
  )

  // ── Step renderers ─────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">
          {t('onboarding.identityTitle', 'Choose your name on Kolab')}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t('onboarding.identitySubtitle', 'This is how others will see you')}
        </p>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="inline-block w-4 h-4 mr-2" />
          {t('auth.username', 'Display Name')} *
        </label>
        <div className="relative">
          <input
            type="text"
            value={data.username}
            onChange={e => handleUsernameChange(e.target.value)}
            placeholder={t('auth.usernamePlaceholder', 'e.g., john_doe')}
            autoFocus
            maxLength={30}
            className={inputClass(!!fieldErrors.username)}
          />
          {/* Availability indicator */}
          {data.username.length >= 3 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameChecking ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : usernameAvailable === true ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : usernameAvailable === false ? (
                <X className="w-5 h-5 text-red-400" />
              ) : null}
            </div>
          )}
        </div>
        {fieldErrors.username && (
          <p className="mt-1 text-sm text-red-400">{fieldErrors.username}</p>
        )}
        {usernameAvailable === true && (
          <p className="mt-1 text-sm text-green-400">{t('auth.usernameAvailable', 'Username is available!')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {t('auth.usernameHint', 'Letters, numbers, and underscores only')}
        </p>
      </div>

      {/* First / Last name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('profile.firstName', 'First Name')} *
          </label>
          <input
            type="text"
            value={data.first_name}
            onChange={e => {
              setData(d => ({ ...d, first_name: e.target.value }))
              if (fieldErrors.first_name) setFieldErrors(e2 => ({ ...e2, first_name: '' }))
            }}
            placeholder={t('profile.firstNamePlaceholder', 'John')}
            className={inputClass(!!fieldErrors.first_name)}
          />
          {fieldErrors.first_name && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.first_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('profile.lastName', 'Last Name')} *
          </label>
          <input
            type="text"
            value={data.last_name}
            onChange={e => {
              setData(d => ({ ...d, last_name: e.target.value }))
              if (fieldErrors.last_name) setFieldErrors(e2 => ({ ...e2, last_name: '' }))
            }}
            placeholder={t('profile.lastNamePlaceholder', 'Doe')}
            className={inputClass(!!fieldErrors.last_name)}
          />
          {fieldErrors.last_name && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.last_name}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">
          {t('onboarding.locationTitle', 'Where are you based?')}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t('onboarding.locationSubtitle', 'Helps people find help nearby')}
        </p>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MapPin className="inline-block w-4 h-4 mr-2" />
          {t('profile.country', 'Country')}
        </label>
        <select
          value={data.country}
          onChange={e => setData(d => ({ ...d, country: e.target.value, city: '' }))}
          className={inputClass()}
        >
          <option value="">{t('profile.selectCountry', 'Select country')}</option>
          {COUNTRIES.map(c => (
            <option key={c.value} value={c.value}>
              {getLocalizedLabel(c.label, i18n.language)}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('profile.city', 'City')}
        </label>
        <select
          value={data.city}
          onChange={e => setData(d => ({ ...d, city: e.target.value }))}
          disabled={!data.country}
          className={`${inputClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="">
            {data.country
              ? t('profile.selectCity', 'Select city')
              : t('profile.selectCountryFirst', 'Select country first')}
          </option>
          {availableCities.map(c => (
            <option key={c.value} value={c.value}>
              {getLocalizedLabel(c.label, i18n.language)}
            </option>
          ))}
        </select>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Mail className="inline-block w-4 h-4 mr-2" />
          {t('auth.email', 'Email')}{' '}
          <span className="text-gray-500">({t('common.optional', 'optional')})</span>
        </label>
        <input
          type="email"
          value={data.email}
          onChange={e => {
            setData(d => ({ ...d, email: e.target.value }))
            if (fieldErrors.email) setFieldErrors(e2 => ({ ...e2, email: '' }))
          }}
          placeholder={t('auth.emailPlaceholder', 'your@email.com')}
          className={inputClass(!!fieldErrors.email)}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {t('auth.emailHint', 'Used for account recovery and notifications')}
        </p>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">
          {t('onboarding.skillsTitle', 'What can you help with?')}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t('onboarding.skillsSubtitle', 'Select categories that match your skills')}
        </p>
      </div>

      {/* Skills chips */}
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SKILLS.map(skill => {
          const isSelected = data.skills.includes(skill.key)
          return (
            <button
              key={skill.key}
              type="button"
              onClick={() => toggleSkill(skill.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                isSelected
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm'
                  : 'bg-[#1a1a24] text-gray-400 border-[#2a2a3a] hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{skill.icon}</span>
              <span>{t(`tasks.categories.${skill.key}`, skill.label)}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 ml-0.5" />}
            </button>
          )
        })}
      </div>

      {data.skills.length > 0 && (
        <p className="text-sm text-blue-400">
          {data.skills.length} {t('onboarding.skillsSelected', 'selected')}
        </p>
      )}

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('profile.bio', 'Short Bio')}{' '}
          <span className="text-gray-500">({t('common.optional', 'optional')})</span>
        </label>
        <textarea
          value={data.bio}
          onChange={e => setData(d => ({ ...d, bio: e.target.value.slice(0, 500) }))}
          placeholder={t('onboarding.bioPlaceholder', 'Tell people a bit about yourself...')}
          rows={3}
          className={`${inputClass()} resize-none`}
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {data.bio.length}/500
        </p>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">
          {t('onboarding.notificationsTitle', 'Stay in the loop')}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t('onboarding.notificationsSubtitle', 'Choose how you want to be notified')}
        </p>
      </div>

      {/* Push notifications toggle */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('onboarding.pushNotifications', 'Push Notifications')}
              </p>
              <p className="text-gray-500 text-xs">
                {t('onboarding.pushDesc', 'Get notified about messages and updates')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setData(d => ({ ...d, pushNotifications: !d.pushNotifications }))}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              data.pushNotifications ? 'bg-blue-600' : 'bg-[#2a2a3a]'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
              data.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Job alerts toggle */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('onboarding.jobAlerts', 'Job Alerts')}
              </p>
              <p className="text-gray-500 text-xs">
                {t('onboarding.jobAlertsDesc', 'Get notified about new tasks near you')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setData(d => ({ ...d, jobAlerts: !d.jobAlerts }))}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              data.jobAlerts ? 'bg-green-600' : 'bg-[#2a2a3a]'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
              data.jobAlerts ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Expanded job alert settings */}
        {data.jobAlerts && (
          <div className="mt-4 pt-4 border-t border-[#2a2a3a] space-y-4">
            {/* Radius slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">
                  {t('onboarding.alertRadius', 'Alert Radius')}
                </label>
                <span className="text-sm text-white font-medium">{data.jobAlertRadius} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={data.jobAlertRadius}
                onChange={e => setData(d => ({ ...d, jobAlertRadius: Number(e.target.value) }))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Category filter for alerts */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('onboarding.alertCategories', 'Categories')}{' '}
                <span className="text-gray-600">({t('onboarding.alertCatHint', 'empty = all')})</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SKILLS.map(skill => {
                  const isSelected = data.jobAlertCategories.includes(skill.key)
                  return (
                    <button
                      key={skill.key}
                      type="button"
                      onClick={() => toggleAlertCategory(skill.key)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-green-600/20 text-green-400 border-green-500/50'
                          : 'bg-[#1a1a24] text-gray-500 border-[#2a2a3a] hover:text-gray-400'
                      }`}
                    >
                      {skill.icon} {t(`tasks.categories.${skill.key}`, skill.label)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── Main render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <ProgressBar />

        {/* Form card */}
        <div className="bg-[#1a1a24] rounded-2xl border border-[#2a2a3a] p-5 sm:p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3.5 px-4 border-2 border-[#2a2a3a] text-gray-300 hover:text-white hover:border-gray-500 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('common.back', 'Back')}
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading || (step === 1 && usernameChecking)}
              className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.saving', 'Saving...')}
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  {t('onboarding.finish', 'Get Started')}
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  {t('common.continue', 'Continue')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          {t('auth.profilePrivacyNote', 'Your phone number is verified. Your display name will be visible to others.')}
        </p>
      </div>
    </div>
  )
}
