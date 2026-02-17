import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OTPStepProps {
  otpValue: string;
  loading: boolean;
  fullPhone: string;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  onOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusInput: () => void;
  onChangePhone: () => void;
}

function OTPDisplay({
  otpValue,
  loading,
  otpInputRef,
  onOtpChange,
  onFocusInput,
}: {
  otpValue: string;
  loading: boolean;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  onOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusInput: () => void;
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
        onChange={onOtpChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 w-full h-full top-0 left-0 z-10"
        maxLength={6}
        disabled={loading}
        style={{ caretColor: 'transparent' }}
      />
      <div className="flex justify-center gap-1.5 sm:gap-2 cursor-text" onClick={onFocusInput}>
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

export default function OTPStep({
  otpValue,
  loading,
  fullPhone,
  otpInputRef,
  onOtpChange,
  onFocusInput,
  onChangePhone,
}: OTPStepProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
        {t('landing.login.otpPrompt', 'Enter the code sent to')}{' '}
        <span className="text-gray-900 dark:text-white font-medium">{fullPhone}</span>
      </p>
      <OTPDisplay
        otpValue={otpValue}
        loading={loading}
        otpInputRef={otpInputRef}
        onOtpChange={onOtpChange}
        onFocusInput={onFocusInput}
      />
      <button
        onClick={onChangePhone}
        className="w-full mt-3 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
      >
        {t('landing.login.changePhone', 'Change phone number')}
      </button>
    </div>
  );
}
