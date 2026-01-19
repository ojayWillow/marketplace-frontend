import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, useCallback } from 'react'
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
  const hiddenInputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isInternalUpdate = useRef(false)

  // Sync external value with internal state
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    
    if (value) {
      const digits = value.replace(/\D/g, '').split('').slice(0, length)
      const newOtp = Array(length).fill('')
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
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [autoFocus])

  // WebOTP API support for automatic SMS code detection
  useEffect(() => {
    if ('OTPCredential' in window) {
      const abortController = new AbortController()
      
      navigator.credentials.get({
        // @ts-expect-error - OTPCredential is not in TypeScript types yet
        otp: { transport: ['sms'] },
        signal: abortController.signal
      }).then((otpCredential: unknown) => {
        const credential = otpCredential as { code?: string }
        if (credential?.code) {
          fillCode(credential.code)
        }
      }).catch(() => {
        // WebOTP not supported or user denied - silently fail
      })
      
      return () => {
        abortController.abort()
      }
    }
  }, [length])

  // Fill the entire code at once
  const fillCode = useCallback((code: string) => {
    const cleanCode = code.replace(/\D/g, '').slice(0, length)
    if (cleanCode.length > 0) {
      const newOtp = Array(length).fill('')
      cleanCode.split('').forEach((digit, index) => {
        newOtp[index] = digit
      })
      
      isInternalUpdate.current = true
      setOtp(newOtp)
      onChange(newOtp.join(''))
      
      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(cleanCode.length, length - 1)
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus()
      }, 10)
    }
  }, [length, onChange])

  // Handle hidden input change (catches autofill)
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '')
    if (newValue.length > 0) {
      fillCode(newValue)
      // Clear hidden input after capturing
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = ''
      }
    }
  }

  const updateOtp = useCallback((newOtp: string[], focusIndex?: number) => {
    isInternalUpdate.current = true
    setOtp(newOtp)
    onChange(newOtp.join(''))
    
    if (focusIndex !== undefined && focusIndex >= 0 && focusIndex < length) {
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus()
      }, 0)
    }
  }, [length, onChange])

  const handleChange = (index: number, newValue: string) => {
    const cleanValue = newValue.replace(/\D/g, '')
    
    // If multiple digits (paste or autofill into visible input)
    if (cleanValue.length > 1) {
      fillCode(cleanValue)
      return
    }
    
    // Single digit
    const digit = cleanValue.slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    
    // Move to next input if digit entered
    const nextIndex = digit && index < length - 1 ? index + 1 : undefined
    updateOtp(newOtp, nextIndex)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtp = [...otp]
      
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = ''
        updateOtp(newOtp, index - 1)
      } else {
        newOtp[index] = ''
        updateOtp(newOtp)
      }
    }
    
    if (e.key === 'Delete') {
      e.preventDefault()
      const newOtp = [...otp]
      newOtp[index] = ''
      updateOtp(newOtp)
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const pastedData = e.clipboardData.getData('text')
    fillCode(pastedData)
  }

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select()
  }

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <Shield className="inline-block w-4 h-4 mr-2" />
        {t('auth.verificationCode', 'Verification Code')}
      </label>

      {/* Hidden input to capture browser/PWA autofill */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        onChange={handleHiddenInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            maxLength={6}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all
              ${error
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

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('auth.otpHelper', 'Enter the 6-digit code sent to your phone')}
      </p>
    </div>
  )
}

export default OTPInput
