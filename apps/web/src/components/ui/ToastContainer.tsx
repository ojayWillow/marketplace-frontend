import { useToastStore } from '@marketplace/shared'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-xs sm:max-w-md px-2 sm:px-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
