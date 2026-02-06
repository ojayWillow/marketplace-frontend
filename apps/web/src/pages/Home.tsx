import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - NOT authenticated → Redirect to /welcome (landing page, no nav)
 * - Authenticated → Show map (second world)
 */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect unauthenticated users to landing page
    if (!isAuthenticated) {
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Only authenticated users see the map
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <MapHomePage />;
}
