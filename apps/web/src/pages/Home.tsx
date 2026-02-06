import { useAuthStore } from '@marketplace/shared';
import LandingPage from './LandingPage';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - NOT authenticated → Show landing page (explains the platform)
 * - Authenticated → Show map (browse and interact with jobs)
 */
export default function Home() {
  const { isAuthenticated } = useAuthStore();

  // Guest users see landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Authenticated users see the map
  return <MapHomePage />;
}
