import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function Register() {
  const { t } = useTranslation()
  const register = useRegister()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    register.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('auth.registerTitle')}
            </h1>
          </div>

          {(register.isError || passwordError) && (
            <ErrorMessage
              message={passwordError || t('auth.registerError')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="label">
                {t('auth.username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                {t('auth.phone')} <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="btn-primary w-full py-3"
            >
              {register.isPending ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
