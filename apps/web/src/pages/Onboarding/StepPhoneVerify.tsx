import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, Shield, Loader2, Check } from 'lucide-react'
import { useAuthStore, apiClient as api } from '@marketplace/shared'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export default function StepPhoneVerify({ onNext, onSkip }: Props) {
  const { t } = useTranslation()
  const { token, updateUser } = useAuthStore()
  const [step, setStep] = useState<'input' | 'otp' | 'done'>('input')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async () => {
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/phone/send-otp', { phoneNumber: phone }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/phone/link-otp', { phoneNumber: phone, code }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      updateUser(res.data.user)
      setStep('done')
      setTimeout(onNext, 800)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{t('onboarding.verified', 'You\'re verified!')}</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('onboarding.getVerified', 'Get verified \u2713')}
        </h2>
        <p className="text-gray-400 text-sm">
          {t('onboarding.verifyBody', 'Verified users get more trust and visibility. People prefer hiring verified helpers.')}
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <Phone className="inline w-4 h-4 mr-1.5" />
              {t('onboarding.phoneNumber', 'Phone number')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+371 20 000 000"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#2a2a3a] bg-[#0a0a0f] text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={sendOtp}
            disabled={loading || !phone.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboarding.sendCode', 'Send Code')}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              {t('onboarding.enterCode', 'Enter verification code')}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#2a2a3a] bg-[#0a0a0f] text-white text-center text-xl tracking-widest focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={verifyOtp}
            disabled={loading || code.length < 4}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboarding.verify', 'Verify')}
          </button>
          <button
            onClick={() => { setStep('input'); setCode(''); setError('') }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-300"
          >
            {t('onboarding.changeNumber', 'Change number')}
          </button>
        </div>
      )}

      <button onClick={onSkip} className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
        {t('onboarding.skipForNow', 'Skip for now')}
      </button>
    </div>
  )
}
