import { Phone, ChevronDown, ArrowRight, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PhoneLoginFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  formatPhone: (phone: string) => string;
  loading: boolean;
  recaptchaReady: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToEmail: () => void;
}

export default function PhoneLoginForm({
  phoneNumber,
  setPhoneNumber,
  formatPhone,
  loading,
  recaptchaReady,
  onSubmit,
  onSwitchToEmail,
}: PhoneLoginFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Phone className="w-4 h-4" />
        {t('landing.login.phoneLabel', 'Phone number')}
      </label>

      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
          <span className="text-base sm:text-lg">🇱🇻</span>
          <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">+371</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
        <input
          type="tel"
          value={formatPhone(phoneNumber)}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="20 000 000"
          className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 text-base sm:text-lg tracking-wide"
          maxLength={11}
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {t('landing.login.sendingCode', 'Sending code...')}</>
        ) : !recaptchaReady ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {t('landing.login.loading', 'Loading...')}</>
        ) : (
          <>{t('landing.login.continue', 'Continue')} <ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-400">{t('landing.login.or', 'or')}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchToEmail}
        className="w-full py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Mail className="w-4 h-4" />
        {t('landing.login.emailLogin', 'Sign in with Email')}
      </button>
    </form>
  );
}
