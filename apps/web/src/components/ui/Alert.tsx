interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
}

export default function Alert({ type, children }: AlertProps) {
  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300',
  }

  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      {children}
    </div>
  )
}
