import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Camera, MapPin, Loader2, ChevronDown } from 'lucide-react'
import { useAuthStore, apiClient as api } from '@marketplace/shared'
import { COUNTRIES, CITIES, getLocalizedLabel } from '../../../../constants/locations'

interface Props {
  data: {
    username: string
    first_name: string
    last_name: string
    country: string
    city: string
    avatar_url: string
  }
  onChange: (data: Partial<Props['data']>) => void
  onNext: () => void
}

export default function StepBasicInfo({ data, onChange, onNext }: Props) {
  const { t, i18n } = useTranslation()
  const { token } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const lang = i18n.language?.split('-')[0] || 'en'

  // Get cities for the selected country
  const citiesForCountry = data.country ? (CITIES[data.country] || []) : []

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.username || data.username.length < 3) errs.username = t('onboarding.errors.usernameMin', 'Username must be at least 3 characters')
    if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) errs.username = t('onboarding.errors.usernameChars', 'Letters, numbers, and underscores only')
    if (!data.first_name?.trim()) errs.first_name = t('onboarding.errors.firstNameRequired', 'First name is required')
    if (!data.country) errs.country = t('onboarding.errors.countryRequired', 'Country is required')
    if (!data.city) errs.city = t('onboarding.errors.cityRequired', 'City is required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const handleCountryChange = (country: string) => {
    onChange({ country, city: '' }) // Reset city when country changes
    setErrors((prev) => ({ ...prev, country: '', city: '' }))
  }

  const handleCityChange = (city: string) => {
    onChange({ city })
    setErrors((prev) => ({ ...prev, city: '' }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/api/uploads/avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      onChange({ avatar_url: res.data.url })
    } catch {
      // silently fail
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-[#2a2a3a] border-2 border-dashed border-[#3a3a4a] flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors"
        >
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-gray-500" />
          )}
          {data.avatar_url && !uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </div>
      <p className="text-center text-sm text-gray-500">{t('onboarding.tapToUpload', 'Tap to add a profile photo')}</p>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <User className="inline w-4 h-4 mr-1.5" />
          {t('onboarding.username', 'Username')} *
        </label>
        <input
          type="text"
          value={data.username}
          onChange={(e) => {
            onChange({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
            setErrors((prev) => ({ ...prev, username: '' }))
          }}
          placeholder="e.g. john_doe"
          className={`w-full px-4 py-3 rounded-xl border-2 ${errors.username ? 'border-red-500' : 'border-[#2a2a3a]'} bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600`}
        />
        {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
      </div>

      {/* First + Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {t('onboarding.firstName', 'First name')} *
          </label>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => {
              onChange({ first_name: e.target.value })
              setErrors((prev) => ({ ...prev, first_name: '' }))
            }}
            placeholder="John"
            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.first_name ? 'border-red-500' : 'border-[#2a2a3a]'} bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600`}
          />
          {errors.first_name && <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {t('onboarding.lastName', 'Last name')}
          </label>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="Doe"
            className="w-full px-4 py-3 rounded-xl border-2 border-[#2a2a3a] bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <MapPin className="inline w-4 h-4 mr-1.5" />
          {t('onboarding.country', 'Country')} *
        </label>
        <div className="relative">
          <select
            value={data.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.country ? 'border-red-500' : 'border-[#2a2a3a]'} bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer`}
          >
            <option value="" disabled className="text-gray-600">
              {t('onboarding.selectCountry', 'Select country')}
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#0a0a0f]">
                {getLocalizedLabel(c.label, lang)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
        {errors.country && <p className="mt-1 text-sm text-red-400">{errors.country}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {t('onboarding.city', 'City')} *
        </label>
        <div className="relative">
          <select
            value={data.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!data.country}
            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.city ? 'border-red-500' : 'border-[#2a2a3a]'} bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <option value="" disabled className="text-gray-600">
              {data.country
                ? t('onboarding.selectCity', 'Select city')
                : t('onboarding.selectCountryFirst', 'Select a country first')}
            </option>
            {citiesForCountry.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#0a0a0f]">
                {getLocalizedLabel(c.label, lang)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
        {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
      >
        {t('onboarding.continue', 'Continue')}
      </button>
    </div>
  )
}
