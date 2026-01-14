import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ui/ErrorMessage'

// Eye icons as simple SVG components
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

// Validation helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (username: string) => username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time validation
  const validation = useMemo(() => ({
    username: {
      isValid: isValidUsername(formData.username),
      message: formData.username.length < 3 
        ? 'Username must be at least 3 characters' 
        : 'Only letters, numbers, and underscores allowed'
    },
    email: {
      isValid: isValidEmail(formData.email),
      message: 'Please enter a valid email address'
    },
    password: {
      isValid: formData.password.length >= 6,
      message: 'Password must be at least 6 characters'
    },
    confirmPassword: {
      isValid: formData.confirmPassword === formData.password && formData.confirmPassword.length > 0,
      message: 'Passwords do not match'
    }
  }), [formData]);

  const passwordStrength = useMemo(() => 
    calculatePasswordStrength(formData.password), 
    [formData.password]
  );

  const isFormValid = Object.values(validation).every(v => v.isValid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) return;

    register.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  // Validation icon component
  const ValidationIcon = ({ isValid, show }: { isValid: boolean; show: boolean }) => {
    if (!show) return null;
    return isValid ? (
      <span className="text-green-500 text-lg">✓</span>
    ) : (
      <span className="text-red-500 text-lg">✗</span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Create your account to get started
            </p>
          </div>

          {register.isError && (
            <ErrorMessage
              message={t('auth.registerError')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Username */}
            <div>
              <label htmlFor="username" className="label flex items-center gap-1">
                {t('auth.username')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-10 ${
                    touched.username 
                      ? validation.username.isValid 
                        ? 'border-green-400 focus:ring-green-500' 
                        : 'border-red-400 focus:ring-red-500'
                      : ''
                  }`}
                  required
                  autoComplete="new-username"
                  placeholder="john_doe"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ValidationIcon isValid={validation.username.isValid} show={touched.username && formData.username.length > 0} />
                </div>
              </div>
              {touched.username && !validation.username.isValid && formData.username.length > 0 && (
                <p className="text-red-500 text-xs mt-1">{validation.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label flex items-center gap-1">
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-10 ${
                    touched.email 
                      ? validation.email.isValid 
                        ? 'border-green-400 focus:ring-green-500' 
                        : 'border-red-400 focus:ring-red-500'
                      : ''
                  }`}
                  required
                  autoComplete="new-email"
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ValidationIcon isValid={validation.email.isValid} show={touched.email && formData.email.length > 0} />
                </div>
              </div>
              {touched.email && !validation.email.isValid && formData.email.length > 0 && (
                <p className="text-red-500 text-xs mt-1">{validation.email.message}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="label flex items-center gap-2">
                {t('auth.phone')} 
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">optional</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+371 20000000"
                autoComplete="new-phone"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label flex items-center gap-1">
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-12 ${
                    touched.password 
                      ? validation.password.isValid 
                        ? 'border-green-400 focus:ring-green-500' 
                        : 'border-red-400 focus:ring-red-500'
                      : ''
                  }`}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Weak' ? 'text-red-500' :
                      passwordStrength.label === 'Medium' ? 'text-yellow-600' : 'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tip: Use uppercase, numbers, and symbols for a stronger password
                  </div>
                </div>
              )}
              
              {touched.password && !validation.password.isValid && (
                <p className="text-red-500 text-xs mt-1">{validation.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label flex items-center gap-1">
                {t('auth.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-12 ${
                    touched.confirmPassword && formData.confirmPassword.length > 0
                      ? validation.confirmPassword.isValid 
                        ? 'border-green-400 focus:ring-green-500' 
                        : 'border-red-400 focus:ring-red-500'
                      : ''
                  }`}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {touched.confirmPassword && !validation.confirmPassword.isValid && formData.confirmPassword.length > 0 && (
                <p className="text-red-500 text-xs mt-1">{validation.confirmPassword.message}</p>
              )}
              {formData.confirmPassword.length > 0 && validation.confirmPassword.isValid && (
                <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Required fields note */}
            <p className="text-xs text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </p>

            <button
              type="submit"
              disabled={register.isPending || !isFormValid}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isFormValid 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {register.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating account...
                </span>
              ) : (
                t('auth.registerButton')
              )}
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
