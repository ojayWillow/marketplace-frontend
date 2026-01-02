import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../../api/hooks/useAuth'
import Alert from '../../components/ui/Alert'

export default function Register() {
  const { t } = useTranslation()
  const register = useRegister()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('errors.required')
    }
    if (!formData.email.trim()) {
      newErrors.email = t('errors.required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail')
    }
    if (formData.password.length < 6) {
      newErrors.password = t('errors.passwordMin')
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      register.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center text-secondary-900 mb-6">
            {t('auth.registerTitle')}
          </h1>

          {register.isError && (
            <div className="mb-4">
              <Alert type="error">{t('auth.registerError')}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                {t('auth.name')}
              </label>
              <input
                type="text"
                id="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="label">
                {t('auth.phone')} <span className="text-secondary-400">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+371 20000000"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={register.isPending}
            >
              {register.isPending ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          <p className="mt-6 text-center text-secondary-600">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
