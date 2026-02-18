import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, apiClient as api } from '@marketplace/shared';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../lib/firebase';
import type { ConfirmationResult } from '../../lib/firebase';
import { useAuthPrompt } from '../../stores/useAuthPrompt';

export function usePhoneAuth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, onSuccess, hide } = useAuthPrompt();
  const { setAuth } = useAuthStore();

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

  const resetState = useCallback(() => {
    setStep('phone');
    setPhoneNumber('');
    setOtpValue('');
    setError('');
    setConfirmationResult(null);
    setLoading(false);
    setRecaptchaReady(false);
    initAttemptedRef.current = false;
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (e) { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
  }, []);

  const handleAuthSuccess = useCallback(() => {
    hide();
    resetState();
    if (onSuccess) {
      onSuccess();
    }
  }, [onSuccess, hide, resetState]);

  const handleClose = useCallback(() => {
    hide();
    resetState();
  }, [hide, resetState]);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
  };

  const getFullPhone = useCallback(() => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.startsWith('371') ? `+${cleaned}` : `+371${cleaned}`;
  }, [phoneNumber]);

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

  return {
    // State
    phoneNumber,
    setPhoneNumber,
    step,
    otpValue,
    loading,
    error,
    recaptchaReady,
    isOpen,

    // Refs
    otpInputRef,
    recaptchaContainerRef,

    // Handlers
    handleSendCode,
    handleOtpChange,
    focusOtpInput,
    handleClose,
    handleAuthSuccess,
    resetToPhoneStep,
    formatPhone,
    getFullPhone,
  };
}
