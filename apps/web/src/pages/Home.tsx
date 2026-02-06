import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - Unauthenticated users → Redirect to /welcome (landing page)
 * - Authenticated users → Show map (the app)
 * 
 * Landing page is the gateway. You must login to enter the app.
 */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If not authenticated, send to landing page
    if (!isAuthenticated) {
      navigate('/welcome', { replace: true });
    }
    // If authenticated, stay here and show map
  }, [isAuthenticated, navigate]);

  // Only render map if authenticated
  // (During redirect, this prevents flash of map content)
  if (!isAuthenticated) {
    return null;
  }

  return <MapHomePage />;
}
