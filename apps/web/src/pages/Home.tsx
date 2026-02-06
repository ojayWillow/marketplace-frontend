import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - First-time visitors → Redirect to /welcome (landing page)
 * - Returning visitors who've seen landing → Show map
 * - Authenticated users → Always show map
 * 
 * UX Philosophy: Landing page is for onboarding new users,
 * but the map IS the app for everyone else.
 */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user has seen the landing page before
    const hasSeenLanding = localStorage.getItem('hasSeenLanding');
    
    // If authenticated, always show map (skip landing)
    if (isAuthenticated) {
      return;
    }
    
    // If first-time visitor (not authenticated AND hasn't seen landing)
    if (!hasSeenLanding) {
      navigate('/welcome', { replace: true });
    }
    // Otherwise, show map (returning visitor)
  }, [isAuthenticated, navigate]);

  return <MapHomePage />;
}
