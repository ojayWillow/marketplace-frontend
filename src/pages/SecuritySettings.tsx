import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { use2FAStatus, useSetup2FA, useEnable2FA, useDisable2FA, useRegenerateBackupCodes } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import ErrorMessage from '../components/ui/ErrorMessage'

export default function SecuritySettings() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  
  // API hooks
  const { data: status, isLoading: statusLoading } = use2FAStatus()
  const setup2FA = useSetup2FA()
  const enable2FA = useEnable2FA()
  const disable2FA = useDisable2FA()
  const regenerateCodes = useRegenerateBackupCodes()
  
  // UI state
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'success' | 'disable'>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  // Start 2FA setup
  const handleStartSetup = async () => {
    setError('')
    try {
      const result = await setup2FA.mutateAsync()
      setQrCode(result.qr_code)
      setSecret(result.secret)
      setStep('setup')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start setup')
    }
  }

  // Verify code and enable 2FA
  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const result = await enable2FA.mutateAsync(code)
      setBackupCodes(result.backup_codes)
      setStep('success')
      setCode('')
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code')
    }
  }

  // Disable 2FA
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await disable2FA.mutateAsync({ password, code })
      setStep('idle')
      setCode('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials')
    }
  }

  // Regenerate backup codes
  const handleRegenerate = async () => {
    setError('')
    const inputCode = prompt('Enter your current 2FA code to regenerate backup codes:')
    if (!inputCode) return
    
    try {
      const result = await regenerateCodes.mutateAsync(inputCode)
      setBackupCodes(result.backup_codes)
      setStep('success')
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code')
    }
  }

  // Format code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 6) {
      setCode(value)
    }
  }

  if (statusLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h1>
      <p className="text-gray-600 mb-8">Manage your account security and two-factor authentication.</p>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* 2FA Status Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security using an authenticator app
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status?.totp_enabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {status?.totp_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* IDLE STATE - Not enabled */}
        {step === 'idle' && !status?.totp_enabled && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Why use 2FA?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Protects your account even if password is compromised</li>
                <li>• Required 6-digit code from your phone to log in</li>
                <li>• Works with Google Authenticator, Authy, or similar apps</li>
              </ul>
            </div>
            <button
              onClick={handleStartSetup}
              disabled={setup2FA.isPending}
              className="btn-primary"
            >
              {setup2FA.isPending ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </button>
          </div>
        )}

        {/* IDLE STATE - Already enabled */}
        {step === 'idle' && status?.totp_enabled && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                ✓ Two-factor authentication is active on your account.
              </p>
              <p className="text-sm text-green-700 mt-2">
                Backup codes remaining: <strong>{status.backup_codes_remaining}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="btn-secondary"
              >
                Regenerate Backup Codes
              </button>
              <button
                onClick={() => setStep('disable')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}

        {/* SETUP STATE - Show QR code */}
        {step === 'setup' && (
          <div>
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-4">
                Scan this QR code with your authenticator app:
              </p>
              <div className="inline-block p-4 bg-white border rounded-lg shadow-sm">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            <div className="mb-6">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showSecret ? 'Hide' : 'Show'} manual entry code
              </button>
              {showSecret && (
                <div className="mt-2 p-3 bg-gray-100 rounded font-mono text-sm break-all">
                  {secret}
                </div>
              )}
            </div>

            <form onSubmit={handleEnable}>
              <label className="label">Enter the 6-digit code from your app:</label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                className="input text-center text-xl tracking-widest font-mono mb-4"
                placeholder="000000"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={enable2FA.isPending || code.length !== 6}
                  className="btn-primary flex-1"
                >
                  {enable2FA.isPending ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('idle'); setCode(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUCCESS STATE - Show backup codes */}
        {step === 'success' && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">⚠️ Save Your Backup Codes</h3>
              <p className="text-sm text-yellow-800 mb-4">
                These codes can be used to access your account if you lose your phone.
                Each code can only be used once. Store them somewhere safe!
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div key={i} className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setStep('idle'); setBackupCodes([]); }}
              className="btn-primary w-full"
            >
              I've Saved My Codes
            </button>
          </div>
        )}

        {/* DISABLE STATE */}
        {step === 'disable' && (
          <form onSubmit={handleDisable}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">
                Are you sure? This will remove 2FA protection from your account.
              </p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Your Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">2FA Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="input font-mono"
                  placeholder="000000"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={disable2FA.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {disable2FA.isPending ? 'Disabling...' : 'Disable 2FA'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('idle'); setCode(''); setPassword(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Link back to profile */}
      <div className="mt-6">
        <a href="/profile" className="text-blue-600 hover:text-blue-700">
          ← Back to Profile
        </a>
      </div>
    </div>
  )
}
