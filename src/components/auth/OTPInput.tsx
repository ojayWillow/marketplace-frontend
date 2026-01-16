import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string | null
  autoFocus?: boolean
}

export const OTPInput = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
  autoFocus = true
}: OTPInputProps) => {
  const { t } = useTranslation()
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sync external value with internal state
  useEffect(() => {
    if (value) {
      const digits = value.split('').slice(0, length)
      const newOtp = [...Array(length).fill('')]
      digits.forEach((digit, index) => {
        newOtp[index] = digit
      })
      setOtp(newOtp)
    } else {
      setOtp(Array(length).fill(''))
    }
  }, [value, length])

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, newValue: string) => {
    // Only allow single digit
    const digit = newValue.replace(/\D/g, '').slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    onChange(newOtp.join(''))

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      const newOtp = [...Array(length).fill('')]
      pastedData.split('').forEach((digit, index) => {
        newOtp[index] = digit
      })
      setOtp(newOtp)
      onChange(newOtp.join(''))
      
      // Focus last filled input or last input
      const focusIndex = Math.min(pastedData.length, length) - 1
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleFocus = (index: number) => {
    // Select the input content on focus
    inputRefs.current[index]?.select()
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <Shield className="inline-block w-4 h-4 mr-2" />
        {t('auth.verificationCode', 'Verification Code')}
      </label>

      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            maxLength={1}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all
              ${
                error
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                  : digit
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-600'}
              focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
              text-gray-900 dark:text-white
            `}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      {/* Helper text */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('auth.otpHelper', 'Enter the 6-digit code sent to your phone')}
      </p>
    </div>
  )
}

export default OTPInput
