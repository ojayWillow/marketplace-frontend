import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - NOT authenticated → Redirect to /welcome (landing page, no nav)
 *   BUT if ?task=ID is present, preserve it so we can redirect back after login
 * - Authenticated → Show map (may auto-select a shared task via ?task=ID)
 */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect unauthenticated users to landing page
    if (!isAuthenticated) {
      const taskParam = searchParams.get('task');
      // Preserve ?task= so after login they land back here with the deep link
      const redirect = taskParam ? `/welcome?task=${taskParam}` : '/welcome';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Only authenticated users see the map
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <MapHomePage />;
}
