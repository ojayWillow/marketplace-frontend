import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - NOT authenticated + no ?task= → Redirect to /welcome (landing page)
 * - NOT authenticated + ?task=ID  → Show map as guest (shared link preview)
 * - Authenticated → Show map (may auto-select a shared task via ?task=ID)
 */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is a shared task deep link
  const hasSharedTask = !!searchParams.get('task');

  useEffect(() => {
    // Only redirect to welcome if NOT a shared link
    if (!isAuthenticated && !hasSharedTask) {
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, navigate, hasSharedTask]);

  // Show map for authenticated users OR for shared task links (guest mode)
  if (!isAuthenticated && !hasSharedTask) {
    return null; // Will redirect to /welcome
  }

  return <MapHomePage />;
}
