import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - ?task=ID present        → Redirect to /tasks/ID (shared link)
 * - NOT authenticated       → Redirect to /welcome (landing page)
 * - Authenticated           → Show map
 */
export default function Home() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Shared task deep link — redirect straight to the detail page
  // This runs BEFORE the auth check so shared links always work
  useEffect(() => {
    const taskId = searchParams.get('task');
    if (taskId) {
      navigate(`/tasks/${taskId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Auth redirect — only after auth state is fully restored
  // Without isInitialized check, this fires before Supabase session
  // is loaded from IndexedDB, causing shared links to redirect to /welcome
  // on slower devices (iPhone 12, etc.)
  useEffect(() => {
    if (!isInitialized) return; // Wait for Supabase session restore
    if (!isAuthenticated && !searchParams.get('task')) {
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, searchParams]);

  // Show nothing while auth is loading (prevents flash)
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <MapHomePage />;
}
