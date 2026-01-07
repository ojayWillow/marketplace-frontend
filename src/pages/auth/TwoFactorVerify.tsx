import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVerify2FA } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function TwoFactorVerify() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const verify2FA = useVerify2FA()
  const pending2FA = useAuthStore((state) => state.pending2FA)
  const pendingEmail = useAuthStore((state) => state.pendingEmail)
  const clearPending2FA = useAuthStore((state) => state.clearPending2FA)
  
  const [code, setCode] = useState('')

  // Redirect if no pending 2FA
  useEffect(() => {
    if (!pending2FA) {
      navigate('/login')
    }
  }, [pending2FA, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verify2FA.mutate(code)
  }

  const handleCancel = () => {
    clearPending2FA()
    navigate('/login')
  }

  // Format code input (only digits, max 8 chars for backup codes)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase()
    if (value.length <= 8) {
      setCode(value)
    }
  }

  if (!pending2FA) return null

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
            {pendingEmail && (
              <p className="text-sm text-gray-500 mt-1">
                Logging in as {pendingEmail}
              </p>
            )}
          </div>

          {verify2FA.isError && (
            <ErrorMessage
              message="Invalid code. Please try again or use a backup code."
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="label">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={handleCodeChange}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                You can also use a backup code (8 characters)
              </p>
            </div>

            <button
              type="submit"
              disabled={verify2FA.isPending || code.length < 6}
              className="btn-primary w-full py-3"
            >
              {verify2FA.isPending ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <button
            onClick={handleCancel}
            className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
