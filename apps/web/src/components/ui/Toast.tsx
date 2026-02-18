import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

const typeStyles: Record<ToastType, { bg: string; icon: string; iconBg: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    iconBg: 'bg-green-500 text-white',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    iconBg: 'bg-red-500 text-white',
    icon: '✗',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    iconBg: 'bg-amber-500 text-white',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    iconBg: 'bg-blue-500 text-white',
    icon: 'ℹ',
  },
}

export default function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const styles = typeStyles[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 rounded-xl border-2 shadow-xl ${
        styles.bg
      } ${styles.border} ${
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      }`}
    >
      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-base font-bold flex-shrink-0 ${styles.iconBg}`}>
        {styles.icon}
      </span>
      <p className="flex-1 text-gray-800 font-medium text-sm">{message}</p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl font-bold flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}
