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
  const isUpdatingFromPaste = useRef(false)
  const lastInputTime = useRef<number>(0)

  // Sync external value with internal state (but skip if we just pasted)
  useEffect(() => {
    if (isUpdatingFromPaste.current) {
      isUpdatingFromPaste.current = false
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
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [autoFocus])

  // WebOTP API support for automatic SMS code detection (Chrome on Android)
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
          const code = credential.code.replace(/\D/g, '').slice(0, length)
          if (code.length > 0) {
            const newOtp = Array(length).fill('')
            code.split('').forEach((digit, index) => {
              newOtp[index] = digit
            })
            isUpdatingFromPaste.current = true
            setOtp(newOtp)
            onChange(newOtp.join(''))
            
            // Focus the appropriate input
            const focusIndex = Math.min(code.length, length) - 1
            if (focusIndex >= 0) {
              inputRefs.current[focusIndex]?.focus()
            }
          }
        }
      }).catch(() => {
        // WebOTP not supported or user denied - silently fail
      })
      
      return () => {
        abortController.abort()
      }
    }
  }, [length, onChange])

  const updateOtp = useCallback((newOtp: string[], focusIndex?: number) => {
    setOtp(newOtp)
    onChange(newOtp.join(''))
    
    if (focusIndex !== undefined && focusIndex >= 0 && focusIndex < length) {
      // Use setTimeout to ensure state is updated before focusing
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus()
      }, 0)
    }
  }, [length, onChange])

  const handlePasteValue = useCallback((pastedData: string, startIndex: number = 0) => {
    const cleanData = pastedData.replace(/\D/g, '').slice(0, length - startIndex)
    
    if (cleanData.length > 0) {
      const newOtp = [...otp]
      cleanData.split('').forEach((digit, i) => {
        if (startIndex + i < length) {
          newOtp[startIndex + i] = digit
        }
      })
      
      isUpdatingFromPaste.current = true
      setOtp(newOtp)
      onChange(newOtp.join(''))
      
      // Focus last filled input or last input
      const focusIndex = Math.min(startIndex + cleanData.length, length) - 1
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus()
      }, 0)
    }
  }, [length, onChange, otp])

  const handleChange = (index: number, newValue: string) => {
    const now = Date.now()
    const cleanValue = newValue.replace(/\D/g, '')
    
    // Detect autofill: multiple digits entered at once (but NOT via rapid typing)
    // Autofill typically happens all at once, typing has delays between keystrokes
    const timeSinceLastInput = now - lastInputTime.current
    const isLikelyAutofill = cleanValue.length > 1 && timeSinceLastInput > 50
    
    lastInputTime.current = now
    
    if (isLikelyAutofill) {
      // User pasted or browser autofilled multiple digits
      handlePasteValue(cleanValue, index)
      return
    }
    
    // Only allow single digit - take the last one (handles overtype)
    const digit = cleanValue.slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    
    // Move to next input if digit entered
    const nextIndex = digit && index < length - 1 ? index + 1 : undefined
    updateOtp(newOtp, nextIndex)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtp = [...otp]
      
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        newOtp[index - 1] = ''
        updateOtp(newOtp, index - 1)
      } else {
        // Clear current input
        newOtp[index] = ''
        updateOtp(newOtp)
      }
    }
    
    // Handle delete key
    if (e.key === 'Delete') {
      e.preventDefault()
      const newOtp = [...otp]
      newOtp[index] = ''
      updateOtp(newOtp)
    }
    
    // Handle arrow keys
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
    // Start pasting from the first box
    handlePasteValue(pastedData, 0)
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
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            maxLength={2}
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
