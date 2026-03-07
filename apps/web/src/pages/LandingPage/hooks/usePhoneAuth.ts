import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, apiClient as api, supabase } from '@marketplace/shared';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../../lib/firebase';
import type { ConfirmationResult } from '../../../lib/firebase';

export const usePhoneAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, setUser } = useAuthStore();

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

  /** Safely clear the reCAPTCHA verifier (prevents null.style crash) */
  const clearRecaptchaVerifier = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
  }, []);

  const initRecaptcha = useCallback(() => {
    if (initAttemptedRef.current && recaptchaVerifierRef.current) {
      setRecaptchaReady(true);
      return;
    }

    if (!recaptchaContainerRef.current) {
      console.log('reCAPTCHA container ref not ready, retrying...');
      setTimeout(initRecaptcha, 200);
      return;
    }

    clearRecaptchaVerifier();
    initAttemptedRef.current = true;

    try {
      console.log('Creating INVISIBLE reCAPTCHA verifier...');
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified!');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('Security check expired. Please try again.');
        }
      });

      // Wrap render() in a timeout race to prevent unhandled "Timeout" rejections
      // (KOLAB-WEB-9, KOLAB-WEB-8)
      const renderPromise = recaptchaVerifierRef.current.render();
      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('reCAPTCHA render timed out')), 15000)
      );

      Promise.race([renderPromise, timeoutPromise])
        .then(() => {
          console.log('Invisible reCAPTCHA ready');
          setRecaptchaReady(true);
        })
        .catch((err) => {
          console.warn('reCAPTCHA render error (non-fatal):', err?.message || err);
          // Still allow the user to try — reCAPTCHA may load lazily
          setRecaptchaReady(true);
        });
    } catch (err) {
      console.error('reCAPTCHA init error:', err);
      initAttemptedRef.current = false;
      setRecaptchaReady(true);
    }
  }, [clearRecaptchaVerifier]);

  useEffect(() => {
    if (step === 'phone') {
      const timer = setTimeout(initRecaptcha, 300);
      return () => clearTimeout(timer);
    }
  }, [initRecaptcha, step]);

  // Cleanup on unmount — clear BEFORE React removes DOM nodes
  // (prevents KOLAB-WEB-A: reCAPTCHA trying to access .style on removed elements)
  useEffect(() => {
    return () => {
      clearRecaptchaVerifier();
    };
  }, [clearRecaptchaVerifier]);

  useEffect(() => {
    if (otpValue.length === 6 && confirmationResult && !loading) {
      handleVerifyCode(otpValue);
    }
  }, [otpValue, confirmationResult, loading]);

  const formatPhone = (digits: string) => {
    const d = digits.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRaw = e.target.value.replace(/\D/g, '').slice(0, 8);
    setPhoneNumber(newRaw);
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
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'invisible'
        });
        await recaptchaVerifierRef.current.render();
      } catch (err) {
        console.error('Failed to reinitialize reCAPTCHA:', err);
      }
    }

    if (!recaptchaVerifierRef.current) {
      setError('Security check not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending verification code to:', fullPhone);
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current);
      console.log('Code sent successfully!');

      setConfirmationResult(confirmation);
      setStep('code');
      setOtpValue('');
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err: unknown) {
      console.error('Send code error:', err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (msg.includes('invalid-phone-number')) {
        setError('Invalid phone number format.');
      } else if (msg.includes('quota-exceeded')) {
        setError('SMS limit reached. Please try again later.');
      } else if (msg.includes('captcha-check-failed') || msg.includes('recaptcha')) {
        setError('Security check failed. Please refresh and try again.');
      } else if (msg.includes('been removed')) {
        setError('Please refresh the page and try again.');
      } else {
        setError('Failed to send code. Please try again.');
      }

      initAttemptedRef.current = false;
      clearRecaptchaVerifier();
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
      console.log('Verifying code...');
      const result = await confirmationResult.confirm(code);
      console.log('Firebase verification successful');

      const idToken = await result.user.getIdToken();
      console.log('Got Firebase ID token, calling backend...');

      const response = await api.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: getFullPhone()
      });

      const {
        access_token,
        refresh_token,
        token_type,
        user: userData,
        is_new_user,
      } = response.data;

      if (token_type === 'supabase' && access_token && refresh_token) {
        if (userData) {
          setUser(userData);
        }
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        console.log('Supabase session set successfully');
      } else if (access_token && userData) {
        setAuth(userData, access_token);
      }

      // IMPORTANT: Clear reCAPTCHA verifier BEFORE navigating away.
      // This prevents KOLAB-WEB-A where reCAPTCHA's internal setTimeout
      // tries to access .style on DOM elements that no longer exist
      // after React unmounts the LandingPage component.
      clearRecaptchaVerifier();

      if (is_new_user || userData?.username?.startsWith('user_')) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      console.error('Verify error:', err);
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
    clearRecaptchaVerifier();
    setTimeout(initRecaptcha, 300);
  };

  return {
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
    handlePhoneChange,
    getFullPhone,
    handleSendCode,
    handleOtpChange,
    focusOtpInput,
    resetToPhoneStep,
  };
};
