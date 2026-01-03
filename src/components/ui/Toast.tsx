import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

const typeStyles: Record<ToastType, { bg: string; icon: string; iconBg: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100 text-green-600',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100 text-red-600',
    icon: '✗',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    iconBg: 'bg-yellow-100 text-yellow-600',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
        styles.bg
      } ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${styles.iconBg}`}>
        {styles.icon}
      </span>
      <p className="flex-1 text-gray-800 text-sm">{message}</p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 text-lg font-bold"
      >
        ×
      </button>
    </div>
  )
}
