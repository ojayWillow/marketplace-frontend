import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@marketplace/shared'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** If true, skips phone verification check (for verify-phone page itself) */
  skipPhoneCheck?: boolean
}

export default function ProtectedRoute({ children, skipPhoneCheck = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Not logged in at all → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but phone not verified → redirect to verify phone
  // Skip this check for the verify-phone page itself to avoid redirect loop
  if (!skipPhoneCheck && user && !user.phone_verified) {
    return <Navigate to="/verify-phone" state={{ from: location }} replace />
  }

  return <>{children}</>
}
