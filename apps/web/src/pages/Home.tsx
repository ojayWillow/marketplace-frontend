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
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Shared task deep link — redirect straight to the detail page
  useEffect(() => {
    const taskId = searchParams.get('task');
    if (taskId) {
      navigate(`/tasks/${taskId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (!isAuthenticated && !searchParams.get('task')) {
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  if (!isAuthenticated) {
    return null;
  }

  return <MapHomePage />;
}
