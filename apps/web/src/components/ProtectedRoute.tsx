import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import { useAuthPrompt } from '../stores/useAuthPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, skips phone verification check (for verify-phone page itself) */
  skipPhoneCheck?: boolean;
}

export default function ProtectedRoute({ children, skipPhoneCheck = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { show, isOpen } = useAuthPrompt();

  // If not authenticated, show the auth bottom sheet
  useEffect(() => {
    if (!isAuthenticated && !isOpen) {
      show(() => {
        // On success, the component will re-render with isAuthenticated = true
        // and show the children naturally. No navigation needed.
      });
    }
  }, [isAuthenticated, isOpen, show]);

  // Listen for the sheet being dismissed without login — go back to home
  useEffect(() => {
    // If not authenticated and sheet was just closed (not open), navigate away
    const unsubscribe = useAuthPrompt.subscribe((state, prevState) => {
      if (prevState.isOpen && !state.isOpen && !useAuthStore.getState().isAuthenticated) {
        navigate('/', { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Not logged in — show a minimal placeholder while the sheet is up
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // TODO: Re-enable before production launch
  // Logged in but phone not verified → redirect to verify phone
  // Skip this check for the verify-phone page itself to avoid redirect loop
  // if (!skipPhoneCheck && user && !user.phone_verified) {
  //   return <Navigate to="/verify-phone" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
}
