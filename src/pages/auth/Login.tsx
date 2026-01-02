import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../../api/hooks/useAuth'
import Alert from '../../components/ui/Alert'

export default function Login() {
  const { t } = useTranslation()
  const login = useLogin()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(formData)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center text-secondary-900 mb-6">
            {t('auth.loginTitle')}
          </h1>

          {login.isError && (
            <div className="mb-4">
              <Alert type="error">{t('auth.loginError')}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={login.isPending}
            >
              {login.isPending ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>

          <p className="mt-6 text-center text-secondary-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              {t('common.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
