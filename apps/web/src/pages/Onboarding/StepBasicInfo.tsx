import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Camera, MapPin, Loader2 } from 'lucide-react'
import { useAuthStore, apiClient as api } from '@marketplace/shared'

interface Props {
  data: {
    username: string
    first_name: string
    last_name: string
    city: string
    avatar_url: string
  }
  onChange: (data: Partial<Props['data']>) => void
  onNext: () => void
}

export default function StepBasicInfo({ data, onChange, onNext }: Props) {
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.username || data.username.length < 3) errs.username = 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(data.username || '')) errs.username = 'Letters, numbers, and underscores only'
    if (!data.first_name?.trim()) errs.first_name = 'First name is required'
    if (!data.city?.trim()) errs.city = 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
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
    <div className="space-y-6">
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
          onChange={(e) => onChange({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
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
            onChange={(e) => onChange({ first_name: e.target.value })}
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

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <MapPin className="inline w-4 h-4 mr-1.5" />
          {t('onboarding.city', 'City')} *
        </label>
        <input
          type="text"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="Riga"
          className={`w-full px-4 py-3 rounded-xl border-2 ${errors.city ? 'border-red-500' : 'border-[#2a2a3a]'} bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600`}
        />
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
