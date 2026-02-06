import { useAuthStore } from '@marketplace/shared';
import LandingPage from './LandingPage';
import MapHomePage from './MapHomePage';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  // Show landing page for guests, interactive map for authenticated users
  return isAuthenticated ? <MapHomePage /> : <LandingPage />;
}
