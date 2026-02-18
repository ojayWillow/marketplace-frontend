import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - NOT authenticated + no ?task= → Redirect to /welcome (landing page)
 * - NOT authenticated + ?task=ID  → Show map as guest (shared link preview)
 * - Authenticated → Show map (may auto-select a shared task via ?task=ID)
 *
 * IMPORTANT: We store the shared-task check in a ref because
 * MobileTasksView removes ?task= from the URL after reading it.
 * Without the ref, the re-render would see hasSharedTask=false
 * and redirect the guest to /welcome.
 */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Capture once on mount — survives URL param removal by child components
  const isGuestSharedTask = useRef(
    !isAuthenticated && !!new URLSearchParams(window.location.search).get('task')
  );

  const allowGuest = isGuestSharedTask.current;

  useEffect(() => {
    if (!isAuthenticated && !allowGuest) {
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, navigate, allowGuest]);

  if (!isAuthenticated && !allowGuest) {
    return null;
  }

  return <MapHomePage />;
}
