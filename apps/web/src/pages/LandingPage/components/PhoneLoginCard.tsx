import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  ArrowRight,
  Loader2,
  ChevronDown,
  Map as MapIcon
} from 'lucide-react';
import { usePhoneAuth } from '../hooks';

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
            className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-[#0a0a0f] text-white rounded-lg border transition-colors ${
              isFocused && index === digits.length ? 'border-blue-500' : digits[index] ? 'border-blue-500/50' : 'border-[#2a2a3a]'
            }`}
          >
            {digits[index] || ''}
            {isFocused && index === digits.length && <span className="animate-pulse text-blue-400">|</span>}
          </div>
        ))}
      </div>

      {otpValue.length === 6 && loading && (
        <p className="text-center text-blue-400 text-sm mt-2 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
        </p>
      )}
    </div>
  );
};

const PhoneLoginCard = () => {
  const navigate = useNavigate();
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

  return (
    <div className="lg:pl-8">
      <div ref={recaptchaContainerRef} id="recaptcha-container-global" />
      <div className="bg-[#1a1a24] rounded-2xl p-5 sm:p-6 lg:p-8 border border-[#2a2a3a] shadow-2xl">
        <div className="text-center mb-5 lg:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 lg:mb-2">Get Started</h2>
          <p className="text-gray-400 text-sm lg:text-base">Sign in with your phone number</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendCode}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>

            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] flex-shrink-0">
                <span className="text-base sm:text-lg">🇱🇻</span>
                <span className="text-gray-300 text-sm sm:text-base">+371</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              </div>
              <input
                type="tel"
                value={formatPhone(phoneNumber)}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="20 000 000"
                className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-[#0a0a0f] text-white rounded-xl border border-[#2a2a3a] focus:border-blue-500 focus:outline-none placeholder-gray-600 text-base sm:text-lg tracking-wide"
                maxLength={11}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, '').length < 8 || !recaptchaReady}
              className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending code...</>
              ) : !recaptchaReady ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
              ) : (
                <>Continue <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="w-full py-3 border border-[#2a2a3a] hover:bg-[#0a0a0f] text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <MapIcon className="w-4 h-4" />
              Just browsing? Explore the map
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a3a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1a24] text-gray-500">or</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 border border-[#2a2a3a] hover:bg-[#0a0a0f] text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Sign in with email
            </Link>
          </form>
        ) : (
          <div>
            <p className="text-gray-400 text-sm text-center mb-4">
              Enter the 6-digit code sent to <span className="text-white">{getFullPhone()}</span>
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
              className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm"
            >
              ← Change phone number
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-5 lg:mt-6">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-blue-400 hover:underline">Terms</Link> and{' '}
          <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default PhoneLoginCard;
