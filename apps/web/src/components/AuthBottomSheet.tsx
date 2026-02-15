import { useState, useEffect, useCallback } from 'react';
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
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, apiClient as api } from '@marketplace/shared';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../lib/firebase';
import type { ConfirmationResult } from '../lib/firebase';
import { useLogin } from '../hooks/useAuth';
import { useAuthPrompt } from '../stores/useAuthPrompt';
import { useIsMobile } from '../hooks/useIsMobile';
import { useRef } from 'react';

/* ─── OTP Display ─── */
function OTPDisplay({
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
}) {
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
            className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border transition-colors ${
              isFocused && index === digits.length
                ? 'border-blue-500'
                : digits[index]
                  ? 'border-blue-500/50'
                  : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {digits[index] || ''}
            {isFocused && index === digits.length && (
              <span className="animate-pulse text-blue-400">|</span>
            )}
          </div>
        ))}
      </div>
      {otpValue.length === 6 && loading && (
        <p className="text-center text-blue-500 text-sm mt-2 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('landing.login.verifying')}
        </p>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function AuthBottomSheet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isOpen, onSuccess, hide } = useAuthPrompt();
  const { setAuth } = useAuthStore();
  const login = useLogin();

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [otpValue, setOtpValue] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const initAttemptedRef = useRef(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Email login state
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // reCAPTCHA init
  const initRecaptcha = useCallback(() => {
    if (initAttemptedRef.current && recaptchaVerifierRef.current) {
      setRecaptchaReady(true);
      return;
    }
    if (!recaptchaContainerRef.current) {
      setTimeout(initRecaptcha, 200);
      return;
    }
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
    initAttemptedRef.current = true;
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('Security check expired. Please try again.');
        },
      });
      recaptchaVerifierRef.current.render().then(() => {
        setRecaptchaReady(true);
      }).catch(() => {
        setRecaptchaReady(true);
      });
    } catch (err) {
      initAttemptedRef.current = false;
      setRecaptchaReady(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && step === 'phone') {
      const timer = setTimeout(initRecaptcha, 300);
      return () => clearTimeout(timer);
    }
  }, [initRecaptcha, step, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Auto-verify OTP when 6 digits entered
  useEffect(() => {
    if (otpValue.length === 6 && confirmationResult && !loading) {
      handleVerifyCode(otpValue);
    }
  }, [otpValue, confirmationResult, loading]);

  // Handle successful email login
  useEffect(() => {
    if (login.isSuccess) {
      handleAuthSuccess();
    }
  }, [login.isSuccess]);

  const handleAuthSuccess = useCallback(() => {
    hide();
    resetState();
    if (onSuccess) {
      onSuccess();
    }
  }, [onSuccess, hide]);

  const resetState = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtpValue('');
    setError('');
    setShowEmailLogin(false);
    setEmailForm({ email: '', password: '' });
    setShowPassword(false);
    setConfirmationResult(null);
    setLoading(false);
    setRecaptchaReady(false);
    initAttemptedRef.current = false;
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
  };

  const handleClose = () => {
    hide();
    resetState();
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
  };

  const getFullPhone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.startsWith('371') ? `+${cleaned}` : `+371${cleaned}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullPhone = getFullPhone();
    if (fullPhone.length < 10) {
      setError(t('auth.invalidPhone', 'Please enter a valid phone number'));
      setLoading(false);
      return;
    }

    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { size: 'invisible' });
        await recaptchaVerifierRef.current.render();
      } catch (err) {
        console.error('Failed to reinitialize reCAPTCHA:', err);
      }
    }

    if (!recaptchaVerifierRef.current) {
      setError('Security check not loaded. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setStep('code');
      setOtpValue('');
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (msg.includes('invalid-phone-number')) {
        setError('Invalid phone number format.');
      } else if (msg.includes('quota-exceeded')) {
        setError('SMS limit reached. Please try again later.');
      } else {
        setError('Failed to send code. Please try again.');
      }
      initAttemptedRef.current = false;
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
        recaptchaVerifierRef.current = null;
      }
      setTimeout(initRecaptcha, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpValue(value);
  };

  const focusOtpInput = () => otpInputRef.current?.focus();

  const handleVerifyCode = async (code: string) => {
    if (!confirmationResult || loading || code.length !== 6) return;
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      const response = await api.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: getFullPhone(),
      });

      const { access_token, user: userData, is_new_user } = response.data;

      if (access_token && userData) {
        setAuth(userData, access_token);
        if (is_new_user || userData.username?.startsWith('user_')) {
          hide();
          resetState();
          navigate('/complete-profile');
        } else {
          handleAuthSuccess();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('invalid-verification-code')) {
        setError('Wrong code. Please check and try again.');
      } else if (msg.includes('code-expired')) {
        setError('Code expired. Please request a new one.');
        resetToPhoneStep();
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtpValue('');
      otpInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resetToPhoneStep = () => {
    setStep('phone');
    setOtpValue('');
    setError('');
    setConfirmationResult(null);
    setRecaptchaReady(false);
    initAttemptedRef.current = false;
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
    setTimeout(initRecaptcha, 300);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(emailForm);
  };

  if (!isOpen) return null;

  const sheetContent = (
    <>
      {/* Hidden reCAPTCHA container */}
      <div ref={recaptchaContainerRef} id="recaptcha-container-sheet" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('landing.login.title', 'Sign in to continue')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t('auth.sheetSubtitle', 'Quick sign in to access all features')}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* ── PHONE LOGIN (default) ── */}
      {step === 'phone' && !showEmailLogin && (
        <form onSubmit={handleSendCode}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="w-4 h-4" />
            {t('landing.login.phoneLabel', 'Phone number')}
          </label>

          <div className="flex gap-2 mb-4">
            <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <span className="text-base sm:text-lg">\u{1F1F1}\u{1F1FB}</span>
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
            onClick={() => setShowEmailLogin(true)}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {t('landing.login.emailLogin', 'Sign in with Email')}
          </button>
        </form>
      )}

      {/* ── EMAIL LOGIN ── */}
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
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {t('auth.loginError', 'Invalid email or password')}
              </p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                <Link to="/forgot-password" onClick={handleClose} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  {t('auth.forgot', 'Forgot?')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="sheet-password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
      )}

      {/* ── OTP CODE ── */}
      {step === 'code' && (
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
            {t('landing.login.otpPrompt', 'Enter the code sent to')}{' '}
            <span className="text-gray-900 dark:text-white font-medium">{getFullPhone()}</span>
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
            className="w-full mt-3 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
          >
            {t('landing.login.changePhone', 'Change phone number')}
          </button>
        </div>
      )}

      {/* Legal footer */}
      <p className="text-xs text-gray-400 text-center mt-5">
        {t('landing.login.legal', 'By continuing you agree to our')}{' '}
        <Link to="/terms" onClick={handleClose} className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('landing.login.terms', 'Terms')}
        </Link>{' '}
        {t('landing.login.and', 'and')}{' '}
        <Link to="/privacy" onClick={handleClose} className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('landing.login.privacy', 'Privacy Policy')}
        </Link>
      </p>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Sheet / Modal */}
      {isMobile ? (
        /* ── Mobile: Bottom Sheet ── */
        <div
          className="fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
          style={{
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
          <div className="px-5 pb-4">
            {sheetContent}
          </div>
        </div>
      ) : (
        /* ── Desktop: Centered Modal ── */
        <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {sheetContent}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}
