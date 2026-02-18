import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, skips phone verification check (for verify-phone page itself) */
  skipPhoneCheck?: boolean;
}

/**
 * Fallback guard for protected routes.
 * The primary auth gate is the AuthBottomSheet triggered at the action level
 * (MobileBottomNav tabs, Apply buttons, Contact buttons).
 * If someone somehow navigates directly to a protected URL while not
 * authenticated, this redirects them to /welcome as a safety net.
 */
export default function ProtectedRoute({ children, skipPhoneCheck = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not logged in → redirect to welcome page
  if (!isAuthenticated) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // TODO: Re-enable before production launch
  // Logged in but phone not verified → redirect to verify phone
  // Skip this check for the verify-phone page itself to avoid redirect loop
  // if (!skipPhoneCheck && user && !user.phone_verified) {
  //   return <Navigate to="/verify-phone" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
}
