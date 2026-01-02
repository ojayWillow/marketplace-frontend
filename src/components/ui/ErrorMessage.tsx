import { useTranslation } from 'react-i18next'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  const { t } = useTranslation()

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-red-700 text-sm font-medium">
          {message || t('common.error')}
        </span>
      </div>
    </div>
  )
}
