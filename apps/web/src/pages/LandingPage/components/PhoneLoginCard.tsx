import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Map as MapIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePhoneAuth } from '../hooks';
import { useLogin } from '../../../hooks/useAuth';

const OTPDisplay = ({
  otpValue,
  loading,
  otpInputRef,
  handleOtpChange,
  focusOtpInput,
}: {
  otpValue: string;
  loading: boolean;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusOtpInput: () => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const digits = otpValue.split('');

  return (
    <div className="relative mb-4">
      <input
        ref={otpInputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={otpValue}
        onChange={handleOtpChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 w-full h-full top-0 left-0 z-10"
        maxLength={6}
        disabled={loading}
        style={{ caretColor: 'transparent' }}
      />

      <div className="flex justify-center gap-1.5 sm:gap-2 cursor-text" onClick={focusOtpInput}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-white dark:bg-[#0f0f1a] text-gray-900 dark:text-white rounded-lg border transition-colors ${
              isFocused && index === digits.length ? 'border-blue-500' : digits[index] ? 'border-blue-500/50' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {digits[index] || ''}
            {isFocused && index === digits.length && <span className="animate-pulse text-blue-500 dark:text-blue-400">|</span>}
          </div>
        ))}
      </div>

      {otpValue.length === 6 && loading && (
        <p className="text-center text-blue-600 dark:text-blue-400 text-sm mt-2 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('landing.login.verifying')}
        </p>
      )}
    </div>
  );
};

const PhoneLoginCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useLogin();
  const {
    phoneNumber,
    setPhoneNumber,
    step,
    otpValue,
    loading,
    error,
    recaptchaReady,
    recaptchaContainerRef,
    otpInputRef,
    formatPhone,
    getFullPhone,
    handleSendCode,
    handleOtpChange,
    focusOtpInput,
    resetToPhoneStep,
  } = usePhoneAuth();

  // Inline email login state
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(emailForm);
  };

  return (
    <div className="lg:pl-8">
      <div ref={recaptchaContainerRef} id="recaptcha-container-global" />
      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-600/50 shadow-xl dark:shadow-[0_0_40px_rgba(59,130,246,0.06),0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-5 lg:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2">{t('landing.login.title')}</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm lg:text-base">{t('landing.login.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* ===== PHONE LOGIN (default) ===== */}
        {step === 'phone' && !showEmailLogin && (
          <form onSubmit={handleSendCode}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              {t('landing.login.phoneLabel')}
            </label>

            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] rounded-xl border border-gray-300 dark:border-gray-600/50 flex-shrink-0">
                <span className="text-base sm:text-lg">🇱🇻</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">+371</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="tel"
                value={formatPhone(phoneNumber)}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="20 000 000"
                className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600/50 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg tracking-wide"
                maxLength={11}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
              className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t('landing.login.sendingCode')}</>
              ) : !recaptchaReady ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t('landing.login.loading')}</>
              ) : (
                <>{t('landing.login.continue')} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="w-full py-3 border border-gray-300 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <MapIcon className="w-4 h-4" />
              {t('landing.login.browsing')}
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-[#1a1a24] text-gray-500 dark:text-gray-400">{t('landing.login.or')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEmailLogin(true)}
              className="w-full py-3 border border-gray-300 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {t('landing.login.emailLogin')}
            </button>
          </form>
        )}

        {/* ===== EMAIL LOGIN (inline, no page navigation) ===== */}
        {step === 'phone' && showEmailLogin && (
          <>
            <button
              type="button"
              onClick={() => setShowEmailLogin(false)}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToPhone', 'Back to phone sign in')}
            </button>

            {login.isError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{t('auth.loginError', 'Invalid email or password')}</p>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="landing-email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Mail className="w-4 h-4" /> {t('auth.email', 'Email')}
                </label>
                <input
                  type="email"
                  id="landing-email"
                  value={emailForm.email}
                  onChange={e => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600/50 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  required
                  autoFocus
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="landing-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password', 'Password')}</label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('auth.forgot', 'Forgot?')}</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="landing-password"
                    value={emailForm.password}
                    onChange={e => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f1a] text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600/50 focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={login.isPending}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {login.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('auth.signingIn', 'Signing in...')}</>
                ) : (
                  <>{t('auth.signInWithEmail', 'Sign in with Email')} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </>
        )}

        {/* ===== STEP: OTP Code ===== */}
        {step === 'code' && (
          <div>
            <p className="text-gray-500 dark:text-gray-300 text-sm text-center mb-4">
              {t('landing.login.otpPrompt')} <span className="text-gray-900 dark:text-white">{getFullPhone()}</span>
            </p>

            <OTPDisplay
              otpValue={otpValue}
              loading={loading}
              otpInputRef={otpInputRef}
              handleOtpChange={handleOtpChange}
              focusOtpInput={focusOtpInput}
            />

            <button
              onClick={resetToPhoneStep}
              className="w-full mt-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              {t('landing.login.changePhone')}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-5 lg:mt-6">
          {t('landing.login.legal')}{' '}
          <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">{t('landing.login.terms')}</Link> {t('landing.login.and')}{' '}
          <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">{t('landing.login.privacy')}</Link>
        </p>
      </div>
    </div>
  );
};

export default PhoneLoginCard;
