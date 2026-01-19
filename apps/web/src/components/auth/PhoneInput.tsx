import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, ChevronDown, X } from 'lucide-react'

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

// Baltic region + common countries
const COUNTRIES: Country[] = [
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
]

interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  disabled?: boolean
  error?: string | null
  autoFocus?: boolean
}

export const PhoneInput = ({
  value,
  onChange,
  disabled = false,
  error,
  autoFocus = false
}: PhoneInputProps) => {
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [localNumber, setLocalNumber] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse incoming value to extract country code and number
  useEffect(() => {
    if (value) {
      // Try to match country code
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (country) {
        setSelectedCountry(country)
        setLocalNumber(value.slice(country.dialCode.length).replace(/\s/g, ''))
      }
    }
  }, [])

  // Update parent when number changes
  useEffect(() => {
    const fullNumber = localNumber ? `${selectedCountry.dialCode}${localNumber}` : ''
    onChange(fullNumber)
  }, [selectedCountry, localNumber, onChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const cleaned = e.target.value.replace(/\D/g, '')
    // Limit length based on country (Latvia = 8 digits)
    const maxLength = selectedCountry.code === 'LV' ? 8 : 15
    setLocalNumber(cleaned.slice(0, maxLength))
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  const clearNumber = () => {
    setLocalNumber('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Phone className="inline-block w-4 h-4 mr-2" />
        {t('auth.phone')}
      </label>
      
      <div className={`flex rounded-xl border-2 transition-colors ${
        error 
          ? 'border-red-500 dark:border-red-400' 
          : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-l-xl border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    country.code === selectedCountry.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-gray-700 dark:text-gray-300 flex-1 text-left">
                    {country.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {country.dialCode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="tel"
            value={localNumber}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder={selectedCountry.code === 'LV' ? '20000000' : '000000000'}
            className="w-full px-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-lg tracking-wider"
            autoComplete="tel-national"
          />
          
          {/* Clear button */}
          {localNumber && !disabled && (
            <button
              type="button"
              onClick={clearNumber}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {t('auth.phoneHelper', 'We\'ll send you a verification code via SMS')}
      </p>
    </div>
  )
}

export default PhoneInput
