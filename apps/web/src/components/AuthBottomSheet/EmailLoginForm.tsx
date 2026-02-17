import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/useAuth';

interface EmailLoginFormProps {
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmailLoginForm({ onBack, onClose, onSuccess }: EmailLoginFormProps) {
  const { t } = useTranslation();
  const login = useLogin();
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(emailForm, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('auth.backToPhone', 'Back to phone sign in')}
      </button>

      {login.isError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">
            {t('auth.loginError', 'Invalid email or password')}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sheet-email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <Mail className="w-4 h-4" /> {t('auth.email', 'Email')}
          </label>
          <input
            type="email"
            id="sheet-email"
            value={emailForm.email}
            onChange={(e) => setEmailForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-600"
            required
            autoFocus
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sheet-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.password', 'Password')}
            </label>
            <Link to="/forgot-password" onClick={onClose} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {t('auth.forgot', 'Forgot?')}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="sheet-password"
              value={emailForm.password}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {login.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.signingIn', 'Signing in...')}</>
          ) : (
            <>{t('auth.signInWithEmail', 'Sign in with Email')} <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </>
  );
}
