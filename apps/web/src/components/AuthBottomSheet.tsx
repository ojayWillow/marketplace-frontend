import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePhoneAuth } from './AuthBottomSheet/usePhoneAuth';
import PhoneLoginForm from './AuthBottomSheet/PhoneLoginForm';
import EmailLoginForm from './AuthBottomSheet/EmailLoginForm';
import OTPStep from './AuthBottomSheet/OTPStep';

export default function AuthBottomSheet() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const {
    phoneNumber, setPhoneNumber,
    step, otpValue, loading, error, recaptchaReady, isOpen,
    otpInputRef, recaptchaContainerRef,
    handleSendCode, handleOtpChange, focusOtpInput,
    handleClose, handleAuthSuccess, resetToPhoneStep,
    formatPhone, getFullPhone,
  } = usePhoneAuth();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset email login view when sheet closes
  useEffect(() => {
    if (!isOpen) setShowEmailLogin(false);
  }, [isOpen]);

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

      {/* Phone Login */}
      {step === 'phone' && !showEmailLogin && (
        <PhoneLoginForm
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          formatPhone={formatPhone}
          loading={loading}
          recaptchaReady={recaptchaReady}
          onSubmit={handleSendCode}
          onSwitchToEmail={() => setShowEmailLogin(true)}
        />
      )}

      {/* Email Login */}
      {step === 'phone' && showEmailLogin && (
        <EmailLoginForm
          onBack={() => setShowEmailLogin(false)}
          onClose={handleClose}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* OTP Code */}
      {step === 'code' && (
        <OTPStep
          otpValue={otpValue}
          loading={loading}
          fullPhone={getFullPhone()}
          otpInputRef={otpInputRef}
          onOtpChange={handleOtpChange}
          onFocusInput={focusOtpInput}
          onChangePhone={resetToPhoneStep}
        />
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
        <div
          className="fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
          style={{
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
          <div className="px-5 pb-4">
            {sheetContent}
          </div>
        </div>
      ) : (
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
